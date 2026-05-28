import { motion } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'

export default function StarCounter() {
  const { progress } = useProgress()

  return (
    <motion.div
      className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-full px-4 py-2 font-bold shadow-lg"
      whileHover={{ scale: 1.05 }}
      aria-label={`${progress.stars} stars earned`}
    >
      <span className="text-2xl" role="img" aria-hidden>⭐</span>
      <span className="text-xl font-black">{progress.stars}</span>
      {progress.streak > 1 && (
        <span className="ml-1 text-sm bg-orange-500 text-white rounded-full px-2 py-0.5" aria-label={`${progress.streak} in a row`}>
          🔥{progress.streak}
        </span>
      )}
    </motion.div>
  )
}
