export function SkeletonLoader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '24px',
      height: '100vh',
    }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px' }}>
        <div className="skeleton" style={{ width: '200px', height: '24px' }} />
        <div className="skeleton" style={{ width: '120px', height: '24px' }} />
        <div className="skeleton" style={{ width: '150px', height: '24px' }} />
      </div>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ width: '60%', height: '14px' }} />
            <div className="skeleton" style={{ width: '40%', height: '40px' }} />
            <div className="skeleton" style={{ width: '80%', height: '14px' }} />
          </div>
        ))}
      </div>
      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ width: '40%', height: '14px' }} />
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton" style={{ width: '30%', height: '12px' }} />
              <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ width: '40%', height: '14px' }} />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ width: `${60 + Math.random() * 40}%`, height: '12px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}