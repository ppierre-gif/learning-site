import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'
import { useSettings } from '../hooks/useSettings.jsx'
import FeedbackBanner from '../components/FeedbackBanner'
import { logWrongAnswer } from '../lib/supabase'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const SIGHT_WORDS = ['the', 'and', 'is', 'it', 'in', 'he', 'she', 'we', 'go', 'can', 'big', 'red', 'run', 'sit', 'put']

const SPELLING_WORDS = [
  { word: 'CAT', emoji: '🐱', hint: 'a pet that meows' },
  { word: 'DOG', emoji: '🐶', hint: 'a pet that barks' },
  { word: 'SUN', emoji: '☀️', hint: 'it shines in the sky' },
  { word: 'BUS', emoji: '🚌', hint: 'you ride this to school' },
  { word: 'HAT', emoji: '🎩', hint: 'you wear this on your head' },
  { word: 'PIG', emoji: '🐷', hint: 'this animal says oink' },
  { word: 'HEN', emoji: '🐔', hint: 'this bird lays eggs' },
  { word: 'BAT', emoji: '🏏', hint: 'used in cricket' },
  { word: 'CUP', emoji: '☕', hint: 'you drink from this' },
  { word: 'MAP', emoji: '🗺️', hint: 'shows you where to go' },
]

const TABS = ['Alphabet', 'Spell Words', 'Sight Words']

export default function Letters() {
  const [tab, setTab] = useState(0)
  const [spellIndex, setSpellIndex] = useState(0)
  const [selectedLetters, setSelectedLetters] = useState([])
  const [sightIndex, setSightIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const { addStar, breakStreak, progress } = useProgress()
  const { play } = useAudio()
  const { theme } = useSettings()

  const level = progress.unlockedLevels.letters || 1
  const availableWords = SPELLING_WORDS.slice(0, level * 3 + 1)

  const showFeedback = (type, msg) => {
    setFeedback(type)
    setFeedbackMsg(msg)
    setTimeout(() => setFeedback(null), 2000)
  }

  const playLetter = (letter) => {
    play('click')
    const utterance = new SpeechSynthesisUtterance(letter)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const playSightWord = (word) => {
    play('click')
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.rate = 0.7
    speechSynthesis.speak(utterance)
  }

  const currentWord = availableWords[spellIndex % availableWords.length]
  const letters = currentWord.word.split('')

  const handleLetterTap = (letter) => {
    play('click')
    const next = [...selectedLetters, letter]
    setSelectedLetters(next)
    if (next.length === letters.length) {
      if (next.join('') === currentWord.word) {
        play('correct')
        addStar('letters')
        showFeedback('correct', `Yes! "${currentWord.word}" — well done! ⭐`)
        setTimeout(() => {
          setSpellIndex(i => i + 1)
          setSelectedLetters([])
        }, 2000)
      } else {
        play('wrong')
        breakStreak()
        logWrongAnswer('letters', `Spell: ${currentWord.word}`)
        showFeedback('wrong', 'Try again! You can do it! 💪')
        setTimeout(() => setSelectedLetters([]), 1500)
      }
    }
  }

  const shuffledLetters = useMemo(() =>
    [...letters, ...letters.slice(0, 3).map(l => String.fromCharCode(l.charCodeAt(0) + 1))]
      .sort(() => Math.random() - 0.5)
      .slice(0, 9),
    [spellIndex] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">📚 Reading & Letters</h1>
      <p className="text-white/90 font-bold">Level {level} unlocked! ⭐ {progress.moduleStars.letters || 0} stars</p>

      {/* Tabs */}
      <div className="flex gap-3 flex-wrap justify-center" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === i}
            onClick={() => { setTab(i); play('click') }}
            className={`px-6 py-3 rounded-2xl font-black text-xl transition-all ${
              tab === i ? 'bg-white text-purple-700 shadow-lg' : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 0 && (
          <motion.div key="alpha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-2xl">
            <p className="text-center text-white font-bold mb-4 text-xl">Tap a letter to hear it!</p>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {ALPHABET.map(letter => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => playLetter(letter)}
                  aria-label={`Letter ${letter}`}
                  className="bg-white text-purple-700 font-black text-2xl rounded-2xl shadow-md aspect-square flex items-center justify-center hover:bg-yellow-300 transition-colors"
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 1 && (
          <motion.div key="spell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-lg flex flex-col items-center gap-6">
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
              <div className="text-8xl mb-3" role="img" aria-label={currentWord.hint}>{currentWord.emoji}</div>
              <p className="text-2xl font-bold text-gray-600 mb-2">{currentWord.hint}</p>
              <div className="flex gap-3 justify-center mt-4">
                {letters.map((_, i) => (
                  <div key={i}
                    className={`w-14 h-14 rounded-xl border-4 flex items-center justify-center text-2xl font-black transition-all ${
                      selectedLetters[i] ? 'border-green-400 bg-green-100 text-green-700' : 'border-gray-300 bg-gray-50'
                    }`}
                    aria-label={selectedLetters[i] ? `Letter ${selectedLetters[i]}` : 'Empty space'}
                  >
                    {selectedLetters[i] || ''}
                  </div>
                ))}
              </div>
            </div>

            {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}

            <div className="grid grid-cols-3 gap-3 w-full">
              {shuffledLetters.map((letter, i) => (
                <motion.button
                  key={`${letter}-${i}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLetterTap(letter)}
                  aria-label={`Letter ${letter}`}
                  className="bg-white text-purple-700 font-black text-3xl rounded-2xl py-4 shadow-lg hover:bg-yellow-300 transition-colors"
                >
                  {letter}
                </motion.button>
              ))}
            </div>

            <button onClick={() => { setSelectedLetters([]); play('click') }}
              className="text-white/80 underline text-lg font-bold" aria-label="Clear letters">
              Clear ↺
            </button>
          </motion.div>
        )}

        {tab === 2 && (
          <motion.div key="sight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-lg flex flex-col items-center gap-6">
            <div className="bg-white rounded-3xl p-10 text-center shadow-xl w-full">
              <p className="text-xl text-gray-500 font-bold mb-4">Tap the word to hear it!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playSightWord(SIGHT_WORDS[sightIndex])}
                className="text-6xl font-black text-purple-700 w-full py-6 hover:text-purple-500 transition-colors"
                aria-label={`Sight word: ${SIGHT_WORDS[sightIndex]}. Tap to hear.`}
              >
                {SIGHT_WORDS[sightIndex]}
              </motion.button>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSightIndex(i => (i - 1 + SIGHT_WORDS.length) % SIGHT_WORDS.length); play('click') }}
                className="bg-white text-purple-700 font-black text-2xl px-8 py-4 rounded-2xl shadow-lg"
                aria-label="Previous word"
              >← Back</motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSightIndex(i => (i + 1) % SIGHT_WORDS.length); play('click'); addStar('letters') }}
                className="bg-green-400 text-white font-black text-2xl px-8 py-4 rounded-2xl shadow-lg"
                aria-label="Next word, earn a star"
              >Next ⭐</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
