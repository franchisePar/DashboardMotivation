import { useEffect, useRef } from 'react'
import { X, Sparkles, MapPin, Calendar, Car } from 'lucide-react'

const BRAND_CONFIGS = {
  UNITED: { color: '#0f27a2', glow: 'rgba(15, 39, 162, 0.5)' },
  MOVIS:  { color: '#f94231', glow: 'rgba(249, 66, 49, 0.5)' },
  DRIVO:  { color: '#c8fa1b', glow: 'rgba(200, 250, 27, 0.5)' }
}

const CONFETTI_COLORS = ['#0f27a2', '#f94231', '#c8fa1b', '#eab308', '#22c55e', '#a855f7']

export function NotificationToast({ booking, onDismiss }) {
  const canvasRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    // 1. Play alert chime
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav')
      audio.volume = 0.25
      audio.play()
    } catch (e) {
      console.log("Audio presentation blocked by browser context rules")
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
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
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
  }, [booking, onDismiss])

  const currentBrand = (booking?.brand || 'UNITED').toUpperCase()
  const styleMatch = BRAND_CONFIGS[currentBrand] || BRAND_CONFIGS.UNITED

  return (
    <>
      {/* Fullscreen Confetti Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9998,
          pointerEvents: 'none'
        }}
      />

      {/* Centered Backdrop for focus */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'backdropFadeIn 0.4s ease-out'
      }} />

      {/* Main Notification Card — CENTERED & BIGGER */}
      <div 
        ref={cardRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: 'linear-gradient(145deg, #1a2130, #111827)',
          border: `3px solid ${styleMatch.color}`,
          borderRadius: '24px',
          padding: '36px 40px',
          width: '500px',
          maxWidth: '90vw',
          boxShadow: `0 0 60px ${styleMatch.glow}, 0 24px 64px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05)`,
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
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}} />

        {/* Ambient Glow Ring behind card */}
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

        {/* Floating decorative emoji */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '20px',
          fontSize: '48px',
          opacity: 0.12,
          animation: 'float 3s ease-in-out infinite',
          pointerEvents: 'none',
          userSelect: 'none',
          filter: 'grayscale(0.3)'
        }}>
          🎉
        </div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '20px',
          fontSize: '36px',
          opacity: 0.1,
          animation: 'float 3s ease-in-out infinite 0.5s',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          ✨
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
            background: `linear-gradient(135deg, ${styleMatch.color}, ${styleMatch.color}88)`,
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 20px ${styleMatch.glow}`
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
            New Booking Received!
          </span>
        </div>

        {/* Big Reservation Number */}
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
            color: '#ffffff',
            fontSize: '42px',
            letterSpacing: '-0.03em',
            textShadow: `0 0 40px ${styleMatch.glow}`,
            lineHeight: 1
          }}>
            {booking?.reservationNumber || 'N/A'}
          </span>
        </div>

        {/* Brand Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            background: `${styleMatch.color}18`,
            padding: '10px 28px',
            borderRadius: '14px',
            border: `2px solid ${styleMatch.color}44`,
            color: styleMatch.color,
            fontWeight: 900,
            fontSize: '16px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: `0 0 30px ${styleMatch.glow}`
          }}>
            {currentBrand}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #2e374a, transparent)',
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

          {/* Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(34, 197, 94, 0.08)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 10px #22c55e'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#22c55e88', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
              <span style={{ fontSize: '15px', color: '#22c55e', fontWeight: 800 }}>{booking?.status || 'Confirmed'}</span>
            </div>
          </div>
        </div>

        {/* Cute bottom action hint */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#475569',
          marginTop: '4px',
          fontWeight: 500
        }}>
          🎊 Woohoo! Another happy customer! 🎊
        </div>
      </div>
    </>
  )
}