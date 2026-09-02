import { useEffect, useState } from 'react'

const LOGOS = {
  united: {
    light: '/assets/logos/United_Logo_BG.png',
    dark: '/assets/logos/united-white-Logo.png',
  },
  movis: {
    light: '/assets/logos/Movis_Logo_BG.png',
    dark: '/assets/logos/Movis_Logo_BG.png', // same for both
  },
  drivo: {
    light: '/assets/logos/Drivo_Logo_BG.png',
    dark: '/assets/logos/Drivo_Logo_BG.png', // same for both
  },
}

export function BrandLogo({ brand, height = 24 }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      setTheme(isDark ? 'dark' : 'light')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    
    // Initial check
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    setTheme(isDark ? 'dark' : 'light')
    
    return () => observer.disconnect()
  }, [])

  const config = LOGOS[brand.toLowerCase()] || LOGOS.united
  const src = config[theme]

  return (
    <img 
      src={src} 
      alt={brand} 
      style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }} 
    />
  )
}