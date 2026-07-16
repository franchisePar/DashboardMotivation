import { useEffect, useRef } from 'react'
import { X, Sparkles, MapPin } from 'lucide-react'
import { brandLogo, brandColor } from '../format'

const BRAND_CONFIGS = {
  UNITED: { color: '#0f27a2', glow: 'rgba(15, 39, 162, 0.5)' },
  MOVIS:  { color: '#f94231', glow: 'rgba(249, 66, 49, 0.5)' },
  DRIVO:  { color: '#c8fa1b', glow: 'rgba(200, 250, 27, 0.5)' }
}

const CONFETTI_COLORS = ['#0f27a2', '#f94231', '#c8fa1b', '#eab308', '#22c55e', '#a855f7']
const BW_COLORS = ['#888888', '#aaaaaa', '#cccccc', '#666666', '#999999', '#bbbbbb']

// Status colors
const STATUS_COLORS = {
  CONFIRMED:   { bg: 'rgba(34, 197, 94, 0.08)',  border: 'rgba(34, 197, 94, 0.2)',  dot: '#22c55e', text: '#22c55e', label: '#22c55e88' },
  CANCELLED:   { bg: 'rgba(239, 68, 68, 0.08)',  border: 'rgba(239, 68, 68, 0.2)',  dot: '#ef4444', text: '#ef4444', label: '#ef444488' },
  CANCELED:    { bg: 'rgba(239, 68, 68, 0.08)',  border: 'rgba(239, 68, 68, 0.2)',  dot: '#ef4444', text: '#ef4444', label: '#ef444488' },
  PENDING:     { bg: 'rgba(234, 179, 8, 0.08)',  border: 'rgba(234, 179, 8, 0.2)',  dot: '#eab308', text: '#eab308', label: '#eab30888' },
  'NEW BOOKING': { bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.2)', dot: '#0ea5e9', text: '#0ea5e9', label: '#0ea5e988' },
  'NEW RESERVATION': { bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.2)', dot: '#0ea5e9', text: '#0ea5e9', label: '#0ea5e988' },
}

export function NotificationToast({ booking, onDismiss }) {
  const canvasRef = useRef(null)

  // Detect status
  const rawStatus = (booking?.status || 'CONFIRMED').toUpperCase().trim()
  const isCancelled = rawStatus === 'CANCELLED' || rawStatus === 'CANCELED'
  const statusKey = rawStatus === 'CANCELED' ? 'CANCELLED' : rawStatus
  const statusConfig = STATUS_COLORS[statusKey] || STATUS_COLORS.CONFIRMED

  // Brand
  const currentBrand = (booking?.brand || 'UNITED').toUpperCase()
  const brandConfig = BRAND_CONFIGS[currentBrand] || BRAND_CONFIGS.UNITED
  
  // If cancelled → black & white
  const styleMatch = isCancelled 
    ? { color: '#888888', glow: 'rgba(128, 128, 128, 0.3)' }
    : brandConfig

  const confettiColors = isCancelled ? BW_COLORS : CONFETTI_COLORS

  useEffect(() => {
    // 1. Play alert chime (only if not cancelled)
    if (!isCancelled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav')
        audio.volume = 0.25
        audio.play()
      } catch (e) {
        console.log("Audio presentation blocked by browser context rules")
      }
    }

    // 2. Canvas Confetti Engine
    const canvas = canvasRef.current
    let animationFrameId

    if (canvas) {
      const ctx = canvas.getContext('2d')
      
      const setSize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      setSize()
      window.addEventListener('resize', setSize)

      const particles = []
      for (let i = 0; i < 520; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * -window.innerHeight - 20,
          rotation: Math.random() * 360,
          speed: Math.random() * 4 + 5,
          width: Math.random() * 6 + 6,
          height: Math.random() * 10 + 8,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          opacity: Math.random() * 0.7 + 0.3,
          swayOffset: Math.random() * Math.PI * 2
        })
      }

      const drawFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((p) => {
          ctx.save()
          ctx.translate(p.x + p.width / 2, p.y + p.height / 2)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.opacity
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
          ctx.restore()
          p.y += p.speed
          p.rotation += p.speed * 0.4
          p.x += Math.sin(p.y / 25 + p.swayOffset) * 0.4
        })
        animationFrameId = requestAnimationFrame(drawFrame)
      }
      drawFrame()

      return () => {
        window.removeEventListener('resize', setSize)
        cancelAnimationFrame(animationFrameId)
      }
    }

    // 3. Auto-dismiss timer
    const autoDismissTimer = setTimeout(onDismiss, 9000)
    return () => clearTimeout(autoDismissTimer)
  }, [booking, onDismiss, isCancelled, confettiColors])

  const logoSrc = brandLogo(currentBrand)

  return (
    <>
      {/* Canvas Confetti */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      />

      {/* Backdrop blur */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: isCancelled ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'backdropFadeIn 0.4s ease-out'
      }} />

      {/* Card */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: isCancelled 
            ? 'linear-gradient(145deg, #1a1a1a, #0f0f0f)' 
            : 'linear-gradient(145deg, #1a2130, #111827)',
          border: `3px solid ${styleMatch.color}`,
          borderRadius: '24px',
          padding: '36px 40px',
          width: '500px',
          maxWidth: '90vw',
          boxShadow: isCancelled 
            ? '0 0 30px rgba(128,128,128,0.2), 0 16px 48px rgba(0,0,0,0.8)' 
            : `0 0 60px ${styleMatch.glow}, 0 24px 64px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          animation: 'toastBounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Keyframe Animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes backdropFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes toastBounceIn {
            0% { transform: translate(-50%, -50%) scale(0.3) rotate(-8deg); opacity: 0; }
            60% { transform: translate(-50%, -50%) scale(1.08) rotate(2deg); opacity: 1; }
            80% { transform: translate(-50%, -50%) scale(0.96) rotate(-1deg); }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}} />

        {/* Glow Ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '120%',
          height: '120%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `2px solid ${styleMatch.color}`,
          opacity: 0.15,
          animation: 'pulse-ring 2s ease-out infinite',
          pointerEvents: 'none'
        }} />

        {/* Floating emojis */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '20px',
          fontSize: '48px',
          opacity: isCancelled ? 0.05 : 0.12,
          animation: 'float 3s ease-in-out infinite',
          pointerEvents: 'none',
          userSelect: 'none',
          filter: isCancelled ? 'grayscale(1)' : 'grayscale(0.3)'
        }}>
          {isCancelled ? '❌' : '🎉'}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '20px',
          fontSize: '36px',
          opacity: isCancelled ? 0.05 : 0.1,
          animation: 'float 3s ease-in-out infinite 0.5s',
          pointerEvents: 'none',
          userSelect: 'none',
          filter: isCancelled ? 'grayscale(1)' : 'none'
        }}>
          {isCancelled ? '⚠️' : '✨'}
        </div>

        {/* Close Button */}
        <button 
          onClick={onDismiss} 
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#94a3b8'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <div style={{
            background: isCancelled 
              ? 'linear-gradient(135deg, #666666, #444444)' 
              : `linear-gradient(135deg, ${styleMatch.color}, ${styleMatch.color}88)`,
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isCancelled ? 'none' : `0 0 20px ${styleMatch.glow}`
          }}>
            <Sparkles size={22} style={{ color: '#fff' }} />
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: styleMatch.color,
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}>
            {isCancelled ? 'Booking Cancelled' : 'New Booking Received!'}
          </span>
        </div>

        {/* Reservation Number */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px 0'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Reservation ID
          </span>
          <span style={{
            fontWeight: 900,
            color: isCancelled ? '#888888' : '#ffffff',
            fontSize: '42px',
            letterSpacing: '-0.03em',
            textShadow: isCancelled ? 'none' : `0 0 40px ${styleMatch.glow}`,
            lineHeight: 1
          }}>
            {booking?.reservationNumber || 'N/A'}
          </span>
        </div>

        {/* BRAND NAME + LOGO (replaces old status badge) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: `${styleMatch.color}18`,
          padding: '12px 28px',
          borderRadius: '14px',
          border: `2px solid ${styleMatch.color}44`,
          boxShadow: isCancelled ? 'none' : `0 0 30px ${styleMatch.glow}`
        }}>
          {/* Brand Logo */}
          <img 
            src={logoSrc}
            alt={currentBrand}
            style={{
              height: '28px',
              width: 'auto',
              objectFit: 'contain',
              filter: isCancelled ? 'grayscale(1) brightness(0.7)' : 'none'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          {/* Brand Name */}
          <span style={{
            color: styleMatch.color,
            fontWeight: 900,
            fontSize: '18px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {currentBrand}
          </span>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: isCancelled 
            ? 'linear-gradient(90deg, transparent, #444444, transparent)' 
            : 'linear-gradient(90deg, transparent, #2e374a, transparent)',
          margin: '4px 0'
        }} />

        {/* Footer Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.03)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <MapPin size={18} style={{ color: styleMatch.color, opacity: 0.8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
              <span style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: 700 }}>{booking?.country || 'Global'}</span>
            </div>
          </div>

          {/* STATUS (with real status color) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: statusConfig.bg,
            padding: '14px 16px',
            borderRadius: '14px',
            border: `1px solid ${statusConfig.border}`
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusConfig.dot,
              boxShadow: `0 0 10px ${statusConfig.dot}`
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: statusConfig.label, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
              <span style={{ fontSize: '15px', color: statusConfig.text, fontWeight: 800 }}>
                {booking?.status || 'Confirmed'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          color: isCancelled ? '#666666' : '#475569',
          marginTop: '4px',
          fontWeight: 500
        }}>
          {isCancelled ? '⚠️ Booking has been cancelled' : '🎊 Woohoo! Another happy customer! 🎊'}
        </div>
      </div>
    </>
  )
}