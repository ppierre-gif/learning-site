import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'
import FeedbackBanner from '../components/FeedbackBanner'
import { logWrongAnswer } from '../lib/supabase'

// Number words 0–100, built so quizzes can go all the way to one hundred
const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
function numberToWord(n) {
  if (n < 20) return ONES[n]
  if (n === 100) return 'one hundred'
  const t = Math.floor(n / 10), o = n % 10
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`
}
const NUMBER_WORDS = Array.from({ length: 101 }, (_, i) => numberToWord(i))

const EMOJIS = ['🍎','🌟','🐶','🎈','🌸','🦋','🍦','🚀','🐱','🌈','🎉','🍕']

const TABS = ['Counting', 'Addition', 'Number Quiz']

function CountingGame({ level, onComplete }) {
  const count = level === 1 ? 5 : level === 2 ? 10 : 20
  const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  const [tapped, setTapped] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()
  const [target] = useState(() => Math.floor(Math.random() * count) + 1)
  const [items] = useState(() => Array.from({ length: count }, (_, i) => i))

  const handleTap = (id) => {
    if (tapped.includes(id)) return
    play('click')
    const next = [...tapped, id]
    setTapped(next)
    if (next.length === target) {
      play('correct')
      addStar('numbers')
      setFeedback('correct')
      setFeedbackMsg(`You counted ${target}! Amazing! ⭐`)
      setTimeout(onComplete, 2500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-6 text-center shadow-xl w-full">
        <p className="text-2xl font-bold text-gray-600 mb-2">Tap exactly</p>
        <p className="text-6xl font-black text-purple-700">{target}</p>
        <p className="text-2xl font-bold text-gray-600">things!</p>
        <p className="text-2xl text-gray-500 mt-1">({NUMBER_WORDS[target]})</p>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="flex flex-wrap gap-3 justify-center">
        {items.map(id => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => handleTap(id)}
            aria-label={`Tap item ${id + 1}`}
            className={`text-4xl rounded-2xl w-16 h-16 flex items-center justify-center shadow-md transition-all ${
              tapped.includes(id) ? 'bg-green-400 scale-90 opacity-60' : 'bg-white hover:bg-yellow-100'
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <p className="text-white font-bold text-xl">Tapped: {tapped.length} / {target}</p>
    </div>
  )
}

function AdditionGame({ level, onComplete }) {
  const max = level === 1 ? 5 : level === 2 ? 10 : 20
  const [a] = useState(() => Math.floor(Math.random() * max / 2) + 1)
  const [b] = useState(() => Math.floor(Math.random() * max / 2) + 1)
  const answer = a + b
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()

  const options = [answer, answer + 1, answer - 1, answer + 2].filter(n => n >= 0).sort(() => Math.random() - 0.5).slice(0, 4)

  const handleAnswer = (opt) => {
    setSelected(opt)
    if (opt === answer) {
      play('correct')
      addStar('numbers')
      setFeedback('correct')
      setFeedbackMsg(`${a} + ${b} = ${answer}! Brilliant! ⭐`)
      setTimeout(onComplete, 2500)
    } else {
      play('wrong')
      breakStreak()
      logWrongAnswer('numbers', `${a} + ${b} = ?`)
      setFeedback('wrong')
      setFeedbackMsg('Try again! Count the blocks! 💪')
      setTimeout(() => { setSelected(null); setFeedback(null) }, 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
            {Array.from({ length: a }).map((_, i) => <span key={i} className="text-3xl">🟦</span>)}
          </div>
          <span className="text-5xl font-black text-purple-700">+</span>
          <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
            {Array.from({ length: b }).map((_, i) => <span key={i} className="text-3xl">🟥</span>)}
          </div>
          <span className="text-5xl font-black text-purple-700">=</span>
          <span className="text-5xl font-black text-gray-400">?</span>
        </div>
        <p className="text-4xl font-black text-purple-700 mt-4">{a} + {b} = ?</p>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map(opt => (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)}
            aria-label={`Answer: ${opt}`}
            className={`bg-white text-purple-700 font-black text-4xl py-5 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors ${
              selected === opt ? 'ring-4 ring-red-400' : ''
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function NumberQuiz({ level, onComplete }) {
  const max = level === 1 ? 20 : level === 2 ? 50 : 100
  const [num] = useState(() => Math.floor(Math.random() * max) + 1)
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()

  const correct = NUMBER_WORDS[num]
  const options = [correct,
    NUMBER_WORDS[Math.min(num + 1, 100)],
    NUMBER_WORDS[Math.max(num - 1, 0)],
    NUMBER_WORDS[Math.min(num + 3, 100)],
  ].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5).slice(0, 4)

  const handleAnswer = (opt) => {
    if (opt === correct) {
      play('correct')
      addStar('numbers')
      setFeedback('correct')
      setFeedbackMsg(`Yes! ${num} is "${correct}"! ⭐`)
      setTimeout(onComplete, 2500)
    } else {
      play('wrong')
      breakStreak()
      logWrongAnswer('numbers', `What word is ${num}?`)
      setFeedback('wrong')
      setFeedbackMsg('Try again! You can do it! 💪')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
        <p className="text-2xl font-bold text-gray-600 mb-2">What word is this number?</p>
        <p className="text-8xl font-black text-purple-700">{num}</p>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map(opt => (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)}
            aria-label={`Answer: ${opt}`}
            className="bg-white text-purple-700 font-black text-2xl py-5 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors capitalize"
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function Numbers() {
  const [tab, setTab] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const { play } = useAudio()
  const { progress } = useProgress()
  const level = progress.unlockedLevels.numbers || 1
  const nextGame = () => setGameKey(k => k + 1)

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">🔢 Numbers & Maths</h1>
      <p className="text-white/90 font-bold">Level {level} unlocked! ⭐ {progress.moduleStars.numbers || 0} stars</p>

      <div className="flex gap-3 flex-wrap justify-center" role="tablist">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i}
            onClick={() => { setTab(i); play('click') }}
            className={`px-6 py-3 rounded-2xl font-black text-xl transition-all ${
              tab === i ? 'bg-white text-blue-700 shadow-lg' : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >{t}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {tab === 0 && <CountingGame key={gameKey} level={level} onComplete={nextGame} />}
          {tab === 1 && <AdditionGame key={gameKey} level={level} onComplete={nextGame} />}
          {tab === 2 && <NumberQuiz key={gameKey} level={level} onComplete={nextGame} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
