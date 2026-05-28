import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile.jsx'

const AVATARS = ['🦁','🐯','🐻','🐼','🐨','🐸','🦊','🐰','🐹','🐶','🐱','🦄','🐧','🦋','🦖','🌟']

const CARD_COLORS = [
  'from-red-400 to-red-500',
  'from-blue-400 to-blue-500',
  'from-green-400 to-green-500',
  'from-yellow-400 to-orange-400',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-orange-400 to-orange-500',
  'from-teal-400 to-cyan-500',
]

export default function ProfileSelect() {
  const { profiles, createProfile, selectProfile } = useProfile()
  const [adding, setAdding] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('Please enter a name!'); return }
    setLoading(true)
    setError('')
    await createProfile(name.trim(), avatar)
    setLoading(false)
  }

  const resetForm = () => {
    setAdding(false)
    setName('')
    setAvatar(AVATARS[0])
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-3 float">🌟</div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">
          {profiles.length === 0 ? 'Welcome! Create a Profile' : "Who's Learning Today?"}
        </h1>
      </motion.div>

      {profiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-xl mb-6">
          {profiles.map((profile, i) => (
            <motion.button
              key={profile.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', bounce: 0.5 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectProfile(profile.id)}
              className={`bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]} rounded-3xl p-6 flex flex-col items-center gap-3 shadow-xl border-b-4 border-black/10`}
              aria-label={`Select profile: ${profile.name}`}
            >
              <span className="text-6xl">{profile.avatar}</span>
              <span className="text-2xl font-black text-white drop-shadow">{profile.name}</span>
            </motion.button>
          ))}

          {!adding && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: profiles.length * 0.08, type: 'spring', bounce: 0.5 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAdding(true)}
              className="bg-white/30 hover:bg-white/50 border-4 border-dashed border-white/70 rounded-3xl p-6 flex flex-col items-center gap-3"
              aria-label="Add new child profile"
            >
              <span className="text-6xl">➕</span>
              <span className="text-xl font-black text-white">Add Child</span>
            </motion.button>
          )}
        </div>
      )}

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md"
          >
            <h2 className="text-2xl font-black text-purple-700 mb-6 text-center">
              {profiles.length === 0 ? "Create Your First Profile" : "New Child Profile"}
            </h2>

            <div className="mb-5">
              <label htmlFor="profileName" className="block text-lg font-black text-gray-700 mb-2">
                Child's Name
              </label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Alex"
                className="w-full border-4 border-purple-300 rounded-2xl px-4 py-3 text-2xl font-bold text-gray-700 focus:border-purple-500 focus:outline-none"
                maxLength={20}
                autoFocus
                aria-label="Enter child's name"
              />
              {error && <p className="text-red-500 font-bold mt-2">{error}</p>}
            </div>

            <div className="mb-4">
              <p className="text-lg font-black text-gray-700 mb-3">Pick an Avatar</p>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map(em => (
                  <button
                    key={em}
                    onClick={() => setAvatar(em)}
                    className={`text-3xl rounded-xl p-1 transition-all ${
                      avatar === em
                        ? 'bg-purple-200 scale-125 ring-4 ring-purple-400'
                        : 'hover:bg-gray-100'
                    }`}
                    aria-label={`Avatar ${em}`}
                    aria-pressed={avatar === em}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-6xl mb-6 float" aria-hidden>{avatar}</div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="flex-1 bg-green-400 hover:bg-green-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg disabled:opacity-50 transition-colors"
                aria-label="Create profile and start"
              >
                {loading ? '⏳ Creating...' : "Let's Go! 🚀"}
              </motion.button>
              {profiles.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-600 font-black text-xl py-4 px-6 rounded-2xl hover:bg-gray-300 transition-colors"
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
