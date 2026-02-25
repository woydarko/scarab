'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

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
  submissions: Submission[]
}

const bugs = [
  { emoji: '🐛', x: 3, y: 15, size: 18, delay: 0, dur: 5 },
  { emoji: '🦗', x: 94, y: 10, size: 16, delay: 1.5, dur: 6 },
  { emoji: '🪲', x: 96, y: 55, size: 20, delay: 3, dur: 4.5 },
  { emoji: '🐝', x: 2, y: 70, size: 16, delay: 2, dur: 5.5 },
  { emoji: '🦟', x: 5, y: 40, size: 14, delay: 0.8, dur: 7 },
  { emoji: '🐛', x: 91, y: 80, size: 18, delay: 4, dur: 4 },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [repos, setRepos] = useState<Repo[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [repoUrl, setRepoUrl] = useState('')
  const [wallet, setWallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>('overview')
  const [treasury, setTreasury] = useState<{eth: string, usdc: string, address: string} | null>(null)

  useEffect(() => {
    if (session) { fetchRepos(); fetchSubmissions(); fetchTreasury() }
  }, [session])

  async function fetchTreasury() {
    const res = await fetch('/api/treasury')
    if (res.ok) setTreasury(await res.json())
  }

  async function fetchRepos() {
    const res = await fetch('/api/repos')
    if (res.ok) setRepos(await res.json())
  }

  async function fetchSubmissions() {
    const res = await fetch('/api/submissions')
    if (res.ok) setSubmissions(await res.json())
  }

  async function registerRepo(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const res = await fetch('/api/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubRepoUrl: repoUrl, ownerWallet: wallet }),
    })
    const data = await res.json()
    if (res.ok) { setMsg('success'); setRepoUrl(''); setWallet(''); fetchRepos() }
    else setMsg(data.error || 'Failed')
    setLoading(false)
  }

  const totalPaid = submissions.filter(s => s.status === 'paid').reduce((a, s) => a + (s.bountyAmount || 0), 0)
  const totalValid = submissions.filter(s => s.verdict === 'valid').length
  const totalRejected = submissions.filter(s => s.verdict === 'invalid').length

  if (status === 'loading') return (
    <div style={{minHeight:'100vh',background:'#0D0608',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(248,222,34,0.3)',fontFamily:'DM Sans',fontSize:'14px',letterSpacing:'2px'}}>loading...</div>
    </div>
  )

  if (!session) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0f0a04; font-family:'DM Sans',sans-serif; }
        .glass { background:rgba(144,12,63,0.05); backdrop-filter:blur(24px); border:1px solid rgba(248,222,34,0.10); }
        .orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; }
        .btn-primary { background:linear-gradient(135deg,#F8DE22,#e8c86a); color:#0f0a04; padding:13px 32px; border-radius:100px; font-weight:600; font-size:15px; text-decoration:none; display:inline-block; transition:all 0.25s; cursor:pointer; border:none; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(199,0,57,0.4); }
      `}</style>
      <div style={{minHeight:'100vh',background:'#0D0608',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <div className="orb" style={{width:'600px',height:'600px',background:'rgba(144,12,63,0.12)',top:'-200px',left:'-200px'}} />
        <div className="orb" style={{width:'400px',height:'400px',background:'rgba(80,140,40,0.07)',bottom:'-100px',right:'-100px'}} />
        <div className="glass" style={{borderRadius:'28px',padding:'64px 56px',textAlign:'center',maxWidth:'400px',position:'relative',zIndex:1}}>
          <span style={{fontSize:'56px',display:'block',marginBottom:'28px'}}>🪲</span>
          <h1 style={{fontFamily:'Playfair Display',fontSize:'32px',fontWeight:'700',color:'#F8DE22',letterSpacing:'-1px',marginBottom:'12px'}}>Welcome to<br/>Scarab</h1>
          <p style={{color:'rgba(248,222,34,0.4)',fontSize:'14px',marginBottom:'36px',lineHeight:'1.8',fontWeight:'300'}}>Sign in with GitHub to register your repos and start automating bug bounty payouts on Base.</p>
          <button onClick={() => signIn('github')} className="btn-primary" style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            Continue with GitHub
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0f0a04; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
        .glass { background:rgba(144,12,63,0.05); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(248,222,34,0.08); }
        .glass-strong { background:rgba(144,12,63,0.07); backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px); border:1px solid rgba(248,222,34,0.12); }
        .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .btn-primary { background:linear-gradient(135deg,#F8DE22,#e8c86a); color:#0f0a04; padding:11px 28px; border-radius:100px; font-weight:600; font-size:14px; border:none; cursor:pointer; transition:all 0.2s; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(248,222,34,0.3); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .tab-btn { padding:8px 20px; border-radius:100px; border:none; cursor:pointer; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .input-field { width:100%; background:rgba(144,12,63,0.04); border:1px solid rgba(248,222,34,0.10); border-radius:12px; padding:11px 16px; color:#F8DE22; font-size:14px; outline:none; font-family:'DM Sans',sans-serif; transition:border-color 0.2s; }
        .input-field::placeholder { color:rgba(248,222,34,0.25); }
        .input-field:focus { border-color:rgba(248,222,34,0.3); }
        @keyframes floatBug { 0%,100% { transform:translateY(0) rotate(0deg); opacity:0.25; } 50% { transform:translateY(-12px) rotate(6deg); opacity:0.45; } }
        .bug-scatter { position:fixed; pointer-events:none; animation:floatBug var(--dur) ease-in-out infinite; animation-delay:var(--delay); z-index:0; }
        .stat-card { border-radius:20px; padding:24px; transition:border-color 0.2s; }
        .stat-card:hover { border-color:rgba(248,222,34,0.2); }
        .sub-row { border-radius:16px; padding:20px 24px; transition:background 0.2s; margin-bottom:10px; }
        .sub-row:hover { background:rgba(144,12,63,0.06); }
        .repo-row { border-radius:12px; padding:14px 18px; margin-bottom:8px; transition:background 0.2s; }
        .repo-row:hover { background:rgba(144,12,63,0.05); }
      `}</style>

      {/* Background */}
      <div className="orb" style={{width:'600px',height:'600px',background:'rgba(144,12,63,0.12)',top:'-100px',left:'-200px'}} />
      <div className="orb" style={{width:'400px',height:'400px',background:'rgba(199,0,57,0.07)',top:'400px',right:'-100px'}} />
      <div className="orb" style={{width:'350px',height:'350px',background:'rgba(249,76,16,0.06)',bottom:'100px',left:'30%'}} />

      {/* Scattered bugs */}
      {bugs.map((bug, i) => (
        <span key={i} className="bug-scatter" style={{left:`${bug.x}%`,top:`${bug.y}%`,fontSize:`${bug.size}px`,'--delay':`${bug.delay}s`,'--dur':`${bug.dur}s`} as React.CSSProperties}>
          {bug.emoji}
        </span>
      ))}

      <div style={{minHeight:'100vh',color:'#F8DE22',position:'relative',zIndex:1}}>

        {/* Nav */}
        <nav style={{borderBottom:'1px solid rgba(248,222,34,0.07)',padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:50,background:'rgba(13,6,8,0.85)'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
            <span style={{fontSize:'20px'}}>🪲</span>
            <span style={{fontFamily:'Playfair Display',fontSize:'17px',fontWeight:'700',color:'#F8DE22',letterSpacing:'-0.5px'}}>Scarab</span>
          </Link>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            {session.user?.image && <img src={session.user.image} alt="" style={{width:'28px',height:'28px',borderRadius:'50%',border:'1px solid rgba(248,222,34,0.15)'}} />}
            <span style={{color:'rgba(248,222,34,0.45)',fontSize:'13px'}}>{session.user?.name}</span>
            <button onClick={() => signOut()} style={{background:'none',border:'1px solid rgba(248,222,34,0.10)',color:'rgba(248,222,34,0.4)',padding:'6px 16px',borderRadius:'100px',fontSize:'12px',cursor:'pointer',fontFamily:'DM Sans',transition:'all 0.2s'}}>
              Sign out
            </button>
          </div>
        </nav>

        <div style={{maxWidth:'1000px',margin:'0 auto',padding:'40px 24px'}}>

          {/* Header */}
          <div style={{marginBottom:'40px'}}>
            <p style={{color:'rgba(248,222,34,0.4)',fontSize:'11px',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'8px'}}>Dashboard</p>
            <h1 style={{fontFamily:'Playfair Display',fontSize:'36px',fontWeight:'700',letterSpacing:'-1.5px'}}>Your Bug Bounty Hub</h1>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'16px'}}>
            {[
              { label:'Repos', value: repos.length, emoji:'📦', color:'rgba(248,222,34,0.8)' },
              { label:'Submissions', value: submissions.length, emoji:'🐛', color:'rgba(248,222,34,0.8)' },
              { label:'Valid Bugs', value: totalValid, emoji:'✓', color:'#6aaa5a' },
              { label:'USDC Paid', value:`$${totalPaid.toFixed(1)}`, emoji:'⚡', color:'#F8DE22' },
            ].map(stat => (
              <div key={stat.label} className="glass stat-card">
                <div style={{fontSize:'22px',marginBottom:'12px'}}>{stat.emoji}</div>
                <div style={{fontFamily:'Playfair Display',fontSize:'32px',fontWeight:'700',color:stat.color,marginBottom:'4px',letterSpacing:'-1px'}}>{stat.value}</div>
                <div style={{fontSize:'12px',color:'rgba(248,222,34,0.35)',letterSpacing:'0.5px'}}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Treasury */}
          <div className="glass" style={{borderRadius:'16px',padding:'16px 24px',marginBottom:'28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'18px'}}>🏛️</span>
              <div>
                <p style={{fontSize:'11px',color:'rgba(248,222,34,0.35)',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'2px'}}>Treasury Wallet</p>
                <p style={{fontFamily:'monospace',fontSize:'12px',color:'rgba(248,222,34,0.4)'}}>{treasury?.address ? `${treasury.address.slice(0,10)}...${treasury.address.slice(-6)}` : '—'}</p>
              </div>
            </div>
            <div style={{display:'flex',gap:'32px'}}>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:'11px',color:'rgba(248,222,34,0.35)',letterSpacing:'1px',marginBottom:'2px'}}>ETH</p>
                <p style={{fontFamily:'Playfair Display',fontSize:'18px',fontWeight:'700',color:'rgba(248,222,34,0.7)'}}>{treasury ? parseFloat(treasury.eth).toFixed(4) : '—'}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:'11px',color:'rgba(248,222,34,0.35)',letterSpacing:'1px',marginBottom:'2px'}}>USDC</p>
                <p style={{fontFamily:'Playfair Display',fontSize:'18px',fontWeight:'700',color:'#F8DE22'}}>${treasury ? parseFloat(treasury.usdc).toFixed(2) : '—'}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:'4px',marginBottom:'28px',background:'rgba(144,12,63,0.04)',border:'1px solid rgba(248,222,34,0.08)',borderRadius:'100px',padding:'4px',width:'fit-content'}}>
            {(['overview','submissions'] as const).map(tab => (
              <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                style={{background: activeTab===tab ? 'linear-gradient(135deg,#F8DE22,#e8c86a)' : 'transparent', color: activeTab===tab ? '#0D0608' : 'rgba(248,222,34,0.4)', fontWeight: activeTab===tab ? '600' : '400'}}>
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>

              {/* Register */}
              <div className="glass-strong" style={{borderRadius:'24px',padding:'32px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'28px'}}>
                  <span style={{fontSize:'24px'}}>🐛</span>
                  <div>
                    <h2 style={{fontFamily:'Playfair Display',fontSize:'18px',fontWeight:'700',letterSpacing:'-0.5px'}}>Register Repository</h2>
                    <p style={{color:'rgba(248,222,34,0.35)',fontSize:'12px',marginTop:'2px'}}>Connect a GitHub repo to Scarab</p>
                  </div>
                </div>
                <form onSubmit={registerRepo}>
                  <div style={{marginBottom:'16px'}}>
                    <label style={{fontSize:'12px',color:'rgba(248,222,34,0.4)',display:'block',marginBottom:'8px',letterSpacing:'0.5px'}}>GITHUB REPO URL</label>
                    <input type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/username/repo" required className="input-field" />
                  </div>
                  <div style={{marginBottom:'24px'}}>
                    <label style={{fontSize:'12px',color:'rgba(248,222,34,0.4)',display:'block',marginBottom:'8px',letterSpacing:'0.5px'}}>WALLET ADDRESS</label>
                    <input type="text" value={wallet} onChange={e => setWallet(e.target.value)} placeholder="0x..." required className="input-field" style={{fontFamily:'monospace'}} />
                  </div>
                  {msg==='success' && <p style={{color:'#6aaa5a',fontSize:'13px',marginBottom:'14px'}}>✓ Repo registered successfully!</p>}
                  {msg && msg!=='success' && <p style={{color:'#C70039',fontSize:'13px',marginBottom:'14px'}}>✗ {msg}</p>}
                  <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%'}}>
                    {loading ? 'Registering...' : 'Register Repo →'}
                  </button>
                </form>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                {/* Repos */}
                <div className="glass-strong" style={{borderRadius:'24px',padding:'28px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px'}}>
                    <span style={{fontSize:'18px'}}>📦</span>
                    <h2 style={{fontFamily:'Playfair Display',fontSize:'17px',fontWeight:'700',letterSpacing:'-0.5px'}}>Registered Repos</h2>
                  </div>
                  {repos.length === 0 ? (
                    <p style={{color:'rgba(248,222,34,0.25)',fontSize:'13px',fontWeight:'300'}}>No repos yet. Register one to get started.</p>
                  ) : (
                    repos.map(repo => (
                      <div key={repo.id} className="glass repo-row">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <a href={repo.githubRepoUrl} target="_blank" style={{color:'#F8DE22',textDecoration:'none',fontSize:'14px',fontWeight:'500'}}>
                              {repo.githubRepoUrl.replace('https://github.com/','')}
                            </a>
                            <p style={{color:'rgba(248,222,34,0.25)',fontSize:'11px',fontFamily:'monospace',marginTop:'3px'}}>{repo.ownerWallet.slice(0,8)}...{repo.ownerWallet.slice(-5)}</p>
                          </div>
                          <span style={{color:'rgba(248,222,34,0.3)',fontSize:'12px'}}>{repo.submissions.length} bugs</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Webhook */}
                {repos.length > 0 && (
                  <div className="glass-strong" style={{borderRadius:'24px',padding:'28px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                      <span style={{fontSize:'18px'}}>🔗</span>
                      <h2 style={{fontFamily:'Playfair Display',fontSize:'17px',fontWeight:'700',letterSpacing:'-0.5px'}}>Webhook Setup</h2>
                    </div>
                    <div style={{background:'rgba(249,76,16,0.06)',border:'1px solid rgba(248,222,34,0.10)',borderRadius:'10px',padding:'10px 14px',fontFamily:'monospace',fontSize:'11px',color:'#F8DE22',wordBreak:'break-all',marginBottom:'14px'}}>
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                      {['Content type: application/json','Events: Issues only','Issue must include: Wallet: 0x...'].map(t => (
                        <p key={t} style={{color:'rgba(248,222,34,0.3)',fontSize:'12px',fontWeight:'300'}}>· {t}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              {submissions.length === 0 ? (
                <div className="glass" style={{borderRadius:'24px',padding:'64px',textAlign:'center'}}>
                  <span style={{fontSize:'48px',display:'block',marginBottom:'16px'}}>🦗</span>
                  <p style={{fontFamily:'Playfair Display',fontSize:'22px',color:'rgba(248,222,34,0.4)',fontWeight:'700',letterSpacing:'-0.5px'}}>No submissions yet</p>
                  <p style={{color:'rgba(248,222,34,0.25)',fontSize:'13px',marginTop:'8px',fontWeight:'300'}}>Register a repo and set up the webhook to start receiving bug reports.</p>
                </div>
              ) : (
                submissions.map(sub => {
                  const severityColor = sub.severity==='high' ? '#C70039' : sub.severity==='medium' ? '#F8DE22' : '#6aaa5a'
                  const statusMap: Record<string, {color:string,label:string,bg:string}> = {
                    paid:     {color:'#6aaa5a', label:'✓ Paid',     bg:'rgba(90,138,74,0.12)'},
                    rejected: {color:'#C70039', label:'✗ Rejected', bg:'rgba(200,106,75,0.12)'},
                    judging:  {color:'#F8DE22', label:'⏳ Judging', bg:'rgba(248,222,34,0.08)'},
                    paying:   {color:'#F8DE22', label:'⏳ Paying',  bg:'rgba(248,222,34,0.08)'},
                    failed:   {color:'#C70039', label:'✗ Failed',   bg:'rgba(200,106,75,0.12)'},
                    pending:  {color:'rgba(248,222,34,0.3)', label:'· Pending', bg:'rgba(144,12,63,0.05)'},
                  }
                  const st = statusMap[sub.status] || statusMap.pending
                  return (
                    <div key={sub.id} className="glass sub-row">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontFamily:'Playfair Display',fontSize:'16px',fontWeight:'700',letterSpacing:'-0.3px',marginBottom:'6px',color:'#F8DE22'}}>{sub.issueTitle}</p>
                          <p style={{color:'rgba(248,222,34,0.28)',fontSize:'11px',fontFamily:'monospace',marginBottom:'6px'}}>{sub.submitterWallet.slice(0,14)}...{sub.submitterWallet.slice(-6)}</p>
                          {sub.aiReason && <p style={{color:'rgba(248,222,34,0.38)',fontSize:'13px',fontStyle:'italic',fontWeight:'300'}}>{sub.aiReason}</p>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px',flexShrink:0}}>
                          <span style={{background:st.bg,color:st.color,padding:'4px 12px',borderRadius:'100px',fontSize:'12px',fontWeight:'600'}}>
                            {st.label}
                          </span>
                          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            {sub.severity && <span style={{color:severityColor,fontSize:'11px',fontWeight:'600',letterSpacing:'1px',textTransform:'uppercase'}}>{sub.severity}</span>}
                            {sub.bountyAmount && sub.status==='paid' && (
                              <span style={{fontFamily:'Playfair Display',color:'#6aaa5a',fontWeight:'700',fontSize:'16px'}}>${sub.bountyAmount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {sub.txHash && sub.txHash !== 'unknown' && (
                        <div style={{marginTop:'14px',paddingTop:'14px',borderTop:'1px solid rgba(248,222,34,0.07)'}}>
                          <a href={"https://basescan.org/tx/"+sub.txHash} target="_blank" style={{color:'rgba(248,222,34,0.4)',fontSize:'11px',fontFamily:'monospace',textDecoration:'none',transition:'color 0.2s'}}>
                            basescan → {sub.txHash.slice(0,20)}...{sub.txHash.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
