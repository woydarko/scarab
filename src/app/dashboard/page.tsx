'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

interface Submission {
  id: string
  issueTitle: string
  submitterWallet: string
  verdict: string | null
  severity: string | null
  bountyAmount: number | null
  txHash: string | null
  aiReason: string | null
  status: string
  createdAt: string
  repo: { githubRepoUrl: string }
}

interface Repo {
  id: string
  githubRepoUrl: string
  ownerWallet: string
  category: string
  description: string
  submissions: Submission[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [repos, setRepos] = useState<Repo[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [repoUrl, setRepoUrl] = useState('')
  const [wallet, setWallet] = useState('')
  const [category, setCategory] = useState('web')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>('overview')
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    if (session) { fetchRepos(); fetchSubmissions() }
  }, [session])

  async function fetchRepos() {
    const res = await fetch('/api/repos')
    if (res.ok) setRepos(await res.json())
  }

  async function fetchSubmissions() {
    setLoadingSubmissions(true)
    const res = await fetch('/api/submissions')
    if (res.ok) setSubmissions(await res.json())
    setLoadingSubmissions(false)
  }

  async function registerRepo(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const res = await fetch('/api/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubRepoUrl: repoUrl, ownerWallet: wallet, category, description }),
    })
    const data = await res.json()
    if (res.ok) { setMsg('success'); setRepoUrl(''); setWallet(''); setCategory('web'); setDescription(''); fetchRepos() }
    else setMsg(data.error || 'Failed')
    setLoading(false)
  }

  const totalPaid = submissions.filter(s => s.status === 'paid').reduce((a, s) => a + (s.bountyAmount || 0), 0)
  const totalValid = submissions.filter(s => s.verdict === 'valid').length
  const totalDuplicates = submissions.filter(s => s.status === 'duplicate').length

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { background:#0D0608; font-family:'Inter',sans-serif; overflow-x:hidden; color:#F8DE22; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:#0D0608; }
    ::-webkit-scrollbar-thumb { background:#900C3F; }
    .field-label { display:block; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(248,222,34,0.35); margin-bottom:8px; }
    .input-field { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(248,222,34,0.1); border-radius:6px; padding:10px 14px; color:#F8DE22; font-size:13px; font-family:'Inter',sans-serif; outline:none; transition:border-color 0.15s; }
    .input-field::placeholder { color:rgba(248,222,34,0.2); }
    .input-field:focus { border-color:rgba(248,222,34,0.3); background:rgba(255,255,255,0.04); }
    .input-field option { background:#1a0a10; color:#F8DE22; }
    select.input-field { cursor:pointer; }
    .btn-primary { background:linear-gradient(135deg,#C70039,#F94C10); color:#F8DE22; padding:10px 20px; border-radius:6px; font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:1px; text-transform:uppercase; border:none; cursor:pointer; transition:all 0.15s; font-weight:500; }
    .btn-primary:hover { opacity:0.9; transform:translateY(-1px); box-shadow:0 4px 16px rgba(199,0,57,0.3); }
    .btn-primary:disabled { opacity:0.4; cursor:not-allowed; transform:none; box-shadow:none; }
    .card { background:rgba(255,255,255,0.02); border:1px solid rgba(248,222,34,0.08); border-radius:10px; }
    .card-header { padding:18px 24px; border-bottom:1px solid rgba(248,222,34,0.06); display:flex; align-items:center; justify-content:space-between; }
    .card-title { font-size:13px; font-weight:600; color:rgba(248,222,34,0.8); letter-spacing:0.2px; }
    .card-body { padding:20px 24px; }
    .stat-block { padding:20px 24px; background:rgba(255,255,255,0.02); border:1px solid rgba(248,222,34,0.08); border-radius:10px; transition:border-color 0.15s; }
    .stat-block:hover { border-color:rgba(248,222,34,0.15); }
    .stat-value { font-size:28px; font-weight:600; letter-spacing:-1px; margin-bottom:4px; }
    .stat-label { font-size:12px; color:rgba(248,222,34,0.35); font-weight:400; }
    .tab-bar { display:flex; border-bottom:1px solid rgba(248,222,34,0.08); margin-bottom:24px; }
    .tab-item { padding:10px 20px; font-size:13px; font-weight:500; color:rgba(248,222,34,0.35); cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all 0.15s; font-family:'Inter',sans-serif; }
    .tab-item:hover { color:rgba(248,222,34,0.6); }
    .tab-item.active { color:#F8DE22; border-bottom-color:#C70039; }
    .sub-row { padding:16px 20px; border:1px solid rgba(248,222,34,0.07); border-radius:8px; margin-bottom:8px; transition:border-color 0.15s,background 0.15s; }
    .sub-row:hover { border-color:rgba(248,222,34,0.14); background:rgba(255,255,255,0.02); }
    .sub-row:last-child { margin-bottom:0; }
    .repo-row { padding:14px 16px; border:1px solid rgba(248,222,34,0.07); border-radius:8px; margin-bottom:8px; transition:border-color 0.15s; }
    .repo-row:hover { border-color:rgba(248,222,34,0.14); }
    .repo-row:last-child { margin-bottom:0; }
    .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:4px; font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:500; letter-spacing:0.5px; }
    .code-box { background:rgba(0,0,0,0.3); border:1px solid rgba(248,222,34,0.08); border-radius:6px; padding:12px 16px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:rgba(248,222,34,0.6); word-break:break-all; }
    .section-label { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(248,222,34,0.25); margin-bottom:12px; }
    .orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .spinner { width:16px; height:16px; border:2px solid rgba(248,222,34,0.1); border-top-color:rgba(248,222,34,0.4); border-radius:50%; animation:spin 0.8s linear infinite; display:inline-block; }
  `

  if (status === 'loading') return (
    <div style={{minHeight:'100vh',background:'#0D0608',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{STYLES}</style>
      <div className="spinner" />
    </div>
  )

  if (!session) return (
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:'100vh',background:'#0D0608',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
        <div className="orb" style={{width:'500px',height:'500px',background:'rgba(144,12,63,0.1)',top:'-100px',left:'-100px'}} />
        <div style={{width:'100%',maxWidth:'380px',padding:'24px',position:'relative',zIndex:1}}>
          <div style={{textAlign:'center',marginBottom:'32px'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#900C3F,#F94C10)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',margin:'0 auto 16px'}}>🪲</div>
            <h1 style={{fontSize:'22px',fontWeight:'600',marginBottom:'8px'}}>Sign in to Scarab</h1>
            <p style={{color:'rgba(248,222,34,0.4)',fontSize:'14px',lineHeight:'1.6',fontWeight:'300'}}>Register repos and automate bug bounty payouts on Base.</p>
          </div>
          <button onClick={() => signIn('github')} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(248,222,34,0.12)',color:'#F8DE22',padding:'12px 20px',borderRadius:'8px',fontSize:'14px',cursor:'pointer',transition:'all 0.15s',fontFamily:'Inter,sans-serif',fontWeight:'500'}}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            Continue with GitHub
          </button>
        </div>
      </div>
    </>
  )

  const statusConfig: Record<string, {color:string,bg:string,label:string}> = {
    paid:      { color:'#4ade80', bg:'rgba(74,222,128,0.1)',  label:'Paid' },
    duplicate: { color:'#facc15', bg:'rgba(250,204,21,0.08)', label:'Duplicate' },
    rejected:  { color:'#f87171', bg:'rgba(248,113,113,0.1)', label:'Rejected' },
    judging:   { color:'#fb923c', bg:'rgba(251,146,60,0.1)',  label:'Judging' },
    paying:    { color:'#fb923c', bg:'rgba(251,146,60,0.1)',  label:'Paying' },
    failed:    { color:'#f87171', bg:'rgba(248,113,113,0.1)', label:'Failed' },
    pending:   { color:'rgba(248,222,34,0.3)', bg:'rgba(248,222,34,0.05)', label:'Pending' },
  }

  const severityConfig: Record<string, {color:string}> = {
    high:   { color:'#f87171' },
    medium: { color:'#fb923c' },
    low:    { color:'#4ade80' },
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="orb" style={{width:'600px',height:'600px',background:'rgba(144,12,63,0.08)',top:'-200px',left:'-200px'}} />
      <div className="orb" style={{width:'400px',height:'400px',background:'rgba(199,0,57,0.05)',bottom:'0',right:'-100px'}} />

      <div style={{minHeight:'100vh',position:'relative',zIndex:1}}>
        <Navbar />

        <div style={{maxWidth:'1040px',margin:'0 auto',padding:'36px 24px'}}>

          {/* Page header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px'}}>
            <div>
              <p style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(248,222,34,0.25)',marginBottom:'6px'}}>Dashboard</p>
              <h1 style={{fontSize:'22px',fontWeight:'600',letterSpacing:'-0.5px'}}>Bug Bounty Hub</h1>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              {session.user?.image && <img src={session.user.image} alt="" style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid rgba(248,222,34,0.1)'}} />}
              <span style={{fontSize:'13px',color:'rgba(248,222,34,0.5)'}}>{session.user?.name}</span>
              <button onClick={() => signOut()} style={{background:'none',border:'1px solid rgba(248,222,34,0.1)',color:'rgba(248,222,34,0.4)',padding:'6px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.15s'}}>
                Sign out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'32px'}}>
            {[
              { label:'Repositories',       value: repos.length,              color:'rgba(248,222,34,0.9)' },
              { label:'Valid Bugs',          value: totalValid,                color:'#4ade80' },
              { label:'USDC Paid',           value:`$${totalPaid.toFixed(2)}`, color:'#fb923c' },
              { label:'Duplicates Blocked',  value: totalDuplicates,           color:'rgba(248,222,34,0.4)' },
            ].map(s => (
              <div key={s.label} className="stat-block">
                <div className="stat-value" style={{color:s.color}}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            {([
              {id:'overview',     label:'Overview'},
              {id:'submissions',  label:`Submissions${submissions.length > 0 ? ' ('+submissions.length+')' : ''}`},
            ] as const).map(t => (
              <button key={t.id} className={'tab-item'+(activeTab===t.id?' active':'')} onClick={()=>setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',alignItems:'start'}}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Register Repository</span>
                  <Link href="/tutorial" style={{fontFamily:'IBM Plex Mono',fontSize:'10px',letterSpacing:'1px',color:'rgba(248,222,34,0.3)',textDecoration:'none',textTransform:'uppercase'}}>Tutorial →</Link>
                </div>
                <div className="card-body">
                  <form onSubmit={registerRepo}>
                    <div style={{marginBottom:'16px'}}>
                      <label className="field-label">GitHub Repo URL</label>
                      <input type="url" value={repoUrl} onChange={e=>setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" required className="input-field" />
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                      <div>
                        <label className="field-label">Category</label>
                        <select value={category} onChange={e=>setCategory(e.target.value)} className="input-field">
                          <option value="web">Web App</option>
                          <option value="mobile">Mobile</option>
                          <option value="api">API</option>
                          <option value="ai">AI Agent</option>
                          <option value="defi">DeFi</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Wallet Address</label>
                        <input type="text" value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="0x..." required className="input-field" style={{fontFamily:'IBM Plex Mono'}} />
                      </div>
                    </div>
                    <div style={{marginBottom:'20px'}}>
                      <label className="field-label">Description</label>
                      <input type="text" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Brief description of your project..." className="input-field" />
                    </div>
                    {msg==='success' && <p style={{color:'#4ade80',fontSize:'12px',marginBottom:'14px',fontFamily:'IBM Plex Mono'}}>✓ Repo registered</p>}
                    {msg && msg!=='success' && <p style={{color:'#f87171',fontSize:'12px',marginBottom:'14px',fontFamily:'IBM Plex Mono'}}>✗ {msg}</p>}
                    <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%'}}>
                      {loading ? 'Registering...' : 'Register Repository'}
                    </button>
                  </form>
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Registered Repos</span>
                    <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',color:'rgba(248,222,34,0.25)'}}>{repos.length}</span>
                  </div>
                  <div className="card-body" style={{padding:repos.length===0?'20px 24px':'12px 16px'}}>
                    {repos.length === 0 ? (
                      <p style={{color:'rgba(248,222,34,0.25)',fontSize:'13px'}}>No repos registered yet.</p>
                    ) : repos.map(repo => (
                      <div key={repo.id} className="repo-row">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px'}}>
                          <div style={{minWidth:0,flex:1}}>
                            <a href={repo.githubRepoUrl} target="_blank" style={{color:'#F8DE22',textDecoration:'none',fontSize:'13px',fontWeight:'500',fontFamily:'IBM Plex Mono',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                              {repo.githubRepoUrl.replace('https://github.com/','')}
                            </a>
                            <p style={{color:'rgba(248,222,34,0.2)',fontSize:'11px',fontFamily:'IBM Plex Mono',marginTop:'3px'}}>{repo.ownerWallet.slice(0,10)}...{repo.ownerWallet.slice(-4)}</p>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                            <span style={{fontFamily:'IBM Plex Mono',fontSize:'10px',letterSpacing:'1px',color:'rgba(249,76,16,0.7)',border:'1px solid rgba(249,76,16,0.2)',padding:'2px 8px',borderRadius:'4px',textTransform:'uppercase'}}>{repo.category||'web'}</span>
                            <span style={{color:'rgba(248,222,34,0.25)',fontSize:'12px'}}>{repo.submissions.length}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {repos.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Webhook Setup</span>
                    </div>
                    <div className="card-body">
                      <div className="section-label">Payload URL</div>
                      <div className="code-box" style={{marginBottom:'16px'}}>
                        {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook
                      </div>
                      <div className="section-label">Configuration</div>
                      <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                        {[['Content type','application/json'],['Events','Issues only'],['Required field','Wallet: 0x...']].map(([k,v]) => (
                          <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'12px'}}>
                            <span style={{color:'rgba(248,222,34,0.3)'}}>{k}</span>
                            <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',color:'rgba(248,222,34,0.5)'}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submissions */}
          {activeTab === 'submissions' && (
            <div>
              {/* Filter + Export bar */}
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px',flexWrap:'wrap'}}>
                <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1)}} className="input-field" style={{width:'auto',fontSize:'12px',padding:'7px 12px'}}>
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="judging">Judging</option>
                </select>
                <select value={filterSeverity} onChange={e=>{setFilterSeverity(e.target.value);setPage(1)}} className="input-field" style={{width:'auto',fontSize:'12px',padding:'7px 12px'}}>
                  <option value="all">All Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={() => {
                  const filtered = submissions.filter(s =>
                    (filterStatus === 'all' || s.status === filterStatus) &&
                    (filterSeverity === 'all' || s.severity === filterSeverity)
                  )
                  const csv = ['Title,Status,Severity,Bounty,Wallet,TxHash,Date',
                    ...filtered.map(s => [
                      '"'+s.issueTitle.replace(/"/g,'""')+'"',
                      s.status, s.severity||'', s.bountyAmount||'',
                      s.submitterWallet, s.txHash||'',
                      new Date(s.createdAt).toISOString()
                    ].join(','))
                  ].join('\n')
                  const blob = new Blob([csv], {type:'text/csv'})
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href=url; a.download='scarab-submissions.csv'; a.click()
                }} style={{marginLeft:'auto',background:'none',border:'1px solid rgba(248,222,34,0.1)',color:'rgba(248,222,34,0.4)',padding:'7px 14px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontFamily:'IBM Plex Mono',letterSpacing:'1px'}}>
                  Export CSV
                </button>
              </div>

              {loadingSubmissions ? (
                <div style={{textAlign:'center',padding:'48px',color:'rgba(248,222,34,0.2)',fontFamily:'IBM Plex Mono',fontSize:'12px',letterSpacing:'2px'}}>LOADING...</div>
              ) : submissions.length === 0 ? (
                <div style={{textAlign:'center',padding:'64px 24px',border:'1px solid rgba(248,222,34,0.07)',borderRadius:'10px'}}>
                  <p style={{fontSize:'14px',color:'rgba(248,222,34,0.3)',marginBottom:'8px'}}>No submissions yet</p>
                  <p style={{fontSize:'12px',color:'rgba(248,222,34,0.2)'}}>Register a repo and set up the webhook to start receiving bug reports.</p>
                </div>
              ) : (() => {
                const filtered = submissions.filter(s =>
                  (filterStatus === 'all' || s.status === filterStatus) &&
                  (filterSeverity === 'all' || s.severity === filterSeverity)
                )
                const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
                const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
                return (
                  <div>
                    {paginated.length === 0 ? (
                      <div style={{textAlign:'center',padding:'48px',color:'rgba(248,222,34,0.2)',fontSize:'13px'}}>No submissions match the filter.</div>
                    ) : paginated.map(sub => {
                      const st = statusConfig[sub.status] || statusConfig.pending
                      const sev = sub.severity ? severityConfig[sub.severity] : null
                      const date = new Date(sub.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})
                      return (
                        <div key={sub.id} className="sub-row">
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap'}}>
                                <span className="badge" style={{color:st.color,background:st.bg}}>{st.label}</span>
                                {sev && sub.status !== 'duplicate' && (
                                  <span className="badge" style={{color:sev.color,background:'rgba(255,255,255,0.04)',border:`1px solid ${sev.color}22`,textTransform:'uppercase'}}>{sub.severity}</span>
                                )}
                                {sub.bountyAmount && sub.status === 'paid' && (
                                  <span className="badge" style={{color:'#4ade80',background:'rgba(74,222,128,0.08)'}}>+${sub.bountyAmount} USDC</span>
                                )}
                              </div>
                              <p style={{fontSize:'14px',fontWeight:'500',color:'rgba(248,222,34,0.85)',marginBottom:'4px',lineHeight:'1.4'}}>{sub.issueTitle}</p>
                              {sub.aiReason && <p style={{fontSize:'12px',color:'rgba(248,222,34,0.3)',lineHeight:'1.5'}}>{sub.aiReason}</p>}
                            </div>
                            <div style={{flexShrink:0,textAlign:'right'}}>
                              <p style={{fontFamily:'IBM Plex Mono',fontSize:'10px',color:'rgba(248,222,34,0.2)',marginBottom:'4px'}}>{date}</p>
                              <p style={{fontFamily:'IBM Plex Mono',fontSize:'10px',color:'rgba(248,222,34,0.2)'}}>{sub.submitterWallet.slice(0,8)}...{sub.submitterWallet.slice(-4)}</p>
                            </div>
                          </div>
                          {sub.txHash && sub.txHash !== 'unknown' && (
                            <div style={{marginTop:'10px',paddingTop:'10px',borderTop:'1px solid rgba(248,222,34,0.05)'}}>
                              <a href={"https://basescan.org/tx/"+sub.txHash} target="_blank" style={{fontFamily:'IBM Plex Mono',fontSize:'11px',color:'rgba(248,222,34,0.3)',textDecoration:'none',display:'flex',alignItems:'center',gap:'6px',width:'fit-content'}}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                {sub.txHash.slice(0,18)}...{sub.txHash.slice(-6)}
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {totalPages > 1 && (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'16px',paddingTop:'16px',borderTop:'1px solid rgba(248,222,34,0.06)'}}>
                        <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',color:'rgba(248,222,34,0.25)'}}>
                          {filtered.length} results · Page {page}/{totalPages}
                        </span>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{background:'none',border:'1px solid rgba(248,222,34,0.1)',color:'rgba(248,222,34,0.4)',padding:'6px 12px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontFamily:'IBM Plex Mono'}}>← Prev</button>
                          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{background:'none',border:'1px solid rgba(248,222,34,0.1)',color:'rgba(248,222,34,0.4)',padding:'6px 12px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontFamily:'IBM Plex Mono'}}>Next →</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
