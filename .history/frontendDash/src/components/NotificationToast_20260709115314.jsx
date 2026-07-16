import { useEffect, useRef, useState } from 'react'
import { X, Sparkles, MapPin } from 'lucide-react'

const BRAND_CONFIGS = {
  UNITED: { color: '#0f27a2', glow: 'rgba(15, 39, 162, 0.3)', logo: '/assets/logos/United_Logo_BG.png' },
  MOVIS:  { color: '#f94231', glow: 'rgba(249, 66, 49, 0.3)', logo: '/assets/logos/Movis_Logo_BG.png' },
  DRIVO:  { color: '#a3c520', glow: 'rgba(163, 197, 32, 0.3)', logo: '/assets/logos/Drivo_Logo_BG.png' }
}

const STATUS_CONFIGS = {
  CONFIRMED: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.25)', dot: '#22c55e', text: '#22c55e' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', dot: '#ef4444', text: '#ef4444' },
  CANCELED:  { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', dot: '#ef4444', text: '#ef4444' },
}

const CONFETTI_COLORS = ['#0f27a2', '#f94231', '#c8fa1b', '#eab308', '#22c55e', '#a855f7']
const BW_COLORS = ['#94a3b8', '#cbd5e1', '#e2e8f0', '#64748b', '#b0b8c4', '#d1d5db']

function getBrandConfig(brand, isCancelled) {
  const b = (brand || 'UNITED').toString().toUpperCase().trim()
  const baseConfig = BRAND_CONFIGS[b] || BRAND_CONFIGS.UNITED
  if (isCancelled) {
    return { ...baseConfig, color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.2)' }
  }
  return baseConfig
}

function getStatusConfig(status) {
  const s = (status || 'CONFIRMED').toString().toUpperCase().trim()
  const key = s === 'CANCELED' ? 'CANCELLED' : s
  return STATUS_CONFIGS[key] || STATUS_CONFIGS.CONFIRMED
}

function SingleToast({ booking, onDismiss }) {
  const canvasRef = useRef(null)

  let rawBrand = (booking?.brand || 'UNITED').toString().toUpperCase().trim()
  let rawStatus = (booking?.status || 'CONFIRMED').toString().toUpperCase().trim()

  const isBrandActuallyBrand = ['UNITED', 'MOVIS', 'DRIVO'].includes(rawBrand)
  const isStatusActuallyStatus = ['CONFIRMED', 'CANCELED', 'CANCELLED'].includes(rawStatus)

  if (!isBrandActuallyBrand && ['UNITED', 'MOVIS', 'DRIVO'].includes(rawStatus)) {
    const temp = rawBrand; rawBrand = rawStatus; rawStatus = temp
  }
  if (!isStatusActuallyStatus && ['CONFIRMED', 'CANCELED', 'CANCELLED'].includes(rawBrand)) {
    const temp = rawStatus; rawStatus = rawBrand; rawBrand = temp
  }

  const currentBrand = rawBrand
  const isCancelled = rawStatus === 'CANCELLED' || rawStatus === 'CANCELED'
  const brandConfig = getBrandConfig(currentBrand, isCancelled)
  const statusConfig = getStatusConfig(rawStatus)
  const confettiColors = isCancelled ? BW_COLORS : CONFETTI_COLORS

  // ── Light theme styles ──
  const cardBg = isCancelled
    ? 'linear-gradient(145deg, #f8fafc, #f1f5f9)'
    : 'linear-gradient(145deg, #ffffff, #f8fafc)'
  const cardBorder = `2px solid ${isCancelled ? '#e2e8f0' : brandConfig.color}`
  const cardShadow = isCancelled
    ? '0 0 30px rgba(148,163,184,0.15), 0 16px 48px rgba(0,0,0,0.08)'
    : `0 0 40px ${brandConfig.glow}, 0 16px 48px rgba(0,0,0,0.08)`

  useEffect(() => {
    if (!isCancelled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav')
        audio.volume = 0.25
        audio.play().catch(() => {})
      } catch (e) {}
    }

    const canvas = canvasRef.current
    let animationFrameId
    let isActive = true

    if (canvas) {
      const ctx = canvas.getContext('2d')
      const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
      setSize()
      window.addEventListener('resize', setSize)

      const particles = []
      for (let i = 0; i < 400; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * -window.innerHeight - 20,
          rotation: Math.random() * 360,
          speed: Math.random() * 4 + 5,
          width: Math.random() * 6 + 6,
          height: Math.random() * 10 + 8,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          opacity: Math.random() * 0.5 + 0.3,
          swayOffset: Math.random() * Math.PI * 2
        })
      }

      const drawFrame = () => {
        if (!isActive) return
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
        isActive = false
        window.removeEventListener('resize', setSize)
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isCancelled, confettiColors])

  useEffect(() => {
    const timer = setTimeout(onDismiss, 9000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000, pointerEvents: 'none' }} />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: isCancelled ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(6px)',
        animation: 'backdropFadeIn 0.4s ease-out'
      }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 9999, background: cardBg, border: cardBorder, borderRadius: '24px',
        padding: '36px 40px', width: '500px', maxWidth: '90vw', boxShadow: cardShadow,
        display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        animation: 'toastBounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes toastBounceIn {
            0% { transform: translate(-50%, -50%) scale(0.3) rotate(-8deg); opacity: 0; }
            60% { transform: translate(-50%, -50%) scale(1.08) rotate(2deg); opacity: 1; }
            80% { transform: translate(-50%, -50%) scale(0.96) rotate(-1deg); }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
          @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.6); opacity: 0; } }
        `}} />

        {/* Glow Ring */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '120%', height: '120%',
          transform: 'translate(-50%, -50%)', borderRadius: '50%',
          border: `2px solid ${brandConfig.color}`, opacity: 0.1,
          animation: 'pulse-ring 2s ease-out infinite', pointerEvents: 'none'
        }} />

        {/* Floating emojis */}
        <div style={{ position: 'absolute', top: '-10px', right: '20px', fontSize: '48px', opacity: isCancelled ? 0.06 : 0.1, animation: 'float 3s ease-in-out infinite', pointerEvents: 'none', userSelect: 'none', filter: isCancelled ? 'grayscale(1)' : 'grayscale(0.3)' }}>
          {isCancelled ? '❌' : '🎉'}
        </div>
        <div style={{ position: 'absolute', bottom: '10px', left: '20px', fontSize: '36px', opacity: isCancelled ? 0.06 : 0.08, animation: 'float 3s ease-in-out infinite 0.5s', pointerEvents: 'none', userSelect: 'none', filter: isCancelled ? 'grayscale(1)' : 'none' }}>
          {isCancelled ? '⚠️' : '✨'}
        </div>

        {/* Close Button */}
        <button onClick={onDismiss} style={{
          position: 'absolute', top: '18px', right: '18px',
          background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', padding: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
        }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#1e293b' }}
           onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#94a3b8' }}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <div style={{
            background: isCancelled ? 'linear-gradient(135deg, #94a3b8, #64748b)' : `linear-gradient(135deg, ${brandConfig.color}, ${brandConfig.color}88)`,
            borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isCancelled ? 'none' : `0 0 20px ${brandConfig.glow}`
          }}>
            <Sparkles size={22} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: brandConfig.color, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {isCancelled ? 'Booking Cancelled' : 'New Booking Received!'}
          </span>
        </div>

        {/* Reservation Number */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Reservation ID
          </span>
          <span style={{ fontWeight: 900, color: isCancelled ? '#94a3b8' : '#1e293b', fontSize: '42px', letterSpacing: '-0.03em', textShadow: isCancelled ? 'none' : `0 0 30px ${brandConfig.glow}`, lineHeight: 1 }}>
            {booking?.reservationNumber || 'N/A'}
          </span>
        </div>

        {/* BRAND LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
          <img src={brandConfig.logo} alt={currentBrand} style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: isCancelled ? 'grayscale(1) brightness(0.8)' : 'none' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
          <span style={{ display: 'none', color: brandConfig.color, fontWeight: 900, fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {currentBrand}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: isCancelled ? 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' : 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '4px 0' }} />

        {/* Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.02)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <MapPin size={18} style={{ color: brandConfig.color, opacity: 0.8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
              <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{booking?.country || 'Global'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: statusConfig.bg, padding: '14px 16px', borderRadius: '14px', border: `1px solid ${statusConfig.border}` }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusConfig.dot, boxShadow: `0 0 10px ${statusConfig.dot}` }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: statusConfig.text + '88', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
              <span style={{ fontSize: '15px', color: statusConfig.text, fontWeight: 800 }}>{rawStatus}</span>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: isCancelled ? '#94a3b8' : '#64748b', marginTop: '4px', fontWeight: 500 }}>
          {isCancelled ? '⚠️ Booking has been cancelled' : '🎊 Woohoo! Another happy customer! 🎊'}
        </div>
      </div>
    </>
  )
}

export function NotificationToast({ booking, onDismiss }) {
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)

  useEffect(() => { if (booking) setQueue(prev => [...prev, booking]) }, [booking])

  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0]
      setCurrent(next)
      setQueue(prev => prev.slice(1))
    }
  }, [current, queue])

  const handleDismiss = () => { setCurrent(null); onDismiss?.() }

  if (!current) return null
  return <SingleToast booking={current} onDismiss={handleDismiss} />
}