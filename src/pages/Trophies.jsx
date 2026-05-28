import { motion } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'
import { useSettings } from '../hooks/useSettings.jsx'

export default function Trophies() {
  const { allTrophies, progress } = useProgress()
  const { theme } = useSettings()

  const earned = allTrophies.filter(t => t.earned)
  const locked = allTrophies.filter(t => !t.earned)

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-lg">🏆 My Trophies</h1>
        <p className="text-xl text-white/90 font-bold mt-2">
          {earned.length} / {allTrophies.length} trophies earned!
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
        {[
          { icon: '⭐', label: 'Total Stars', value: progress.stars },
          { icon: '🔥', label: 'Best Streak', value: progress.bestStreak },
          { icon: '🏆', label: 'Trophies', value: earned.length },
        ].map(stat => (
          <motion.div key={stat.label} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-white rounded-3xl p-4 text-center shadow-xl">
            <div className="text-4xl" role="img" aria-label={stat.label}>{stat.icon}</div>
            <div className="text-3xl font-black text-purple-700 mt-1">{stat.value}</div>
            <div className="text-sm font-bold text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Earned trophies */}
      {earned.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-black text-white mb-4 text-center">🌟 Earned!</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earned.map((trophy, i) => (
              <motion.div key={trophy.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', bounce: 0.5 }}
                className="bg-yellow-300 border-4 border-yellow-500 rounded-3xl p-5 text-center shadow-xl"
                aria-label={`Trophy: ${trophy.name}`}
              >
                <div className="text-5xl mb-2 float" role="img" aria-label={trophy.name}>{trophy.icon}</div>
                <p className="text-lg font-black text-yellow-900">{trophy.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked trophies */}
      {locked.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-black text-white mb-4 text-center">🔒 Coming soon...</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {locked.map(trophy => (
              <div key={trophy.id}
                className="bg-white/20 border-4 border-white/30 rounded-3xl p-5 text-center"
                aria-label={`Locked trophy: ${trophy.name}`}>
                <div className="text-5xl mb-2 opacity-30" role="img" aria-label="locked">{trophy.icon}</div>
                <p className="text-lg font-black text-white/60">{trophy.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center shadow-xl max-w-sm">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-2xl font-black text-purple-700">Start learning to earn your first trophy!</p>
        </motion.div>
      )}
    </div>
  )
}
