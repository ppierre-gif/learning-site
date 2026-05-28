import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSettings } from '../hooks/useSettings.jsx'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'

const THEMES = [
  { id: 'rainbow', label: 'Rainbow', emoji: '🌈' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅' },
  { id: 'candy', label: 'Candy', emoji: '🍭' },
]

const FONT_SIZES = [
  { id: 'normal', label: 'Normal', emoji: 'A' },
  { id: 'large', label: 'Large', emoji: 'A' },
  { id: 'xlarge', label: 'Extra Large', emoji: 'A' },
]

const SESSION_LIMITS = [15, 30, 45]

export default function Settings() {
  const { settings, updateSettings, theme } = useSettings()
  const { resetProgress } = useProgress()
  const { play } = useAudio()
  const [confirmReset, setConfirmReset] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (updates) => {
    play('click')
    updateSettings(updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleReset = () => {
    if (confirmReset) {
      resetProgress()
      setConfirmReset(false)
      play('click')
    } else {
      setConfirmReset(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-xl mx-auto">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">⚙️ Settings</h1>

      {saved && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="bg-green-400 text-white font-black text-xl rounded-2xl px-6 py-3 shadow-lg">
          ✓ Saved!
        </motion.div>
      )}

      {/* Font size */}
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
        <p className="text-2xl font-black text-gray-700 mb-4">🔤 Text Size</p>
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map(fs => (
            <motion.button key={fs.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleSave({ fontSize: fs.id })}
              aria-pressed={settings.fontSize === fs.id}
              className={`rounded-2xl py-4 font-black transition-all ${
                settings.fontSize === fs.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }`}
              style={{ fontSize: fs.id === 'normal' ? '18px' : fs.id === 'large' ? '22px' : '26px' }}>
              {fs.emoji}<br /><span className="text-base">{fs.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
        <label htmlFor="volume" className="block text-2xl font-black text-gray-700 mb-4">
          🔊 Volume: {settings.volume}%
        </label>
        <input id="volume" type="range" min="0" max="100" value={settings.volume}
          onChange={e => updateSettings({ volume: Number(e.target.value) })}
          onMouseUp={() => play('click')}
          className="w-full h-4 rounded-full accent-purple-500 cursor-pointer"
          aria-label={`Volume: ${settings.volume}%`}
        />
        <div className="flex justify-between text-gray-400 font-bold mt-1">
          <span>🔇 Off</span><span>🔊 Loud</span>
        </div>
      </div>

      {/* Session limit */}
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
        <p className="text-2xl font-black text-gray-700 mb-4">⏱️ Session Time Limit</p>
        <div className="grid grid-cols-3 gap-3">
          {SESSION_LIMITS.map(mins => (
            <motion.button key={mins} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleSave({ sessionLimit: mins })}
              aria-pressed={settings.sessionLimit === mins}
              className={`rounded-2xl py-4 font-black text-xl transition-all ${
                settings.sessionLimit === mins
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
              }`}>
              {mins} min
            </motion.button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
        <p className="text-2xl font-black text-gray-700 mb-4">🎨 Colour Theme</p>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map(t => (
            <motion.button key={t.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => handleSave({ theme: t.id })}
              aria-pressed={settings.theme === t.id}
              aria-label={`${t.label} theme`}
              className={`rounded-2xl py-3 flex flex-col items-center gap-1 font-bold text-sm transition-all ${
                settings.theme === t.id ? 'ring-4 ring-purple-500 bg-purple-50' : 'bg-gray-100 hover:bg-purple-50'
              }`}>
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-gray-700">{t.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reset progress */}
      <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
        <p className="text-2xl font-black text-gray-700 mb-4">🔄 Reset Progress</p>
        <p className="text-gray-500 font-bold mb-4">This will remove all stars and trophies.</p>
        {confirmReset ? (
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex-1 bg-red-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg"
              aria-label="Confirm reset all progress">
              Yes, Reset Everything
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setConfirmReset(false)}
              className="flex-1 bg-gray-200 text-gray-700 font-black text-xl py-4 rounded-2xl"
              aria-label="Cancel reset">
              Cancel
            </motion.button>
          </div>
        ) : (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-full bg-red-100 text-red-600 font-black text-xl py-4 rounded-2xl hover:bg-red-200 transition-colors"
            aria-label="Reset all progress">
            🗑️ Reset All Progress
          </motion.button>
        )}
      </div>
    </div>
  )
}
