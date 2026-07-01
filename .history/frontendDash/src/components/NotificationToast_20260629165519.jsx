import { useEffect, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'

// Helper configuration objects to keep style management organized
const BRAND_CONFIGS = {
  UNITED: { color: '#0f27a2', glow: 'rgba(15, 39, 162, 0.4)' },
  MOVIS:  { color: '#f94231', glow: 'rgba(249, 66, 49, 0.4)' },
  DRIVO:  { color: '#c8fa1b', glow: 'rgba(200, 250, 27, 0.4)' }
}

const CONFETTI_COLORS = ['#0f27a2', '#f94231', '#c8fa1b']

export function NotificationToast({ booking, onDismiss }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // 1. Play alert chime sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav')
      audio.volume = 0.25
      audio.play()
    } catch (e) {
      console.log("Audio presentation blocked by browser context rules")
    }

    // 2. High-Performance Canvas Confetti Engine
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
      // Instantiate 120 cascading ribbon particles distributed vertically ABOVE the bezel boundary
      for (let i = 0; i < 520; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * -window.innerHeight - 20, // Negative positioning offset
          rotation: Math.random() * 360,
          speed: Math.random() * 4 + 5, // Fall speed physics parameters
          width: Math.random() * 6 + 6,
          height: Math.random() * 10 + 8,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          opacity: Math.random() * 0.7 + 0.3
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

          // Advance coordinate vectors down viewport layout space
          p.y += p.speed
          p.rotation += p.speed * 0.4
          p.x += Math.sin(p.y / 25) * 0.4 // Sway cycle simulation loop
        })

        animationFrameId = requestAnimationFrame(drawFrame)
      }
      drawFrame()

      // Cleanup window sizing and rendering frame hooks
      return () => {
        window.removeEventListener('resize', setSize)
        cancelAnimationFrame(animationFrameId)
      }
    }

    // 3. Keep toast banner visible for 9 seconds before automatic auto-dismiss
    const autoDismissTimer = setTimeout(onDismiss, 9000)
    return () => clearTimeout(autoDismissTimer)
  }, [booking, onDismiss])

  // Extract color tokens based on incoming database target brand mapping safely
  const currentBrand = (booking?.brand || 'UNITED').toUpperCase()
  const styleMatch = BRAND_CONFIGS[currentBrand] || BRAND_CONFIGS.UNITED

  return (
    <>
      {/* Absolute fullscreen canvas frame layer */}
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

      {/* Main Notification Card Layout Frame */}
      <div 
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(145deg, #161b26, #0f131c)',
          border: `2px solid ${styleMatch.color}`,
          borderRadius: '16px',
          padding: '20px',
          width: '360px',
          boxShadow: `0 0 35px ${styleMatch.glow}, 0 16px 48px rgba(0, 0, 0, 0.7)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Style sheet override injected inline for modular ease */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes toast-slide-in {
            0% { transform: translateX(450px) scale(0.9); opacity: 0; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
        `}} />

        {/* Ambient Rocket Watermark Decoration */}
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '80px', opacity: 0.07, transform: 'rotate(-15deg)', pointerEvents: 'none', userSelect: 'none' }}>
          🚀
        </div>

        {/* Force Manual Close Trigger Button */}
        <button 
          onClick={onDismiss} 
          style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>

        {/* Top Header Label Context Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={15} style={{ color: '#eab308' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#eab308', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Let's Go! New Booking Received
          </span>
        </div>

        {/* Middle Core Payload Content Fields */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Reservation ID</span>
            <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '24px', letterSpacing: '-0.02em' }}>
              {booking?.reservationNumber || 'N/A'}
            </span>
          </div>
          
          <div style={{ background: '#1e2533', padding: '6px 14px', borderRadius: '10px', border: '1px solid #2e374a', color: styleMatch.color, fontWeight: 900, fontSize: '13px', letterSpacing: '1px' }}>
            {currentBrand}
          </div>
        </div>

        {/* Lower Geographical Location Status Metadata Frame Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #2e374a', paddingTop: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#e2e8f0', fontWeight: 600 }}>
            <span>{booking?.country || 'Global'}</span>
          </div>

          <span style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '11px',
            textTransform: 'uppercase',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            {booking?.status || 'Confirmed'}
          </span>
        </div>
      </div>
    </>
  )
}