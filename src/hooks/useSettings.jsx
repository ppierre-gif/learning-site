import { createContext, useContext, useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../lib/supabase'

const defaultSettings = {
  fontSize: 'normal',
  volume: 80,
  theme: 'rainbow',
  sessionLimit: 30,
}

const themes = {
  rainbow: { bg: 'from-purple-400 via-pink-400 to-yellow-400', card: 'bg-purple-100', accent: '#7C3AED', nav: 'bg-purple-600' },
  ocean:   { bg: 'from-blue-400 via-cyan-400 to-teal-400',     card: 'bg-blue-100',   accent: '#0369A1', nav: 'bg-blue-600' },
  forest:  { bg: 'from-green-400 via-emerald-400 to-lime-400', card: 'bg-green-100',  accent: '#15803D', nav: 'bg-green-600' },
  sunset:  { bg: 'from-orange-400 via-red-400 to-pink-400',    card: 'bg-orange-100', accent: '#EA580C', nav: 'bg-orange-600' },
  candy:   { bg: 'from-pink-400 via-rose-400 to-fuchsia-400',  card: 'bg-pink-100',   accent: '#DB2777', nav: 'bg-pink-600' },
}

const fontSizes = {
  normal: { base: '24px', title: '2rem',   btn: '1.3rem' },
  large:  { base: '28px', title: '2.4rem', btn: '1.5rem' },
  xlarge: { base: '32px', title: '2.8rem', btn: '1.8rem' },
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children, profileId }) {
  const storageKey = `learning-site-settings-${profileId}`

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  useEffect(() => {
    getSettings(profileId).then(remote => {
      if (remote) {
        setSettings(prev => {
          const next = { ...prev, ...remote }
          localStorage.setItem(storageKey, JSON.stringify(next))
          return next
        })
      }
    })
  }, [profileId])

  const updateSettings = (updates) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    saveSettings(profileId, next)
  }

  const theme = themes[settings.theme] || themes.rainbow
  const fontSize = fontSizes[settings.fontSize] || fontSizes.normal

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, theme, fontSize, themes, fontSizes }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
