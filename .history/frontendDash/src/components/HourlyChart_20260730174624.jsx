import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function HourlyChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.bookings), 1)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '12px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ color: 'var(--muted)', marginBottom: '4px', fontWeight: 500 }}>
            {String(label).padStart(2, '0')}:00 – {String(label).padStart(2, '0')}:59
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: '14px' }}>
            {payload[0].value} bookings
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-card)',
      borderRadius: '14px',
      boxShadow: 'var(--card-shadow)',
      border: '1px solid var(--border)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px',
      }}>
        Reservations This Hour
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
              tickFormatter={(v) => `${String(v).padStart(2, '0')}h`}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--united-light)' }} />
            <Bar dataKey="bookings" radius={[4, 4, 0, 0]} animationDuration={800}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.bookings > 0 ? 'var(--united)' : 'var(--border)'}
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