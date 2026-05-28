import { motion, AnimatePresence } from 'framer-motion'

export default function FeedbackBanner({ type, message }) {
  if (!type) return null
  const isCorrect = type === 'correct'
  return (
    <AnimatePresence>
      <motion.div
        key={message}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={`rounded-3xl p-6 text-center font-black text-2xl shadow-lg ${
          isCorrect
            ? 'bg-green-400 text-green-900'
            : 'bg-yellow-300 text-yellow-900'
        }`}
        role="alert"
        aria-live="assertive"
      >
        <span className="text-4xl block mb-1">{isCorrect ? '🌟' : '💪'}</span>
        {message}
      </motion.div>
    </AnimatePresence>
  )
}
