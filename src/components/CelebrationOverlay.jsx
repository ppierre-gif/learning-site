import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'

export default function CelebrationOverlay() {
  const { newTrophies, dismissTrophies } = useProgress()
  const { play } = useAudio()
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handler = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (newTrophies.length > 0) {
      play('trophy')
    }
  }, [newTrophies, play])

  if (!newTrophies.length) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <ReactConfetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} recycle={false} />
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm mx-4"
        >
          {newTrophies.map(t => (
            <div key={t.id} className="mb-6">
              <div className="text-8xl mb-4 float" role="img" aria-label={t.name}>{t.icon}</div>
              <h2 className="text-3xl font-black text-purple-700 mb-2">New Trophy!</h2>
              <p className="text-2xl font-bold text-gray-700">{t.name}</p>
            </div>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={dismissTrophies}
            className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black text-2xl px-8 py-4 rounded-2xl shadow-lg w-full"
            aria-label="Close trophy notification"
          >
            Yay! 🎉
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
