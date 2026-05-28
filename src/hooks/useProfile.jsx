import { createContext, useContext, useState, useEffect } from 'react'
import { loadProfiles, createProfileRemote, deleteProfileRemote } from '../lib/supabase'

const PROFILES_KEY = 'learning-site-profiles'
const CURRENT_KEY = 'learning-site-current-profile'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || [] }
    catch { return [] }
  })
  const [currentId, setCurrentId] = useState(
    () => localStorage.getItem(CURRENT_KEY) || null
  )

  useEffect(() => {
    loadProfiles().then(remote => {
      if (!remote.length) return
      setProfiles(prev => {
        const remoteIds = new Set(remote.map(p => p.id))
        const merged = [
          ...remote.map(r => ({ id: r.id, name: r.name, avatar: r.avatar })),
          ...prev.filter(p => !remoteIds.has(p.id)),
        ]
        localStorage.setItem(PROFILES_KEY, JSON.stringify(merged))
        return merged
      })
    })
  }, [])

  const selectProfile = (id) => {
    setCurrentId(id)
    if (id) localStorage.setItem(CURRENT_KEY, id)
    else localStorage.removeItem(CURRENT_KEY)
  }

  const createProfile = async (name, avatar) => {
    const remote = await createProfileRemote(name, avatar)
    const profile = remote
      ? { id: remote.id, name: remote.name, avatar: remote.avatar }
      : { id: crypto.randomUUID(), name, avatar }
    setProfiles(prev => {
      const next = [...prev, profile]
      localStorage.setItem(PROFILES_KEY, JSON.stringify(next))
      return next
    })
    selectProfile(profile.id)
    return profile
  }

  const deleteProfile = async (id) => {
    await deleteProfileRemote(id)
    localStorage.removeItem(`learning-site-progress-${id}`)
    localStorage.removeItem(`learning-site-settings-${id}`)
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id)
      localStorage.setItem(PROFILES_KEY, JSON.stringify(next))
      return next
    })
    if (currentId === id) {
      const remaining = profiles.filter(p => p.id !== id)
      selectProfile(remaining[0]?.id || null)
    }
  }

  const signOut = () => selectProfile(null)

  const currentProfile = profiles.find(p => p.id === currentId) || null

  return (
    <ProfileContext.Provider value={{ profiles, currentProfile, selectProfile, createProfile, deleteProfile, signOut }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
