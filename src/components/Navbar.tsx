'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/tutorial', label: 'Tutorial' },
  ]

  return (
    <>
      <style>{`
        .nav-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-decoration: none;
          padding: 8px 16px;
          text-transform: uppercase;
          transition: color 0.2s;
          color: rgba(248,222,34,0.4);
        }
        .nav-link:hover { color: rgba(248,222,34,0.8); }
        .nav-link.active { color: #F8DE22; }
        .nav-btn {
          background: linear-gradient(135deg,#C70039,#F94C10);
          color: #F8DE22;
          padding: 7px 18px;
          border-radius: 2px;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 2px;
          text-decoration: none;
          text-transform: uppercase;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .nav-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(199,0,57,0.4); }
      `}</style>
      <nav style={{
        borderBottom: '1px solid rgba(248,222,34,0.07)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        background: 'rgba(13,6,8,0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '56px',
      }}>
        {/* Logo */}
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none',flexShrink:0}}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#900C3F,#F94C10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
          }}>🪲</div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '17px',
            fontWeight: '700',
            color: '#F8DE22',
            letterSpacing: '-0.5px',
          }}>Scarab</span>
        </Link>

        {/* Links */}
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={'nav-link' + (pathname === link.href ? ' active' : '')}
            >
              {link.label}
            </Link>
          ))}
          <div style={{width:'1px',height:'16px',background:'rgba(248,222,34,0.1)',margin:'0 8px'}} />
          <Link href="/dashboard" className="nav-btn">
            {pathname === '/dashboard' ? 'Dashboard' : 'Launch App'}
          </Link>
        </div>
      </nav>
    </>
  )
}
