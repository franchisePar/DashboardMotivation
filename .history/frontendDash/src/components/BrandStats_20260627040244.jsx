import { brandColor, brandGlow, brandLogo, formatNumber } from '../format'

// ... dans le return, remplace la partie dot par :
<span
  className="brand-stats__logo"
  style={{
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    border: `2px solid ${color}`,
    boxShadow: `0 0 8px ${brandGlow(brand)}`,
  }}
>
  <img 
    src={brandLogo(brand)} 
    alt={brand}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    onError={(e) => {
      // Fallback si le logo ne charge pas
      e.target.style.display = 'none'
      e.target.parentElement.style.background = color
    }}
  />
</span>