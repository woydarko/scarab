'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Tutorial() {
  const [role, setRole] = useState<'owner' | 'hunter'>('owner')

  const ownerSteps = [
    {
      n: '01',
      title: 'Create a GitHub Repository',
      desc: 'Your repo needs to be public so Scarab can read the source code for AI verification.',
      code: null,
      note: null,
    },
    {
      n: '02',
      title: 'Sign in to Scarab Dashboard',
      desc: 'Go to the dashboard and sign in with your GitHub account.',
      code: null,
      note: 'You need a GitHub OAuth account to register repos.',
    },
    {
      n: '03',
      title: 'Register Your Repository',
      desc: 'Enter your GitHub repo URL and your Base wallet address. This wallet is displayed publicly on the campaign page.',
      code: 'https://github.com/username/your-repo',
      note: 'Make sure your wallet is on Base network.',
    },
    {
      n: '04',
      title: 'Set Up GitHub Webhook',
      desc: 'Go to your repo Settings → Webhooks → Add webhook. This allows Scarab to receive new bug reports instantly.',
      code: 'Payload URL: https://your-scarab-url/api/webhook\nContent type: application/json\nEvents: Issues only',
      note: null,
    },
    {
      n: '05',
      title: 'Fund the Treasury Wallet',
      desc: 'Scarab pays hunters from the treasury wallet. Make sure it has enough USDC on Base to cover bounties.',
      code: 'Low severity:  $0.1 USDC\nMedium severity: $0.1 USDC\nHigh severity:   $0.1 USDC',
      note: 'Top up treasury at: 0x964739472C587d24934c37BEbB405CeE36D59B24',
    },
    {
      n: '06',
      title: 'Go Live',
      desc: 'Your campaign is now live on the Campaigns page. Share it with the community and start receiving bug reports!',
      code: null,
      note: 'Hunters will be notified via GitHub comments when their submission is reviewed.',
    },
  ]

  const hunterSteps = [
    {
      n: '01',
      title: 'Browse Active Campaigns',
      desc: 'Go to the Campaigns page and find a repo you want to hunt bugs in. Check the category, stats, and bounty tiers.',
      code: null,
      note: null,
    },
    {
      n: '02',
      title: 'Study the Source Code',
      desc: 'Read the repo code carefully. Look for real bugs — missing validations, error handling issues, logic flaws, security vulnerabilities.',
      code: null,
      note: 'AI will verify your bug against the actual source code. Fake or vague reports will be rejected.',
    },
    {
      n: '03',
      title: 'Open a Bug Report Issue',
      desc: 'Click "Submit Bug" on the campaign or go to the repo Issues tab. Use the Bug Report template.',
      code: null,
      note: 'Always use the Bug Report template — blank issues may be ignored.',
    },
    {
      n: '04',
      title: 'Fill in the Required Fields',
      desc: 'A good bug report must have clear steps to reproduce, expected behavior, and actual behavior. The more detail, the better.',
      code: '## Steps to Reproduce\n1. Go to /dashboard\n2. Click Submissions tab\n3. Observe blank screen\n\n## Expected Behavior\nLoading indicator should appear\n\n## Actual Behavior\nBlank screen with no feedback',
      note: null,
    },
    {
      n: '05',
      title: 'Include Your Wallet Address',
      desc: 'Add your Base wallet address at the bottom of the issue. This is where your USDC bounty will be sent.',
      code: 'Wallet: 0xYourBaseWalletAddress',
      note: 'Without this, your submission will be automatically rejected.',
    },
    {
      n: '06',
      title: 'Wait for AI Review',
      desc: 'Scarab AI will review your submission against the source code within minutes. You will receive a GitHub comment with the verdict.',
      code: null,
      note: null,
    },
    {
      n: '07',
      title: 'Get Paid',
      desc: 'If your bug is valid, USDC is sent automatically to your wallet on Base mainnet. Check the comment for your transaction hash.',
      code: null,
      note: 'Payment is instant — no waiting for human approval.',
    },
  ]

  const tips = [
    { role: 'hunter', title: 'Be Specific', desc: 'Vague reports like "it does not work" will be rejected. Include exact steps, line numbers if possible.' },
    { role: 'hunter', title: 'No Duplicates', desc: 'If a bug has already been reported and paid, your report will be flagged as duplicate. Search existing issues first.' },
    { role: 'hunter', title: 'Real Bugs Only', desc: 'AI reads the actual source code. If the bug does not exist in the code, it will be rejected regardless of how well-written the report is.' },
    { role: 'owner', title: 'Keep Repo Public', desc: 'AI needs to read your source code to verify bugs. Private repos cannot be verified.' },
    { role: 'owner', title: 'Push Your Code', desc: 'Make sure your latest code is pushed to GitHub. AI reads from the main branch.' },
  ]

  const steps = role === 'owner' ? ownerSteps : hunterSteps

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0D0608; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
        .glass { background:rgba(144,12,63,0.05); backdrop-filter:blur(24px); border:1px solid rgba(248,222,34,0.08); }
        .glass-strong { background:rgba(144,12,63,0.07); backdrop-filter:blur(40px); border:1px solid rgba(248,222,34,0.12); }
        .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .btn-primary { background:linear-gradient(135deg,#C70039,#F94C10); color:#F8DE22; padding:10px 24px; border-radius:2px; font-family:'IBM Plex Mono',monospace; font-weight:500; font-size:12px; letter-spacing:2px; text-decoration:none; display:inline-block; text-transform:uppercase; transition:all 0.2s; border:none; cursor:pointer; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(199,0,57,0.4); }
        .noise { position:fixed; inset:0; pointer-events:none; z-index:999; opacity:0.03; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
        .code-block { background:rgba(0,0,0,0.4); border:1px solid rgba(248,222,34,0.1); border-left:3px solid #C70039; border-radius:2px; padding:16px 20px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:rgba(248,222,34,0.7); line-height:1.8; white-space:pre-wrap; margin-top:12px; }
        .step-card { border-radius:4px; padding:28px 32px; margin-bottom:2px; transition:all 0.2s; }
        .step-card:hover { border-color:rgba(248,222,34,0.18); background:rgba(144,12,63,0.09); }
        .role-btn { padding:12px 32px; border-radius:2px; border:1px solid rgba(248,222,34,0.12); background:none; font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:3px; cursor:pointer; text-transform:uppercase; transition:all 0.2s; }
        .role-btn.active { background:linear-gradient(135deg,#C70039,#F94C10); color:#F8DE22; border-color:transparent; }
        .role-btn:not(.active) { color:rgba(248,222,34,0.4); }
        .role-btn:not(.active):hover { border-color:rgba(248,222,34,0.3); color:rgba(248,222,34,0.7); }
        .tip-card { border-radius:4px; padding:20px 24px; border-left:3px solid; }
      `}</style>

      <div className="noise" />
      <div className="orb" style={{width:'500px',height:'500px',background:'rgba(144,12,63,0.12)',top:'-100px',left:'-200px'}} />
      <div className="orb" style={{width:'300px',height:'300px',background:'rgba(199,0,57,0.07)',bottom:'100px',right:'-100px'}} />

      <div style={{minHeight:'100vh',background:'#0D0608',color:'#F8DE22',position:'relative',zIndex:1}}>

        <Navbar />

        <div style={{maxWidth:'800px',margin:'0 auto',padding:'56px 24px'}}>

          {/* Header */}
          <div style={{marginBottom:'56px'}}>
            <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'3px',color:'rgba(199,0,57,0.7)',textTransform:'uppercase',display:'block',marginBottom:'16px'}}>◆ How It Works</span>
            <h1 style={{fontFamily:'Playfair Display',fontSize:'clamp(36px,6vw,64px)',fontWeight:'700',letterSpacing:'-2px',marginBottom:'16px',lineHeight:'1'}}>Get Started<br/><em style={{color:'#F94C10'}}>Step by Step</em></h1>
            <p style={{color:'rgba(248,222,34,0.4)',fontSize:'15px',fontWeight:'300',lineHeight:'1.8'}}>Choose your role to see the relevant guide.</p>
          </div>

          {/* Role selector */}
          <div style={{display:'flex',gap:'4px',marginBottom:'48px',background:'rgba(144,12,63,0.05)',border:'1px solid rgba(248,222,34,0.08)',borderRadius:'2px',padding:'4px',width:'fit-content'}}>
            <button className={'role-btn' + (role==='owner'?' active':'')} onClick={() => setRole('owner')}>
              Repo Owner
            </button>
            <button className={'role-btn' + (role==='hunter'?' active':'')} onClick={() => setRole('hunter')}>
              Bug Hunter
            </button>
          </div>

          {/* Steps */}
          <div style={{marginBottom:'64px'}}>
            {steps.map((step, i) => (
              <div key={i} className="glass step-card">
                <div style={{display:'flex',gap:'20px',alignItems:'flex-start'}}>
                  <div style={{fontFamily:'Playfair Display',fontSize:'40px',fontWeight:'700',color:'rgba(199,0,57,0.2)',lineHeight:'1',flexShrink:0,width:'48px'}}>{step.n}</div>
                  <div style={{flex:1}}>
                    <h3 style={{fontFamily:'Playfair Display',fontSize:'20px',fontWeight:'700',letterSpacing:'-0.5px',marginBottom:'8px'}}>{step.title}</h3>
                    <p style={{color:'rgba(248,222,34,0.45)',fontSize:'14px',lineHeight:'1.8',fontWeight:'300'}}>{step.desc}</p>
                    {step.code && <div className="code-block">{step.code}</div>}
                    {step.note && (
                      <div style={{marginTop:'12px',display:'flex',alignItems:'flex-start',gap:'8px'}}>
                        <span style={{fontFamily:'IBM Plex Mono',fontSize:'10px',color:'#F94C10',letterSpacing:'1px',flexShrink:0,marginTop:'2px'}}>NOTE</span>
                        <p style={{color:'rgba(249,76,16,0.7)',fontSize:'13px',fontWeight:'300'}}>{step.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{marginBottom:'48px'}}>
            <span style={{fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'3px',color:'rgba(199,0,57,0.7)',textTransform:'uppercase',display:'block',marginBottom:'24px'}}>◆ Pro Tips</span>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {tips.filter(t => t.role === role).map((tip, i) => (
                <div key={i} className="glass tip-card" style={{borderLeftColor: i%2===0 ? '#C70039' : '#F94C10'}}>
                  <h4 style={{fontFamily:'IBM Plex Mono',fontSize:'12px',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'6px',color:'#F8DE22'}}>{tip.title}</h4>
                  <p style={{color:'rgba(248,222,34,0.4)',fontSize:'14px',fontWeight:'300',lineHeight:'1.7'}}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="glass-strong" style={{borderRadius:'4px',padding:'40px',textAlign:'center'}}>
            {role === 'owner' ? (
              <>
                <p style={{fontFamily:'Playfair Display',fontSize:'24px',fontWeight:'700',letterSpacing:'-0.5px',marginBottom:'12px'}}>Ready to launch your campaign?</p>
                <p style={{color:'rgba(248,222,34,0.4)',fontSize:'14px',marginBottom:'28px',fontWeight:'300'}}>Register your repo and go live in under 5 minutes.</p>
                <Link href="/dashboard" className="btn-primary">Go to Dashboard →</Link>
              </>
            ) : (
              <>
                <p style={{fontFamily:'Playfair Display',fontSize:'24px',fontWeight:'700',letterSpacing:'-0.5px',marginBottom:'12px'}}>Ready to hunt?</p>
                <p style={{color:'rgba(248,222,34,0.4)',fontSize:'14px',marginBottom:'28px',fontWeight:'300'}}>Browse active campaigns and start earning USDC.</p>
                <Link href="/campaigns" className="btn-primary">Browse Campaigns →</Link>
              </>
            )}
          </div>
        </div>

        <footer style={{borderTop:'1px solid rgba(248,222,34,0.06)',padding:'24px',textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:'11px',letterSpacing:'2px',color:'rgba(248,222,34,0.2)',position:'relative',zIndex:1}}>
          SCARAB · PINIONOS × BASE · HACKATHON 2026
        </footer>
      </div>
    </>
  )
}
