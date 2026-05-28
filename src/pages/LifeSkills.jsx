import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'
import FeedbackBanner from '../components/FeedbackBanner'
import { logWrongAnswer } from '../lib/supabase'

const TABS = ['Clock', 'Coins', 'Daily Life']

const COINS = [
  { name: '1p', value: 1, emoji: '🪙', color: 'bg-amber-700' },
  { name: '2p', value: 2, emoji: '🪙', color: 'bg-amber-600' },
  { name: '5p', value: 5, emoji: '🥈', color: 'bg-gray-400' },
  { name: '10p', value: 10, emoji: '🥈', color: 'bg-gray-500' },
  { name: '20p', value: 20, emoji: '🥈', color: 'bg-gray-400' },
  { name: '50p', value: 50, emoji: '🥈', color: 'bg-gray-500' },
  { name: '£1', value: 100, emoji: '🪙', color: 'bg-yellow-500' },
  { name: '£2', value: 200, emoji: '🪙', color: 'bg-yellow-600' },
]

const SCENARIOS = [
  { q: 'You wake up at 7am. School starts at 9am. How many hours do you have?', options: ['1 hour', '2 hours', '3 hours', '4 hours'], correct: '2 hours' },
  { q: 'You go to bed at 8pm. It is now 6pm. How long until bed time?', options: ['1 hour', '2 hours', '3 hours', '4 hours'], correct: '2 hours' },
  { q: 'Lunch is at 12pm. Dinner is at 6pm. How many hours between them?', options: ['4 hours', '5 hours', '6 hours', '7 hours'], correct: '6 hours' },
  { q: 'You have £1. You spend 50p. How much is left?', options: ['25p', '50p', '75p', '£1'], correct: '50p' },
  { q: 'Which meal do you eat in the morning?', options: ['Breakfast', 'Lunch', 'Dinner', 'Supper'], correct: 'Breakfast' },
  { q: 'What do you do before bed to keep your teeth clean?', options: ['Brush teeth', 'Eat sweets', 'Watch TV', 'Run around'], correct: 'Brush teeth' },
]

function ClockFace({ hour, minute }) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5
  const minuteAngle = minute * 6
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-label={`Clock showing ${hour}:${String(minute).padStart(2,'0')}`}>
      <circle cx="100" cy="100" r="95" fill="white" stroke="#7C3AED" strokeWidth="6" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180
        return <text key={i} x={100 + 78 * Math.cos(angle)} y={104 + 78 * Math.sin(angle)}
          textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4B5563">{i === 0 ? 12 : i}</text>
      })}
      {/* Hour hand */}
      <line x1="100" y1="100"
        x2={100 + 50 * Math.cos((hourAngle - 90) * Math.PI / 180)}
        y2={100 + 50 * Math.sin((hourAngle - 90) * Math.PI / 180)}
        stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="100" y1="100"
        x2={100 + 70 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
        y2={100 + 70 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
        stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="5" fill="#EF4444" />
    </svg>
  )
}

function ClockGame({ level, onComplete }) {
  const hours = [3, 6, 9, 12, 1, 2, 4, 5, 7, 8, 10, 11]
  const minutes = level === 1 ? [0] : level === 2 ? [0, 30] : [0, 15, 30, 45]
  const [targetHour] = useState(() => hours[Math.floor(Math.random() * hours.length)])
  const [targetMin] = useState(() => minutes[Math.floor(Math.random() * minutes.length)])
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()

  const minLabel = targetMin === 0 ? "o'clock" : targetMin === 30 ? 'half past' : targetMin === 15 ? 'quarter past' : 'quarter to'
  const displayTime = `${targetHour}:${String(targetMin).padStart(2, '0')}`

  const optionHours = [targetHour, targetHour % 12 + 1, (targetHour + 2) % 12 + 1, (targetHour + 5) % 12 + 1]
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)

  const handleAnswer = (h) => {
    if (h === targetHour) {
      play('correct')
      addStar('lifeskills')
      setFeedback('correct')
      setFeedbackMsg(`Yes! ${displayTime}! Great reading! ⭐`)
      setTimeout(onComplete, 2500)
    } else {
      play('wrong')
      breakStreak()
      logWrongAnswer('lifeskills', `What time does the clock show? ${displayTime}`)
      setFeedback('wrong')
      setFeedbackMsg('Look at the short hand! Try again! 💪')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full flex flex-col items-center gap-4">
        <p className="text-2xl font-bold text-gray-600">What time is it?</p>
        <ClockFace hour={targetHour} minute={targetMin} />
        <p className="text-3xl font-black text-purple-700">{targetHour} {minLabel}</p>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="grid grid-cols-2 gap-4 w-full">
        {optionHours.map(h => (
          <motion.button key={h} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(h)} aria-label={`Answer: ${h} o'clock`}
            className="bg-white text-green-700 font-black text-3xl py-5 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors">
            {h} o'clock
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function CoinGame({ level, onComplete }) {
  const available = level === 1 ? COINS.slice(0, 4) : level === 2 ? COINS.slice(0, 6) : COINS
  const [target] = useState(() => available[Math.floor(Math.random() * available.length)])
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()
  const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 4)
  const options = shuffled.some(c => c.name === target.name) ? shuffled : [...shuffled.slice(0, 3), target].sort(() => Math.random() - 0.5)

  const handleAnswer = (coin) => {
    if (coin.name === target.name) {
      play('correct')
      addStar('lifeskills')
      setFeedback('correct')
      setFeedbackMsg(`Yes! That's a ${target.name} coin! ⭐`)
      setTimeout(onComplete, 2500)
    } else {
      play('wrong')
      breakStreak()
      logWrongAnswer('lifeskills', `Which coin is ${target.name}?`)
      setFeedback('wrong')
      setFeedbackMsg('Look carefully! Try again! 💪')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
        <p className="text-2xl font-bold text-gray-600 mb-2">Tap the</p>
        <p className="text-5xl font-black text-green-700">{target.name} coin!</p>
        <div className={`${target.color} text-white text-8xl w-36 h-36 rounded-full flex items-center justify-center mx-auto mt-6 shadow-xl font-black text-4xl`} aria-hidden>
          {target.name}
        </div>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map(coin => (
          <motion.button key={coin.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(coin)} aria-label={`${coin.name} coin`}
            className={`${coin.color} text-white font-black text-2xl py-5 rounded-2xl shadow-lg hover:opacity-90 transition-opacity`}>
            {coin.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function ScenarioGame({ level, onComplete }) {
  const available = SCENARIOS.slice(0, level * 2)
  const [idx] = useState(() => Math.floor(Math.random() * available.length))
  const scenario = available[idx]
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()

  const handleAnswer = (opt) => {
    if (opt === scenario.correct) {
      play('correct')
      addStar('lifeskills')
      setFeedback('correct')
      setFeedbackMsg(`That's right! "${scenario.correct}"! ⭐`)
      setTimeout(onComplete, 2500)
    } else {
      play('wrong')
      breakStreak()
      logWrongAnswer('lifeskills', scenario.q)
      setFeedback('wrong')
      setFeedbackMsg('Think carefully! Try again! 💪')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
        <p className="text-6xl mb-4">🤔</p>
        <p className="text-2xl font-bold text-gray-700">{scenario.q}</p>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="grid grid-cols-2 gap-4 w-full">
        {scenario.options.map(opt => (
          <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)} aria-label={opt}
            className="bg-white text-green-700 font-black text-xl py-5 px-3 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors">
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function LifeSkills() {
  const [tab, setTab] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const { play } = useAudio()
  const { progress } = useProgress()
  const level = progress.unlockedLevels.lifeskills || 1
  const nextGame = () => setGameKey(k => k + 1)

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">⏰ Life Skills</h1>
      <p className="text-white/90 font-bold">Level {level} unlocked! ⭐ {progress.moduleStars.lifeskills || 0} stars</p>
      <div className="flex gap-3 flex-wrap justify-center" role="tablist">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i}
            onClick={() => { setTab(i); play('click') }}
            className={`px-6 py-3 rounded-2xl font-black text-xl transition-all ${
              tab === i ? 'bg-white text-green-700 shadow-lg' : 'bg-white/30 text-white hover:bg-white/50'
            }`}>{t}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {tab === 0 && <ClockGame key={gameKey} level={level} onComplete={nextGame} />}
          {tab === 1 && <CoinGame key={gameKey} level={level} onComplete={nextGame} />}
          {tab === 2 && <ScenarioGame key={gameKey} level={level} onComplete={nextGame} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
