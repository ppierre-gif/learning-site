import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'
import FeedbackBanner from '../components/FeedbackBanner'
import { logWrongAnswer } from '../lib/supabase'

const TABS = ['Sorting', 'Memory Match', 'Shape Quiz']

const COLORS = [
  { name: 'Red', bg: 'bg-red-500', text: 'text-red-500', hex: '#EF4444' },
  { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3B82F6' },
  { name: 'Yellow', bg: 'bg-yellow-400', text: 'text-yellow-500', hex: '#FBBF24' },
  { name: 'Green', bg: 'bg-green-500', text: 'text-green-500', hex: '#22C55E' },
  { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500', hex: '#A855F7' },
  { name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500', hex: '#F97316' },
]

const SHAPES = [
  { name: 'Circle', svg: <circle cx="50" cy="50" r="40" />, emoji: '⭕', desc: 'a round shape' },
  { name: 'Square', svg: <rect x="10" y="10" width="80" height="80" />, emoji: '🟥', desc: 'four equal sides' },
  { name: 'Triangle', svg: <polygon points="50,10 90,90 10,90" />, emoji: '🔺', desc: 'three sides' },
  { name: 'Rectangle', svg: <rect x="5" y="20" width="90" height="60" />, emoji: '🟦', desc: 'two long, two short sides' },
  { name: 'Star', svg: <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />, emoji: '⭐', desc: 'five points' },
  { name: 'Heart', svg: <path d="M50 80 C20 55 10 35 20 25 C30 15 50 25 50 25 C50 25 70 15 80 25 C90 35 80 55 50 80Z" />, emoji: '❤️', desc: 'the shape of love' },
]

function SortingGame({ level, onComplete }) {
  const items = level === 1 ? COLORS.slice(0, 3) : level === 2 ? COLORS.slice(0, 4) : COLORS
  const targets = level === 1 ? SHAPES.slice(0, 3) : level === 2 ? SHAPES.slice(0, 4) : SHAPES.slice(0, 4)
  const [sorted, setSorted] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar } = useProgress()
  const { play } = useAudio()
  const [dragging, setDragging] = useState(null)

  const handleDrop = (targetName) => {
    if (!dragging) return
    if (dragging.name === targetName) {
      play('correct')
      addStar('colors')
      setFeedback('correct')
      setFeedbackMsg(`${dragging.name}! Great sorting! ⭐`)
      setSorted(prev => ({ ...prev, [dragging.name]: true }))
    } else {
      play('wrong')
      setFeedback('wrong')
      setFeedbackMsg('Try again! 💪')
    }
    setDragging(null)
    setTimeout(() => setFeedback(null), 1500)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <p className="text-white font-bold text-xl text-center">Drag each colour to its matching name!</p>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="flex flex-wrap gap-3 justify-center">
        {items.filter(c => !sorted[c.name]).map(color => (
          <motion.div key={color.name} draggable
            onDragStart={() => setDragging(color)}
            onDragEnd={() => setDragging(null)}
            whileHover={{ scale: 1.1 }}
            className={`${color.bg} w-16 h-16 rounded-2xl shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-black text-sm`}
            aria-label={`${color.name} colour block, drag to match`}
          >
            {color.name}
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {items.map(color => (
          <div key={color.name}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(color.name)}
            className={`rounded-2xl border-4 border-dashed p-4 text-center font-black text-xl transition-all ${
              sorted[color.name]
                ? `${color.bg} text-white border-transparent`
                : `border-white/50 text-white bg-white/20`
            }`}
            aria-label={`Drop zone for ${color.name}`}
          >
            {sorted[color.name] ? '✓' : color.name}
          </div>
        ))}
      </div>
      {Object.keys(sorted).length === items.length && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl font-black text-white">🎉 All sorted! Amazing! 🎉</p>
          <button onClick={onComplete}
            className="bg-white text-purple-700 font-black text-xl px-8 py-4 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors"
            aria-label="Play again">
            Play Again! 🔄
          </button>
        </motion.div>
      )}
    </div>
  )
}

function MemoryMatch({ level, onComplete }) {
  const count = level === 1 ? 4 : level === 2 ? 6 : 8
  const pairs = COLORS.slice(0, count / 2)
  const [cards] = useState(() =>
    [...pairs, ...pairs].map((c, i) => ({ ...c, id: i })).sort(() => Math.random() - 0.5)
  )
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [locked, setLocked] = useState(false)
  const { addStar } = useProgress()
  const { play } = useAudio()

  const handleFlip = (id) => {
    if (locked || flipped.includes(id) || matched.includes(cards[id].name)) return
    play('click')
    const next = [...flipped, id]
    setFlipped(next)
    if (next.length === 2) {
      setLocked(true)
      const [a, b] = next.map(i => cards[i])
      if (a.name === b.name) {
        play('correct')
        addStar('colors')
        setMatched(prev => [...prev, a.name])
        setFlipped([])
        setLocked(false)
      } else {
        play('wrong')
        setTimeout(() => { setFlipped([]); setLocked(false) }, 1200)
      }
    }
  }

  const done = matched.length === pairs.length

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <p className="text-white font-bold text-xl">Flip the cards and find matching pairs! 🎴</p>
      <div className={`grid gap-3 w-full ${count <= 4 ? 'grid-cols-4' : 'grid-cols-4'}`}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(card.name)
          return (
            <motion.button key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleFlip(idx)}
              aria-label={isFlipped ? `${card.name} card` : 'Hidden card'}
              className={`aspect-square rounded-2xl shadow-lg font-black text-lg transition-all duration-300 ${
                isFlipped ? `${card.bg} text-white` : 'bg-white text-gray-400'
              }`}
            >
              {isFlipped ? card.name : '?'}
            </motion.button>
          )
        })}
      </div>
      {done && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl font-black text-white">🎉 All matched! Brilliant! 🎉</p>
          <button onClick={onComplete}
            className="bg-white text-purple-700 font-black text-xl px-8 py-4 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors"
            aria-label="Play again">
            Play Again! 🔄
          </button>
        </motion.div>
      )}
    </div>
  )
}

function ShapeQuiz({ level, onComplete }) {
  const available = level === 1 ? SHAPES.slice(0, 3) : level === 2 ? SHAPES.slice(0, 4) : SHAPES
  const [idx] = useState(() => Math.floor(Math.random() * available.length))
  const shape = available[idx]
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak } = useProgress()
  const { play } = useAudio()

  const options = [shape, ...available.filter(s => s.name !== shape.name)].slice(0, 4).sort(() => Math.random() - 0.5)

  const handleAnswer = (s) => {
    if (s.name === shape.name) {
      play('correct')
      addStar('colors')
      setFeedback('correct')
      setFeedbackMsg(`Yes! That's a ${shape.name}! ${shape.emoji} ⭐`)
      setTimeout(onComplete, 2500)
    } else {
      play('wrong')
      breakStreak()
      logWrongAnswer('colors', `What shape is this? ${shape.name}`)
      setFeedback('wrong')
      setFeedbackMsg('Look at the shape! Try again! 💪')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
        <p className="text-2xl font-bold text-gray-600 mb-4">What shape is this?</p>
        <svg viewBox="0 0 100 100" width="160" height="160" className="mx-auto" aria-label={shape.desc}>
          <g fill="#7C3AED">{shape.svg}</g>
        </svg>
        <p className="text-xl text-gray-500 mt-2">{shape.desc}</p>
      </div>
      {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map(s => (
          <motion.button key={s.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(s)} aria-label={s.name}
            className="bg-white text-purple-700 font-black text-2xl py-5 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
            <span>{s.emoji}</span> {s.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function ColorsShapes() {
  const [tab, setTab] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const { play } = useAudio()
  const { progress } = useProgress()
  const level = progress.unlockedLevels.colors || 1
  const nextGame = () => setGameKey(k => k + 1)

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">🎨 Colours & Shapes</h1>
      <p className="text-white/90 font-bold">Level {level} unlocked! ⭐ {progress.moduleStars.colors || 0} stars</p>
      <div className="flex gap-3 flex-wrap justify-center" role="tablist">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i}
            onClick={() => { setTab(i); play('click') }}
            className={`px-6 py-3 rounded-2xl font-black text-xl transition-all ${
              tab === i ? 'bg-white text-orange-600 shadow-lg' : 'bg-white/30 text-white hover:bg-white/50'
            }`}>{t}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {tab === 0 && <SortingGame key={gameKey} level={level} onComplete={nextGame} />}
          {tab === 1 && <MemoryMatch key={gameKey} level={level} onComplete={nextGame} />}
          {tab === 2 && <ShapeQuiz key={gameKey} level={level} onComplete={nextGame} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
