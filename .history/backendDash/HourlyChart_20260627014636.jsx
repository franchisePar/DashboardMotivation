import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function HourlyChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.bookings), 1)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
        }}>
          <div style={{ color: 'var(--muted)', marginBottom: '4px' }}>
            {String(label).padStart(2, '0')}:00 - {String(label).padStart(2, '0')}:59
          </div>
          <div style={{ color: '#f0f6ff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {payload[0].value} bookings
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="hourly-chart" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      minHeight: '280px',
    }}>
      <div className="panel__header">
        <span className="panel__title">Hourly Activity</span>
        <span className="panel__badge">TODAY</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickFormatter={(v) => `${String(v).padStart(2, '0')}h`}
              axisLine={{ stroke: '#1a2d45' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
            <Bar dataKey="bookings" radius={[4, 4, 0, 0]} animationDuration={800}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.bookings > 0 ? 'var(--accent)' : '#1a2d45'}
                  fillOpacity={entry.bookings > 0 ? 0.8 + (entry.bookings / maxVal) * 0.2 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}