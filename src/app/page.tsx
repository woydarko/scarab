'use client'

import Link from "next/link"
import Navbar from "@/components/Navbar"
import { useEffect, useState } from "react"

export default function Home() {
  const [introPhase, setIntroPhase] = useState<'center' | 'done'>('center')

  useEffect(() => {
    const t = setTimeout(() => setIntroPhase('done'), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --maroon: #900C3F; --red: #C70039; --orange: #F94C10; --yellow: #F8DE22;
          --bg: #0D0608; --text: #F8DE22;
          --text-muted: rgba(248,222,34,0.45);
          --border: rgba(248,222,34,0.1);
          --border-strong: rgba(248,222,34,0.2);
        }
        html { scroll-behavior:smooth; }
        body { background:var(--bg); font-family:'DM Sans',sans-serif; overflow-x:hidden; color:var(--text); }
        ::selection { background:var(--red); color:var(--yellow); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:var(--bg); }
        ::-webkit-scrollbar-thumb { background:var(--maroon); }

        .noise { position:fixed; inset:0; pointer-events:none; z-index:999; opacity:0.03;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }

        .orb { position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }

        .btn-primary {
          background:linear-gradient(135deg,var(--red),var(--orange)); color:var(--yellow);
          padding:12px 32px; border-radius:2px; font-family:'IBM Plex Mono',monospace;
          font-weight:500; font-size:13px; letter-spacing:2px; text-decoration:none;
          display:inline-block; text-transform:uppercase; transition:all 0.2s;
          border:none; cursor:pointer; position:relative; overflow:hidden;
        }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(199,0,57,0.4); }
        .btn-ghost {
          color:var(--text-muted); padding:12px 28px; border-radius:2px;
          font-family:'IBM Plex Mono',monospace; font-size:13px; letter-spacing:2px;
          text-decoration:none; display:inline-block; text-transform:uppercase;
          border:1px solid var(--border-strong); transition:all 0.2s;
        }
        .btn-ghost:hover { border-color:var(--red); color:var(--yellow); }

        .retro-tag { font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--text-muted); }
        .divider { width:100%; height:1px; background:linear-gradient(90deg,transparent,var(--border-strong),transparent); }

        /* Ticker */
        .ticker-wrap { overflow:hidden; border-bottom:1px solid var(--border); background:rgba(144,12,63,0.08); padding:6px 0; }
        .ticker { display:flex; gap:48px; animation:ticker 20s linear infinite; white-space:nowrap; width:max-content; }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* Flow */
        .flow-grid {
          display:grid;
          grid-template-columns:1fr 80px 1fr;
          grid-template-rows:auto auto auto;
          max-width:900px;
          margin:0 auto;
        }
        .flow-spine {
          grid-column:2;
          grid-row:1/4;
          display:flex;
          flex-direction:column;
          align-items:center;
        }
        .flow-node {
          width:52px; height:52px; border-radius:50%;
          border:1px solid rgba(199,0,57,0.4);
          background:rgba(144,12,63,0.15);
          display:flex; align-items:center; justify-content:center;
          font-family:'IBM Plex Mono',monospace; font-size:13px;
          color:var(--orange); font-weight:500; flex-shrink:0;
        }
        .flow-line { width:1px; flex:1; min-height:60px; background:linear-gradient(180deg,rgba(199,0,57,0.4),transparent); }
        .flow-left { grid-column:1; padding-right:40px; padding-top:8px; padding-bottom:0; }
        .flow-right { grid-column:3; padding-left:40px; padding-top:8px; padding-bottom:0; }
        .flow-spacer { visibility:hidden; height:120px; }

        /* Tier rows */
        .tier-row { display:flex; align-items:center; padding:24px 32px; border-bottom:1px solid var(--border); transition:background 0.2s; gap:24px; }
        .tier-row:last-child { border-bottom:none; }
        .tier-row:hover { background:rgba(144,12,63,0.08); }

        /* Intro animation */
        .intro-overlay {
          position:fixed; inset:0; z-index:200;
          display:flex; align-items:center; justify-content:center;
          background:#0D0608;
          transition:opacity 0.6s ease 1.2s, visibility 0.6s ease 1.2s;
        }
        .intro-overlay.done { opacity:0; visibility:hidden; pointer-events:none; }
        .intro-logo {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(64px,15vw,140px);
          letter-spacing:12px;
          background:linear-gradient(180deg,var(--yellow),var(--orange),var(--red));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:introScale 1s ease forwards;
        }
        @keyframes introScale {
          0% { opacity:0; transform:scale(0.8); letter-spacing:24px; }
          60% { opacity:1; transform:scale(1.02); }
          100% { opacity:1; transform:scale(1); letter-spacing:12px; }
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.8s ease 1.8s forwards; opacity:0; }
        .fade-up-2 { animation:fadeUp 0.8s ease 1.95s forwards; opacity:0; }
        .fade-up-3 { animation:fadeUp 0.8s ease 2.1s forwards; opacity:0; }
      `}</style>

      {/* Intro overlay */}
      <div className={"intro-overlay" + (introPhase === 'done' ? ' done' : '')}>
        <span className="intro-logo">SCARAB</span>
      </div>

      <div className="noise" />

      <div style={{minHeight:'100vh',background:'var(--bg)',position:'relative',overflow:'hidden'}}>
        <div className="orb" style={{width:'500px',height:'500px',background:'rgba(144,12,63,0.15)',top:'-150px',left:'-150px'}} />
        <div className="orb" style={{width:'400px',height:'400px',background:'rgba(199,0,57,0.08)',top:'300px',right:'-100px'}} />
        <div className="orb" style={{width:'300px',height:'300px',background:'rgba(249,76,16,0.06)',bottom:'0',left:'30%'}} />

        <Navbar />

        {/* Ticker — sticky, tidak fixed */}
        <div className="ticker-wrap">
          <div className="ticker">
            {[...Array(2)].map((_,j) => (
              <div key={j} style={{display:'flex',gap:'48px'}}>
                {['AUTONOMOUS PAYMENTS','BUG BOUNTY','PINIONOS × BASE','AI JUDGE','USDC PAYOUTS','ZERO APPROVALS','INSTANT SETTLEMENT'].map((t,i) => (
                  <span key={i} style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'3px',color:'rgba(199,0,57,0.7)',display:'flex',alignItems:'center',gap:'16px'}}>
                    {t} <span style={{color:'var(--border-strong)'}}>◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Hero */}
        <section style={{minHeight:'calc(100vh - 56px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 24px',textAlign:'center',position:'relative',zIndex:1}}>
          <div className="fade-up" style={{marginBottom:'24px'}}>
            <span className="retro-tag" style={{color:'rgba(199,0,57,0.7)'}}>◆ PinionOS Hackathon 2026 ◆</span>
          </div>
          <h1 className="fade-up-2" style={{fontFamily:'Bebas Neue',fontSize:'clamp(72px,14vw,160px)',letterSpacing:'4px',lineHeight:'0.9',marginBottom:'32px',background:'linear-gradient(180deg,var(--yellow) 0%,var(--orange) 60%,var(--red) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            BUGS<br/>PAY<br/>OUT
          </h1>
          <p className="fade-up-3" style={{color:'var(--text-muted)',fontSize:'17px',maxWidth:'420px',lineHeight:'1.8',marginBottom:'44px',fontWeight:'300'}}>
            AI judges every bug report. Valid ones get paid in USDC on Base — instantly, autonomously, no human needed.
          </p>
          <div className="fade-up-3" style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}>
            <Link href="/dashboard" className="btn-primary">Start Earning →</Link>
            <a href="#how" className="btn-ghost">How it works</a>
          </div>
        </section>

        <div className="divider" />

        {/* Stats */}
        <div style={{padding:'28px 0'}}>
          <div style={{display:'flex',justifyContent:'center',gap:'64px',flexWrap:'wrap',maxWidth:'800px',margin:'0 auto',padding:'0 24px'}}>
            {[{val:'$0',label:'Setup Fee'},{val:'~30s',label:'Avg Payout'},{val:'3',label:'Severity Tiers'},{val:'100%',label:'Autonomous'}].map(s => (
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontFamily:'Bebas Neue',fontSize:'40px',letterSpacing:'2px',background:'linear-gradient(135deg,var(--orange),var(--yellow))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{s.val}</div>
                <div className="retro-tag" style={{marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* How it works */}
        <section id="how" style={{padding:'100px 24px',position:'relative',zIndex:1}}>
          <div style={{maxWidth:'900px',margin:'0 auto'}}>
            <div style={{marginBottom:'72px'}}>
              <span className="retro-tag" style={{display:'block',marginBottom:'16px',color:'rgba(199,0,57,0.7)'}}>◆ The Flow</span>
              <h2 style={{fontFamily:'Bebas Neue',fontSize:'clamp(40px,6vw,72px)',letterSpacing:'3px',background:'linear-gradient(135deg,var(--yellow),var(--orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>THREE STEPS.<br/>ZERO FRICTION.</h2>
            </div>

            <div className="flow-grid">
              {/* Spine */}
              <div className="flow-spine">
                <div className="flow-node">01</div>
                <div className="flow-line" />
                <div className="flow-node">02</div>
                <div className="flow-line" />
                <div className="flow-node">03</div>
              </div>

              {/* Row 1 — Left */}
              <div className="flow-left" style={{gridRow:'1'}}>
                <span className="retro-tag" style={{color:'rgba(199,0,57,0.6)',display:'block',marginBottom:'12px'}}>Register</span>
                <h3 style={{fontFamily:'Bebas Neue',fontSize:'24px',letterSpacing:'2px',marginBottom:'12px',color:'var(--yellow)'}}>Connect Your Repository</h3>
                <p style={{color:'var(--text-muted)',fontSize:'14px',lineHeight:'1.8',fontWeight:'300',marginBottom:'80px'}}>Link your GitHub repo to Scarab in seconds. Set your wallet address. Scarab starts watching for new issues immediately.</p>
              </div>

              {/* Row 1 — Right spacer */}
              <div style={{gridColumn:'3',gridRow:'1'}} />

              {/* Row 2 — Left spacer */}
              <div style={{gridColumn:'1',gridRow:'2'}} />

              {/* Row 2 — Right */}
              <div className="flow-right" style={{gridRow:'2'}}>
                <span className="retro-tag" style={{color:'rgba(199,0,57,0.6)',display:'block',marginBottom:'12px'}}>Judge</span>
                <h3 style={{fontFamily:'Bebas Neue',fontSize:'24px',letterSpacing:'2px',marginBottom:'12px',color:'var(--yellow)'}}>AI Evaluates Every Bug</h3>
                <p style={{color:'var(--text-muted)',fontSize:'14px',lineHeight:'1.8',fontWeight:'300',marginBottom:'80px'}}>Hunters submit issues with their wallet address. Our AI reads the actual source code and verifies if the bug really exists.</p>
              </div>

              {/* Row 3 — Left */}
              <div className="flow-left" style={{gridRow:'3'}}>
                <span className="retro-tag" style={{color:'rgba(199,0,57,0.6)',display:'block',marginBottom:'12px'}}>Payout</span>
                <h3 style={{fontFamily:'Bebas Neue',fontSize:'24px',letterSpacing:'2px',marginBottom:'12px',color:'var(--yellow)'}}>USDC Sent Automatically</h3>
                <p style={{color:'var(--text-muted)',fontSize:'14px',lineHeight:'1.8',fontWeight:'300'}}>Valid bugs trigger instant USDC transfer via PinionOS on Base mainnet. No approval. Transaction hash recorded on-chain.</p>
              </div>

              {/* Row 3 — Right spacer */}
              <div style={{gridColumn:'3',gridRow:'3'}} />
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Tiers */}
        <section id="tiers" style={{padding:'100px 24px',position:'relative',zIndex:1}}>
          <div style={{maxWidth:'680px',margin:'0 auto'}}>
            <div style={{marginBottom:'56px'}}>
              <span className="retro-tag" style={{display:'block',marginBottom:'16px',color:'rgba(199,0,57,0.7)'}}>◆ Rewards</span>
              <h2 style={{fontFamily:'Bebas Neue',fontSize:'clamp(40px,6vw,72px)',letterSpacing:'3px',background:'linear-gradient(135deg,var(--yellow),var(--orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>PAYOUT TIERS</h2>
            </div>
            <div style={{border:'1px solid var(--border-strong)',borderRadius:'4px',overflow:'hidden'}}>
              {[
                {severity:'LOW',amount:'$1',color:'#6aaa5a',bg:'rgba(90,138,74,0.08)',desc:'Minor bugs, UI issues, typos'},
                {severity:'MEDIUM',amount:'$3',color:'var(--orange)',bg:'rgba(249,76,16,0.08)',desc:'Broken functionality, wrong behavior'},
                {severity:'HIGH',amount:'$5',color:'var(--red)',bg:'rgba(199,0,57,0.08)',desc:'Security issues, crashes, data loss'},
              ].map((tier,i) => (
                <div key={i} className="tier-row" style={{background:tier.bg}}>
                  <div style={{width:'80px',flexShrink:0}}>
                    <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'2px',color:tier.color,fontWeight:'500'}}>{tier.severity}</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{color:'var(--text-muted)',fontSize:'14px',fontWeight:'300'}}>{tier.desc}</p>
                  </div>
                  <div style={{fontFamily:'Bebas Neue',fontSize:'32px',letterSpacing:'2px',color:tier.color,flexShrink:0}}>{tier.amount} <span style={{fontSize:'16px',opacity:0.6}}>USDC</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* CTA */}
        <section style={{padding:'100px 24px',textAlign:'center',position:'relative',zIndex:1}}>
          <div style={{maxWidth:'560px',margin:'0 auto'}}>
            <span className="retro-tag" style={{display:'block',marginBottom:'24px',color:'rgba(199,0,57,0.7)'}}>◆ Get Started</span>
            <h2 style={{fontFamily:'Bebas Neue',fontSize:'clamp(48px,8vw,88px)',letterSpacing:'3px',marginBottom:'20px',background:'linear-gradient(180deg,var(--yellow),var(--orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>AUTOMATE YOUR<br/>BOUNTIES</h2>
            <p style={{color:'var(--text-muted)',fontSize:'15px',marginBottom:'40px',fontWeight:'300',lineHeight:'1.8'}}>Zero setup fees. Fully autonomous. Bugs paid in seconds on Base mainnet.</p>
            <Link href="/dashboard" className="btn-primary" style={{fontSize:'14px',padding:'14px 48px'}}>Launch App →</Link>
          </div>
        </section>

        <footer style={{borderTop:'1px solid var(--border)',padding:'24px',textAlign:'center'}}>
          <span className="retro-tag">Built with PinionOS × Base · Hackathon 2026</span>
        </footer>
      </div>
    </>
  )
}
