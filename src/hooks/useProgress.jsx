import { createContext, useContext, useState, useEffect } from 'react'
import { logSession, earnTrophy, loadProgress, saveProgress } from '../lib/supabase'

// storageKey is set per provider instance via profileId prop

const defaultProgress = {
  stars: 0,
  streak: 0,
  bestStreak: 0,
  trophies: [],
  moduleStars: { letters: 0, numbers: 0, lifeskills: 0, colors: 0, music: 0 },
  dailyStars: {},
  unlockedLevels: { letters: 1, numbers: 1, lifeskills: 1, colors: 1 },
}

const TROPHY_MILESTONES = [
  { id: 'first_star', name: 'First Star!', icon: '⭐', condition: p => p.stars >= 1 },
  { id: 'five_stars', name: '5 Stars', icon: '🌟', condition: p => p.stars >= 5 },
  { id: 'ten_stars', name: 'Star Collector', icon: '💫', condition: p => p.stars >= 10 },
  { id: 'twenty_five_stars', name: 'Star Power!', icon: '✨', condition: p => p.stars >= 25 },
  { id: 'fifty_stars', name: 'Super Star', icon: '🏆', condition: p => p.stars >= 50 },
  { id: 'streak_5', name: '5 in a Row!', icon: '🔥', condition: p => p.bestStreak >= 5 },
  { id: 'streak_10', name: 'On Fire!', icon: '🚀', condition: p => p.bestStreak >= 10 },
  { id: 'letter_master', name: 'Letter Master', icon: '📚', condition: p => (p.moduleStars.letters || 0) >= 15 },
  { id: 'math_whiz', name: 'Math Whiz', icon: '🔢', condition: p => (p.moduleStars.numbers || 0) >= 15 },
  { id: 'life_skills', name: 'Life Skills Pro', icon: '⏰', condition: p => (p.moduleStars.lifeskills || 0) >= 15 },
  { id: 'color_artist', name: 'Color Artist', icon: '🎨', condition: p => (p.moduleStars.colors || 0) >= 15 },
  { id: 'musician', name: 'Musician', icon: '🎵', condition: p => (p.moduleStars.music || 0) >= 5 },
]

const ProgressContext = createContext(null)

export function ProgressProvider({ children, profileId }) {
  const storageKey = `learning-site-progress-${profileId}`

  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress
    } catch {
      return defaultProgress
    }
  })
  const [newTrophies, setNewTrophies] = useState([])

  useEffect(() => {
    loadProgress(profileId).then(remote => {
      if (!remote) return
      const fromRemote = {
        ...defaultProgress,
        stars: remote.stars ?? 0,
        streak: remote.streak ?? 0,
        bestStreak: remote.best_streak ?? 0,
        trophies: remote.trophies ?? [],
        moduleStars: remote.module_stars ?? {},
        dailyStars: remote.daily_stars ?? {},
        unlockedLevels: remote.unlocked_levels ?? {},
      }
      setProgress(fromRemote)
      localStorage.setItem(storageKey, JSON.stringify(fromRemote))
    })
  }, [profileId])

  const save = (next) => {
    setProgress(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    saveProgress(profileId, next)
  }

  const checkTrophies = (next) => {
    const earned = []
    for (const trophy of TROPHY_MILESTONES) {
      if (!next.trophies.includes(trophy.id) && trophy.condition(next)) {
        earned.push(trophy)
        next.trophies = [...next.trophies, trophy.id]
        earnTrophy(trophy.name, trophy.icon)
      }
    }
    if (earned.length) setNewTrophies(earned)
    return next
  }

  const addStar = (module) => {
    const today = new Date().toISOString().split('T')[0]
    let next = {
      ...progress,
      stars: progress.stars + 1,
      streak: progress.streak + 1,
      bestStreak: Math.max(progress.bestStreak, progress.streak + 1),
      moduleStars: {
        ...progress.moduleStars,
        [module]: (progress.moduleStars[module] || 0) + 1,
      },
      dailyStars: {
        ...progress.dailyStars,
        [today]: (progress.dailyStars[today] || 0) + 1,
      },
    }
    const newLevel = Math.floor(next.moduleStars[module] / 10) + 1
    if (newLevel > (next.unlockedLevels[module] || 1) && newLevel <= 3) {
      next.unlockedLevels = { ...next.unlockedLevels, [module]: newLevel }
    }
    next = checkTrophies(next)
    save(next)
  }

  const breakStreak = () => {
    save({ ...progress, streak: 0 })
  }

  const resetProgress = () => {
    save(defaultProgress)
    setNewTrophies([])
  }

  const dismissTrophies = () => setNewTrophies([])

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      days.push({ date: key, stars: progress.dailyStars[key] || 0 })
    }
    return days
  }

  const allTrophies = TROPHY_MILESTONES.map(t => ({
    ...t,
    earned: progress.trophies.includes(t.id),
  }))

  return (
    <ProgressContext.Provider value={{ progress, addStar, breakStreak, resetProgress, newTrophies, dismissTrophies, getLast7Days, allTrophies }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}
