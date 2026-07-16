import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './HourlyChart.css'

export function HourlyChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.bookings), 1)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            {String(label).padStart(2, '0')}:00 – {String(label).padStart(2, '0')}:59
          </div>
          <div style={{ color: '#1e293b', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
            {payload[0].value} bookings
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="hourly-card">
      <div className="hourly-card__header">Reservations This Hour</div>
      <div className="hourly-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickFormatter={(v) => `${String(v).padStart(2, '0')}h`}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)' }} />
            <Bar dataKey="bookings" radius={[4, 4, 0, 0]} animationDuration={800}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.bookings > 0 ? '#0f27a2' : '#e2e8f0'}
                  fillOpacity={entry.bookings > 0 ? 0.7 + (entry.bookings / maxVal) * 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}