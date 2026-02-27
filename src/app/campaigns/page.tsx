'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Campaign {
  id: string
  githubRepoUrl: string
  repoName: string
  category: string
  description: string
  totalPaid: number
  validBugs: number
  openBugs: number
  highBugs: number
  totalSubmissions: number
  createdAt: string
}

const CATEGORIES: Record<string, { label: string, color: string }> = {
  web:      { label: 'Web App',    color: '#F94C10' },
  mobile:   { label: 'Mobile',     color: '#C70039' },
  api:      { label: 'API',        color: '#F8DE22' },
  ai:       { label: 'AI Agent',   color: '#900C3F' },
  defi:     { label: 'DeFi',       color: '#6aaa5a' },
  other:    { label: 'Other',      color: 'rgba(248,222,34,0.4)' },
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(d => { setCampaigns(d); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.category === filter)
  const totalUSDC = campaigns.reduce((a, c) => a + c.totalPaid, 0)
  const totalBugs = campaigns.reduce((a, c) => a + c.validBugs, 0)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0D0608; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
        .glass { background:rgba(144,12,63,0.05); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(248,222,34,0.08); }
        .glass-strong { background:rgba(144,12,63,0.07); backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px); border:1px solid rgba(248,222,34,0.12); }
        .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .btn-primary { background:linear-gradient(135deg,#C70039,#F94C10); color:#F8DE22; padding:10px 24px; border-radius:2px; font-family:'IBM Plex Mono',monospace; font-weight:500; font-size:12px; letter-spacing:2px; text-decoration:none; display:inline-block; text-transform:uppercase; transition:all 0.2s; border:none; cursor:pointer; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(199,0,57,0.4); }
        .filter-btn { padding:6px 16px; border-radius:2px; border:1px solid rgba(248,222,34,0.1); background:none; color:rgba(248,222,34,0.4); font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:2px; cursor:pointer; text-transform:uppercase; transition:all 0.2s; }
        .filter-btn.active { border-color:rgba(248,222,34,0.4); color:#F8DE22; background:rgba(248,222,34,0.05); }
        .filter-btn:hover { border-color:rgba(248,222,34,0.25); color:rgba(248,222,34,0.7); }
        .campaign-card { border-radius:4px; padding:28px 32px; transition:all 0.2s; cursor:default; }
        .campaign-card:hover { border-color:rgba(248,222,34,0.2); background:rgba(144,12,63,0.09); }
        .noise { position:fixed; inset:0; pointer-events:none; z-index:999; opacity:0.03; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      <div className="noise" />
      <div className="orb" style={{width:'500px',height:'500px',background:'rgba(144,12,63,0.12)',top:'-100px',left:'-200px'}} />
      <div className="orb" style={{width:'400px',height:'400px',background:'rgba(199,0,57,0.07)',bottom:'0',right:'-100px'}} />

      <div style={{minHeight:'100vh',background:'#0D0608',color:'#F8DE22',position:'relative',zIndex:1}}>

        <Navbar />

        <div style={{maxWidth:'1000px',margin:'0 auto',padding:'56px 24px'}}>

          {/* Header */}
          <div style={{marginBottom:'56px'}}>
            <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'3px',color:'rgba(199,0,57,0.7)',textTransform:'uppercase',display:'block',marginBottom:'16px'}}>◆ Active Campaigns</span>
            <h1 style={{fontFamily:'Playfair Display',fontSize:'clamp(36px,6vw,64px)',fontWeight:'700',letterSpacing:'-2px',marginBottom:'24px',lineHeight:'1'}}>Find Bugs.<br/><em style={{color:'#F94C10'}}>Earn USDC.</em></h1>
            <p style={{color:'rgba(248,222,34,0.4)',fontSize:'15px',fontWeight:'300',maxWidth:'480px',lineHeight:'1.8'}}>Browse active bug bounty campaigns. Submit valid bugs via GitHub issues and get paid automatically in USDC on Base.</p>
          </div>

          {/* Global stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',marginBottom:'48px'}}>
            {[
              {label:'Active Campaigns', value: campaigns.length},
              {label:'Total USDC Paid', value: '$'+totalUSDC.toFixed(1)},
              {label:'Bugs Verified', value: totalBugs},
            ].map((s,i) => (
              <div key={i} className="glass" style={{padding:'20px 28px',borderRadius: i===0?'4px 0 0 4px':i===2?'0 4px 4px 0':'0'}}>
                <div style={{fontFamily:'Playfair Display',fontSize:'32px',fontWeight:'700',color:'#F94C10',letterSpacing:'-1px',marginBottom:'4px'}}>{s.value}</div>
                <div style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'2px',color:'rgba(248,222,34,0.35)',textTransform:'uppercase'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{display:'flex',gap:'8px',marginBottom:'32px',flexWrap:'wrap'}}>
            {['all', 'web', 'mobile', 'api', 'ai', 'defi', 'other'].map(cat => (
              <button key={cat} className={'filter-btn' + (filter===cat?' active':'')} onClick={() => setFilter(cat)}>
                {cat === 'all' ? 'All' : CATEGORIES[cat]?.label || cat}
              </button>
            ))}
          </div>

          {/* Campaigns list */}
          {loading ? (
            <div style={{textAlign:'center',padding:'80px',fontFamily:'IBM Plex Mono',fontSize:'12px',letterSpacing:'3px',color:'rgba(248,222,34,0.25)'}}>LOADING CAMPAIGNS...</div>
          ) : filtered.length === 0 ? (
            <div className="glass" style={{borderRadius:'4px',padding:'64px',textAlign:'center'}}>
              <p style={{fontFamily:'Playfair Display',fontSize:'24px',color:'rgba(248,222,34,0.3)',fontWeight:'700'}}>No campaigns yet</p>
              <p style={{color:'rgba(248,222,34,0.2)',fontSize:'13px',marginTop:'8px',fontWeight:'300'}}>Be the first to register your repo.</p>
              <Link href="/dashboard" className="btn-primary" style={{display:'inline-block',marginTop:'24px'}}>Register Repo →</Link>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
              {filtered.map((c, i) => {
                const cat = CATEGORIES[c.category] || CATEGORIES.other
                return (
                  <div key={c.id} className="glass campaign-card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'24px'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px',flexWrap:'wrap'}}>
                          <span style={{fontFamily:'IBM Plex Mono',fontSize:'10px',letterSpacing:'2px',color:cat.color,border:'1px solid '+cat.color,padding:'3px 10px',borderRadius:'2px',textTransform:'uppercase'}}>{cat.label}</span>
                          {c.highBugs > 0 && <span style={{fontFamily:'IBM Plex Mono',fontSize:'10px',letterSpacing:'2px',color:'#C70039',border:'1px solid #C70039',padding:'3px 10px',borderRadius:'2px'}}>HIGH SEVERITY OPEN</span>}
                        </div>
                        <a href={c.githubRepoUrl} target="_blank" style={{fontFamily:'Playfair Display',fontSize:'20px',fontWeight:'700',color:'#F8DE22',textDecoration:'none',letterSpacing:'-0.5px',display:'block',marginBottom:'6px'}}>
                          {c.repoName}
                        </a>
                        <p style={{color:'rgba(248,222,34,0.35)',fontSize:'13px',fontWeight:'300',marginBottom:'16px'}}>{c.description || 'No description provided.'}</p>
                        <div style={{display:'flex',gap:'24px',flexWrap:'wrap'}}>
                          {[
                            {label:'Total Paid', value:'$'+c.totalPaid.toFixed(1)+' USDC', color:'#F8DE22'},
                            {label:'Bugs Found', value:c.validBugs, color:'#6aaa5a'},
                            {label:'Submissions', value:c.totalSubmissions, color:'rgba(248,222,34,0.5)'},
                          ].map(stat => (
                            <div key={stat.label}>
                              <div style={{fontFamily:'Playfair Display',fontSize:'20px',fontWeight:'700',color:stat.color as string}}>{stat.value}</div>
                              <div style={{fontFamily:'IBM Plex Mono',fontSize:'10px',letterSpacing:'1px',color:'rgba(248,222,34,0.25)',textTransform:'uppercase',marginTop:'2px'}}>{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{flexShrink:0,textAlign:'right'}}>
                        <div style={{marginBottom:'16px'}}>
                          <div style={{fontFamily:'IBM Plex Mono',fontSize:'10px',letterSpacing:'2px',color:'rgba(248,222,34,0.3)',marginBottom:'6px',textTransform:'uppercase'}}>Bounty Tiers</div>
                          <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                            {[
                              {sev:'LOW', amt:'$0.1', color:'#6aaa5a'},
                              {sev:'MED', amt:'$0.1', color:'#F94C10'},
                              {sev:'HIGH', amt:'$0.1', color:'#C70039'},
                            ].map(t => (
                              <div key={t.sev} style={{display:'flex',gap:'8px',alignItems:'center',justifyContent:'flex-end'}}>
                                <span style={{fontFamily:'IBM Plex Mono',fontSize:'10px',color:t.color,letterSpacing:'1px'}}>{t.sev}</span>
                                <span style={{fontFamily:'Playfair Display',fontSize:'14px',fontWeight:'700',color:t.color}}>{t.amt}</span>
                                <span style={{fontFamily:'IBM Plex Mono',fontSize:'10px',color:'rgba(248,222,34,0.3)'}}>USDC</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <a href={c.githubRepoUrl+'/issues/new?template=bug_report.md'} target="_blank" className="btn-primary" style={{fontSize:'11px',padding:'8px 16px'}}>
                          Submit Bug →
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <footer style={{borderTop:'1px solid rgba(248,222,34,0.06)',padding:'24px',textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'2px',color:'rgba(248,222,34,0.2)',position:'relative',zIndex:1}}>
          SCARAB · PINIONOS × BASE · HACKATHON 2026
        </footer>
      </div>
    </>
  )
}
