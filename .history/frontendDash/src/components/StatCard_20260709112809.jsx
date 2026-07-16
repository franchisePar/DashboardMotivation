import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ label, value, icon, color, sub, trend, trendValue, sparklineColor }) {
  const [flash, setFlash] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 600)
      prevValue.current = value
      return () => clearTimeout(timer)
    }
  }, [value])

  const cardStyle = {
    flex: 1,
    background: '#ffffff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s',
    minWidth: 0,
  }

  const iconStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    background: `${color}12`,
    color: color,
  }

  const trendStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '6px',
    background: trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
    color: trend === 'up' ? '#22c55e' : '#ef4444',
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={iconStyle}>{icon}</div>
      </div>
      
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', letterSpacing: '-1px', lineHeight: 1.2 }}>
        {value}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
        {trend && (
          <span style={trendStyle}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
        {sub && <span style={{ fontSize: '12px', color: '#64748b' }}>{sub}</span>}
        
        {sparklineColor && (
          <svg width="60" height="24" viewBox="0 0 60 24" style={{ marginLeft: 'auto' }}>
            <polyline
              points="0,18 10,14 20,16 30,10 40,12 50,6 60,4"
              fill="none"
              stroke={sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </svg>
        )}
      </div>
    </div>
  )
}