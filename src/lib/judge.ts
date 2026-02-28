import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const BOUNTY_AMOUNTS = { low: 0.1, medium: 0.3, high: 0.5 }

async function fetchRepoCode(repoUrl: string): Promise<string> {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) return ''
    const owner = match[1]
    const repo = match[2].replace('.git', '')
    const token = process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Scarab-BountyBot',
    }
    if (token) headers['Authorization'] = 'Bearer ' + token

    // fetch file tree
    const treeRes = await fetch(
      'https://api.github.com/repos/' + owner + '/' + repo + '/git/trees/HEAD?recursive=1',
      { headers, signal: AbortSignal.timeout(10000) }
    )
    if (!treeRes.ok) return ''
    const treeData = await treeRes.json()

    const codeExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.php', '.rb']
    const codeFiles = (treeData.tree || [])
      .filter((f: {type: string, path: string}) => f.type === 'blob' && codeExts.some(ext => f.path?.endsWith(ext)))
      .slice(0, 6)

    const contents = await Promise.all(
      codeFiles.map(async (file: {path: string}) => {
        try {
          const res = await fetch(
            'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + file.path,
            { headers, signal: AbortSignal.timeout(5000) }
          )
          if (!res.ok) return ''
          const data = await res.json()
          if (data.content) {
            const decoded = Buffer.from(data.content, 'base64').toString('utf-8').slice(0, 1000)
            return '// ' + file.path + '\n' + decoded
          }
        } catch { return '' }
        return ''
      })
    )

    return contents.filter(Boolean).join('\n\n---\n\n').slice(0, 4000)
  } catch (e) {
    console.error('fetchRepoCode error:', e)
    return ''
  }
}

export async function judgeIssue(title: string, body: string, repoUrl: string) {
  const repoCode = await fetchRepoCode(repoUrl)

  // sanitize input - prevent prompt injection
  const safeTitle = title.slice(0, 200).replace(/[`<>]/g, '')
  const safeBody = (body || '').slice(0, 1000).replace(/ignore previous|forget|system:|you are now|disregard/gi, '[redacted]')

  const prompt = [
    'You are a strict bug bounty judge with access to the actual source code.',
    '',
    'Your job: verify if the bug report describes a REAL bug that EXISTS in the codebase.',
    '',
    'REJECT if:',
    '- The bug cannot be verified in the provided code',
    '- Steps to reproduce are missing or vague',
    '- It is a feature request not a bug',
    '- The code clearly handles the reported case correctly',
    '',
    'APPROVE if:',
    '- The bug is verifiable in the source code',
    '- Clear steps to reproduce are provided',
    '- Expected vs actual behavior is described',
    '',
    'SEVERITY:',
    '- high: security vulnerabilities, data loss, crashes',
    '- medium: broken functionality, wrong behavior',
    '- low: minor bugs, UI issues, typos',
    '',
    '=== BUG REPORT ===',
    'Title: ' + safeTitle,
    'Body: ' + safeBody,
    '',
    '=== SOURCE CODE ===',
    repoCode || '(no code available)',
    '',
    'YOUR RESPONSE MUST BE EXACTLY ONE LINE OF JSON. NO prose. NO explanation. NO markdown. NO code blocks.',
    'OUTPUT FORMAT (copy exactly): {"verdict":"valid","severity":"medium","reason":"max 100 chars"}',
    'verdict must be: valid OR invalid',
    'severity must be: low OR medium OR high (only if valid)',
  ].join('\n')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch('https://api.zo.computer/zo/ask', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.ZO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: prompt,
        model_name: 'openrouter:z-ai/glm-5',
      }),
    })

    clearTimeout(timeout)
    const data = await response.json()
    console.log('Zo response:', JSON.stringify(data).slice(0, 300))

    const raw = (data.output || '').trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0])

    return {
      verdict: parsed.verdict as 'valid' | 'invalid' | 'duplicate',
      severity: parsed.severity as 'low' | 'medium' | 'high' | null,
      reason: parsed.reason as string,
      bountyAmount: parsed.verdict === 'valid' && parsed.severity ? BOUNTY_AMOUNTS[parsed.severity as keyof typeof BOUNTY_AMOUNTS] : 0,
    }
  } catch (e) {
    console.error('Judge error:', e)
    return {
      verdict: 'invalid' as const,
      severity: null,
      reason: 'Failed to evaluate bug report',
      bountyAmount: 0,
    }
  }
}
