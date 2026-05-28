import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '../hooks/useAudio.jsx'
import { useProgress } from '../hooks/useProgress.jsx'

const DRUMS = [
  { label: 'Kick', emoji: '🥁', freq: 60, key: 'q' },
  { label: 'Snare', emoji: '🪘', freq: 200, key: 'w' },
  { label: 'Hi-Hat', emoji: '🎶', freq: 800, key: 'e' },
  { label: 'Tom', emoji: '🎵', freq: 120, key: 'a' },
  { label: 'Clap', emoji: '👏', freq: 500, key: 's' },
  { label: 'Cowbell', emoji: '🔔', freq: 1000, key: 'd' },
]

const DRUM_COLORS = [
  'bg-red-500 hover:bg-red-400',
  'bg-blue-500 hover:bg-blue-400',
  'bg-green-500 hover:bg-green-400',
  'bg-yellow-500 hover:bg-yellow-400',
  'bg-purple-500 hover:bg-purple-400',
  'bg-orange-500 hover:bg-orange-400',
]

const RHYTHM_PATTERNS = [
  [0, 2, 4],
  [0, 1, 3, 5],
  [0, 2, 3, 4],
  [1, 2, 4, 5],
]

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#FBBF24', '#A855F7', '#F97316', '#06B6D4', '#EC4899']
const BRUSH_SIZES = [6, 12, 20, 32]

function DrumPad() {
  const { play } = useAudio()
  const [active, setActive] = useState(null)

  const hitDrum = useCallback((drum) => {
    play('drum', drum.freq)
    setActive(drum.label)
    setTimeout(() => setActive(null), 150)
  }, [play])

  useEffect(() => {
    const handler = (e) => {
      const drum = DRUMS.find(d => d.key === e.key.toLowerCase())
      if (drum) hitDrum(drum)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hitDrum])

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <p className="text-white font-bold text-xl text-center">Tap the pads or press the keys!</p>
      <div className="grid grid-cols-3 gap-4 w-full">
        {DRUMS.map((drum, i) => (
          <motion.button
            key={drum.label}
            whileTap={{ scale: 0.85 }}
            animate={active === drum.label ? { scale: 0.9 } : { scale: 1 }}
            onClick={() => hitDrum(drum)}
            aria-label={`${drum.label} drum pad, keyboard key ${drum.key.toUpperCase()}`}
            className={`${DRUM_COLORS[i]} text-white font-black rounded-3xl shadow-xl flex flex-col items-center justify-center gap-2 transition-colors`}
            style={{ height: '110px' }}
          >
            <span className="text-4xl" role="img" aria-hidden>{drum.emoji}</span>
            <span className="text-lg">{drum.label}</span>
            <span className="text-sm opacity-70 uppercase">[{drum.key}]</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function DrawingCanvas() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(COLORS[0])
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1])
  const lastPos = useRef(null)

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : e
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (lastPos.current) {
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
    lastPos.current = pos
  }

  const startDraw = (e) => {
    setIsDrawing(true)
    lastPos.current = getPos(e)
  }

  const stopDraw = () => {
    setIsDrawing(false)
    lastPos.current = null
  }

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      <div className="flex flex-wrap gap-2 justify-center">
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)}
            aria-label={`Select colour ${c}`}
            className={`w-10 h-10 rounded-full shadow-md transition-transform ${color === c ? 'scale-125 ring-4 ring-white' : 'hover:scale-110'}`}
            style={{ backgroundColor: c }} />
        ))}
        <button onClick={() => setColor('#FFFFFF')}
          aria-label="White colour (eraser)"
          className={`w-10 h-10 rounded-full shadow-md border-2 border-gray-300 transition-transform ${color === '#FFFFFF' ? 'scale-125 ring-4 ring-gray-400' : 'hover:scale-110'}`}
          style={{ backgroundColor: '#FFFFFF' }} />
      </div>
      <div className="flex gap-3 items-center">
        <span className="text-white font-bold">Size:</span>
        {BRUSH_SIZES.map(s => (
          <button key={s} onClick={() => setBrushSize(s)}
            aria-label={`Brush size ${s}`}
            className={`rounded-full bg-white flex items-center justify-center transition-transform ${brushSize === s ? 'scale-125 ring-4 ring-yellow-400' : 'hover:scale-110'}`}
            style={{ width: s + 8, height: s + 8 }}>
            <div className="rounded-full bg-gray-700" style={{ width: s / 2, height: s / 2 }} />
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={400} height={300}
        className="bg-white rounded-3xl shadow-xl touch-none cursor-crosshair w-full"
        style={{ maxWidth: '400px' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        aria-label="Drawing canvas" role="img" />
      <button onClick={clearCanvas}
        className="bg-red-400 hover:bg-red-500 text-white font-black text-xl px-8 py-3 rounded-2xl shadow-lg transition-colors"
        aria-label="Clear the drawing">
        🗑️ Clear
      </button>
    </div>
  )
}

function RhythmGame() {
  const { play } = useAudio()
  const { addStar } = useProgress()
  const [pattern] = useState(() => RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)])
  const [phase, setPhase] = useState('watch')
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [userInput, setUserInput] = useState([])
  const [result, setResult] = useState(null)

  const playPattern = useCallback(() => {
    setPhase('watch')
    setCurrentBeat(-1)
    setUserInput([])
    setResult(null)
    pattern.forEach((beat, i) => {
      setTimeout(() => {
        setCurrentBeat(beat)
        play('drum', 200)
        setTimeout(() => setCurrentBeat(-1), 200)
      }, i * 600 + 500)
    })
    setTimeout(() => {
      setPhase('repeat')
      setCurrentBeat(-1)
    }, pattern.length * 600 + 800)
  }, [pattern, play])

  useEffect(() => { playPattern() }, [])

  const handleTap = (beat) => {
    if (phase !== 'repeat') return
    play('drum', 200)
    const next = [...userInput, beat]
    setUserInput(next)
    if (next.length === pattern.length) {
      const correct = next.every((v, i) => v === pattern[i])
      if (correct) {
        play('correct')
        addStar('music')
        setResult('correct')
      } else {
        play('wrong')
        setResult('wrong')
      }
      setPhase('done')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="bg-white rounded-3xl p-6 text-center shadow-xl w-full">
        {phase === 'watch' && <p className="text-2xl font-bold text-purple-700">Watch the pattern! 👀</p>}
        {phase === 'repeat' && <p className="text-2xl font-bold text-green-700">Now tap it back! 👇</p>}
        {phase === 'done' && result === 'correct' && <p className="text-2xl font-black text-green-700">🌟 Perfect rhythm!</p>}
        {phase === 'done' && result === 'wrong' && <p className="text-2xl font-bold text-orange-600">💪 Try again!</p>}
        <div className="flex gap-3 justify-center mt-4 flex-wrap">
          {DRUMS.slice(0, 6).map((_, i) => (
            <div key={i}
              className={`w-12 h-12 rounded-xl transition-all duration-100 ${
                currentBeat === i ? 'bg-yellow-400 scale-125 shadow-lg' :
                userInput.includes(i) ? 'bg-green-300' : 'bg-gray-200'
              }`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {DRUMS.slice(0, 6).map((drum, i) => (
          <motion.button key={drum.label} whileTap={{ scale: 0.85 }}
            onClick={() => handleTap(i)}
            disabled={phase !== 'repeat'}
            aria-label={`Tap ${drum.label}`}
            className={`${DRUM_COLORS[i]} text-white font-black rounded-2xl flex items-center justify-center gap-2 text-xl disabled:opacity-40 transition-opacity`}
            style={{ height: '80px' }}>
            {drum.emoji} {drum.label}
          </motion.button>
        ))}
      </div>
      <button onClick={playPattern}
        className="bg-white text-purple-700 font-black text-xl px-8 py-4 rounded-2xl shadow-lg hover:bg-yellow-100"
        aria-label="Watch pattern again">
        👁️ Watch Again
      </button>
    </div>
  )
}

const MUSIC_TABS = ['Drum Pad', 'Drawing', 'Rhythm Game']

export default function Music() {
  const [tab, setTab] = useState(0)
  const { play } = useAudio()

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">🎵 Music & Creativity</h1>
      <p className="text-white/90 font-bold text-xl">Freeplay — just have fun! 🎉</p>
      <div className="flex gap-3 flex-wrap justify-center" role="tablist">
        {MUSIC_TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i}
            onClick={() => { setTab(i); play('click') }}
            className={`px-6 py-3 rounded-2xl font-black text-xl transition-all ${
              tab === i ? 'bg-white text-purple-700 shadow-lg' : 'bg-white/30 text-white hover:bg-white/50'
            }`}>{t}</button>
        ))}
      </div>
      <div className="w-full max-w-lg">
        {tab === 0 && <DrumPad />}
        {tab === 1 && <DrawingCanvas />}
        {tab === 2 && <RhythmGame />}
      </div>
    </div>
  )
}
