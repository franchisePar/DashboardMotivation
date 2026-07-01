import { useEffect, useState } from 'react'

function ConfettiPiece({ color, delay, left }) {
  const [falling, setFalling] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFalling(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!falling) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '-20px',
        left: `${left}%`,
        width: '10px',
        height: '10px',
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animation: `confetti-fall 1s ease-in forwards`,
        animationDelay: `${delay}ms`,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}

export function ConfettiCelebration({ trigger, onComplete }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (trigger) {
      const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#c8fa1b', '#f94231', '#0f27a2', '#a855f7']
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 300,
        left: Math.random() * 100,
      }))
      setPieces(newPieces)

      // Nettoyage après 1.5s
      const timer = setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (pieces.length === 0) return null

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map(p => (
        <ConfettiPiece key={p.id} color={p.color} delay={p.delay} left={p.left} />
      ))}
    </div>
  )
}