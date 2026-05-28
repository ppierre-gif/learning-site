import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../hooks/useSettings.jsx'
import { useAudio } from '../hooks/useAudio.jsx'

export default function SessionTimer() {
  const { settings } = useSettings()
  const { play } = useAudio()
  const limitMs = settings.sessionLimit * 60 * 1000
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [showBreak, setShowBreak] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 10000)
    return () => clearInterval(interval)
  }, [startTime])

  useEffect(() => {
    if (!dismissed && elapsed >= limitMs) {
      setShowBreak(true)
      play('complete')
    }
  }, [elapsed, limitMs, dismissed, play])

  return (
    <AnimatePresence>
      {showBreak && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal
          aria-label="Break time reminder"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl"
          >
            <div className="text-8xl mb-4 float">☕</div>
            <h2 className="text-3xl font-black text-purple-700 mb-3">Time for a Break!</h2>
            <p className="text-2xl font-bold text-gray-600 mb-6">
              You've been learning for {settings.sessionLimit} minutes.<br />
              Great work! Take a rest.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowBreak(false); setDismissed(true) }}
              className="w-full bg-green-400 hover:bg-green-500 text-white font-black text-2xl py-4 rounded-2xl shadow-lg"
              aria-label="Continue learning"
            >
              Keep Going! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
