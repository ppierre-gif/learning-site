import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useProgress } from '../hooks/useProgress.jsx'
import { useSettings } from '../hooks/useSettings.jsx'
import { useProfile } from '../hooks/useProfile.jsx'

const PIN = '1234'

const MODULE_LABELS = {
  letters:    '📚 Letters',
  spelling:   '✏️ Spelling',
  numbers:    '🔢 Numbers',
  lifeskills: '⏰ Life Skills',
  colors:     '🎨 Colours',
  music:      '🎵 Music',
}

const CARD_COLORS = [
  'bg-red-400','bg-blue-400','bg-green-400','bg-yellow-400',
  'bg-purple-400','bg-pink-400','bg-orange-400','bg-teal-400',
]

export default function ParentDashboard() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const { progress, getLast7Days, resetProgress, allTrophies } = useProgress()
  const { settings } = useSettings()
  const { currentProfile, profiles, selectProfile, deleteProfile, signOut } = useProfile()

  const handlePin = (digit) => {
    const next = pin + digit
    setPin(next)
    if (next.length === 4) {
      if (next === PIN) {
        setUnlocked(true)
        setPinError(false)
      } else {
        setPinError(true)
        setTimeout(() => { setPin(''); setPinError(false) }, 1000)
      }
    }
  }

  const handleBackspace = () => setPin(p => p.slice(0, -1))

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-8 max-w-sm mx-auto py-12">
        <div className="text-7xl">🔒</div>
        <h1 className="text-3xl font-black text-white drop-shadow-lg">Parent Dashboard</h1>
        <p className="text-white/90 font-bold text-xl">Enter your 4-digit PIN</p>

        <div className="flex gap-3 justify-center">
          {[0,1,2,3].map(i => (
            <div key={i}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black transition-colors ${
                pinError ? 'bg-red-400 text-white' :
                pin.length > i ? 'bg-white text-purple-700' : 'bg-white/30 text-transparent'
              }`}
              aria-label={pin.length > i ? 'PIN digit entered' : 'PIN digit empty'}>
              {pin.length > i ? '●' : '○'}
            </div>
          ))}
        </div>

        {pinError && <p className="text-red-300 font-black text-xl">Wrong PIN! Try again.</p>}

        <div className="grid grid-cols-3 gap-3 w-full" role="group" aria-label="PIN keypad">
          {[1,2,3,4,5,6,7,8,9].map(d => (
            <motion.button key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={() => handlePin(String(d))}
              aria-label={`Digit ${d}`}
              className="bg-white text-purple-700 font-black text-3xl rounded-2xl shadow-lg flex items-center justify-center"
              style={{ height: '72px' }}>
              {d}
            </motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            onClick={handleBackspace} aria-label="Backspace"
            className="bg-white/30 text-white font-black text-2xl rounded-2xl shadow-lg flex items-center justify-center"
            style={{ height: '72px' }}>⌫</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            onClick={() => handlePin('0')} aria-label="Digit 0"
            className="bg-white text-purple-700 font-black text-3xl rounded-2xl shadow-lg flex items-center justify-center"
            style={{ height: '72px' }}>0</motion.button>
          <div />
        </div>
      </div>
    )
  }

  const weekData = getLast7Days()
  const moduleData = Object.entries(progress.moduleStars).map(([key, stars]) => ({
    name: MODULE_LABELS[key] || key,
    stars,
  }))

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black text-white drop-shadow-lg">📊 Parent Dashboard</h1>
        <button onClick={() => setUnlocked(false)}
          className="bg-white/30 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/50"
          aria-label="Lock dashboard">
          🔒 Lock
        </button>
      </div>

      {/* Profiles */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-700 mb-4">👤 Profiles</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {profiles.map((profile, i) => (
            <div key={profile.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow ${
                profile.id === currentProfile?.id
                  ? 'bg-purple-500 text-white ring-4 ring-purple-300'
                  : 'bg-gray-100 text-gray-700'
              }`}>
              <span className="text-3xl">{profile.avatar}</span>
              <span className="font-black text-lg">{profile.name}</span>
              {profile.id === currentProfile?.id && (
                <span className="text-xs bg-white/30 rounded-full px-2 py-0.5 font-bold">Active</span>
              )}
              {profile.id !== currentProfile?.id && (
                <button
                  onClick={() => selectProfile(profile.id)}
                  className="text-sm bg-purple-500 text-white font-bold px-3 py-1 rounded-xl hover:bg-purple-600 transition-colors"
                  aria-label={`Switch to ${profile.name}`}>
                  Switch
                </button>
              )}
              {confirmDelete === profile.id ? (
                <div className="flex gap-2">
                  <button onClick={() => { deleteProfile(profile.id); setConfirmDelete(null) }}
                    className="text-sm bg-red-500 text-white font-bold px-3 py-1 rounded-xl hover:bg-red-600"
                    aria-label={`Confirm delete ${profile.name}`}>
                    Delete
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="text-sm bg-gray-300 text-gray-700 font-bold px-3 py-1 rounded-xl"
                    aria-label="Cancel delete">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(profile.id)}
                  className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors ml-1"
                  aria-label={`Delete ${profile.name}`}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={signOut}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-2xl transition-colors"
          aria-label="Switch to profile select screen">
          🔄 Switch Child
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '⭐', label: 'Total Stars',    value: progress.stars },
          { icon: '🔥', label: 'Best Streak',    value: progress.bestStreak },
          { icon: '🏆', label: 'Trophies',       value: allTrophies.filter(t => t.earned).length },
          { icon: '📅', label: "Today's Stars",  value: progress.dailyStars[new Date().toISOString().split('T')[0]] || 0 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-3xl p-4 text-center shadow-xl">
            <div className="text-4xl">{s.icon}</div>
            <div className="text-3xl font-black text-purple-700">{s.value}</div>
            <div className="text-sm font-bold text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stars per day chart */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-700 mb-4">⭐ Stars This Week</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 14 }} />
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip formatter={v => [`${v} stars`, 'Stars']} />
            <Bar dataKey="stars" fill="#7C3AED" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stars per module */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-700 mb-4">📚 Stars per Module</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={moduleData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 14 }} />
            <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 13 }} />
            <Tooltip formatter={v => [`${v} stars`, 'Stars']} />
            <Bar dataKey="stars" fill="#22C55E" radius={[0,8,8,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Unlocked levels */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-700 mb-4">🔓 Levels Unlocked</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(progress.unlockedLevels).map(([mod, level]) => (
            <div key={mod} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
              <span className="text-2xl">{MODULE_LABELS[mod]?.split(' ')[0]}</span>
              <div>
                <p className="font-black text-gray-700">{MODULE_LABELS[mod]?.slice(2)}</p>
                <p className="text-purple-600 font-bold">Level {level} / 3</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings summary */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-700 mb-4">⚙️ Current Settings</h2>
        <div className="grid grid-cols-2 gap-3 text-lg font-bold text-gray-600">
          <div>Profile: <span className="text-purple-700">{currentProfile?.avatar} {currentProfile?.name}</span></div>
          <div>Session limit: <span className="text-purple-700">{settings.sessionLimit} min</span></div>
          <div>Font size: <span className="text-purple-700">{settings.fontSize}</span></div>
          <div>Theme: <span className="text-purple-700">{settings.theme}</span></div>
        </div>
      </div>

      {/* Reset progress */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-700 mb-2">🔄 Reset Progress</h2>
        <p className="text-gray-500 font-bold mb-4">
          Clears all stars, trophies, and streaks for <strong>{currentProfile?.name}</strong>.
        </p>
        <button onClick={resetProgress}
          className="bg-red-100 text-red-600 font-black text-xl py-4 px-8 rounded-2xl hover:bg-red-200 transition-colors"
          aria-label="Reset all progress for current profile">
          🗑️ Reset Progress
        </button>
      </div>
    </div>
  )
}
