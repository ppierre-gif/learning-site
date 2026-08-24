import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'
import FeedbackBanner from '../components/FeedbackBanner'
import { logWrongAnswer } from '../lib/supabase'
import spellingData from '../data/spellingWords.json'
import spellingSentences from '../data/spellingSentences.json'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.7
  speechSynthesis.speak(utterance)
}

function shuffledTokens(sentence) {
  return sentence.split(' ')
    .map((text, id) => ({ id, text }))
    .sort(() => Math.random() - 0.5)
}

export default function Spelling() {
  const [weekIndex, setWeekIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState('spell') // 'spell' | 'sentence'
  const [typed, setTyped] = useState([])
  const [sentenceAvailable, setSentenceAvailable] = useState([])
  const [sentenceBuilt, setSentenceBuilt] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [weekDone, setWeekDone] = useState(false)
  const { addStar, breakStreak, progress } = useProgress()
  const { play } = useAudio()

  const week = spellingData.weeks[weekIndex]
  const words = week.words
  const currentWord = words[wordIndex]
  const letters = currentWord.toUpperCase().split('')
  const sentence = spellingSentences[currentWord.toLowerCase()] || currentWord

  // Read the word (or sentence) aloud whenever a new step comes up, and
  // shuffle the sentence word-chips whenever the sentence step begins.
  useEffect(() => {
    if (weekDone) return
    if (phase === 'sentence') {
      setSentenceAvailable(shuffledTokens(sentence))
      setSentenceBuilt([])
      speak(sentence)
    } else {
      speak(currentWord)
    }
  }, [weekIndex, wordIndex, phase, weekDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const showFeedback = (type, msg) => {
    setFeedback(type)
    setFeedbackMsg(msg)
    setTimeout(() => setFeedback(null), 2000)
  }

  const goToNextStep = () => {
    if (wordIndex + 1 < words.length) {
      setWordIndex(i => i + 1)
      setTyped([])
      setPhase('spell')
    } else {
      setWeekDone(true)
    }
  }

  const selectWeek = (i) => {
    play('click')
    setWeekIndex(i)
    setWordIndex(0)
    setTyped([])
    setPhase('spell')
    setWeekDone(false)
  }

  const handleSpeakerTap = () => {
    play('click')
    speak(phase === 'sentence' ? sentence : currentWord)
  }

  const handleLetterTap = (letter) => {
    play('click')
    const next = [...typed, letter]
    setTyped(next)
    if (next.length === letters.length) {
      if (next.join('') === currentWord.toUpperCase()) {
        play('correct')
        addStar('spelling')
        showFeedback('correct', `Yes! "${currentWord}" — great spelling! ⭐`)
        setTimeout(() => setPhase('sentence'), 1800)
      } else {
        play('wrong')
        breakStreak()
        logWrongAnswer('spelling', `Week ${week.week}: ${currentWord}`)
        showFeedback('wrong', 'Not quite — listen again and try! 💪')
        setTimeout(() => setTyped([]), 1500)
      }
    }
  }

  const handleBackspace = () => {
    play('click')
    setTyped(t => t.slice(0, -1))
  }

  const handleChipTap = (chip) => {
    play('click')
    const nextAvailable = sentenceAvailable.filter(c => c.id !== chip.id)
    const nextBuilt = [...sentenceBuilt, chip]
    setSentenceAvailable(nextAvailable)
    setSentenceBuilt(nextBuilt)
    if (nextBuilt.length === sentence.split(' ').length) {
      if (nextBuilt.map(c => c.text).join(' ') === sentence) {
        play('correct')
        addStar('spelling')
        showFeedback('correct', 'Awesome sentence! 🌟')
        setTimeout(goToNextStep, 1800)
      } else {
        play('wrong')
        breakStreak()
        logWrongAnswer('spelling', `Week ${week.week} sentence: ${currentWord}`)
        showFeedback('wrong', 'Not quite the right order — try again! 💪')
        setTimeout(() => {
          setSentenceAvailable(shuffledTokens(sentence))
          setSentenceBuilt([])
        }, 1500)
      }
    }
  }

  const handleChipUndo = (chip) => {
    play('click')
    setSentenceBuilt(b => b.filter(c => c.id !== chip.id))
    setSentenceAvailable(a => [...a, chip])
  }

  const handleClearSentence = () => {
    play('click')
    setSentenceAvailable(shuffledTokens(sentence))
    setSentenceBuilt([])
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg">✏️ Spelling Words</h1>
      <p className="text-white/90 font-bold">⭐ {progress.moduleStars.spelling || 0} stars</p>

      {/* Week picker */}
      <div className="flex gap-2 flex-wrap justify-center" role="tablist" aria-label="Choose a spelling week">
        {spellingData.weeks.map((w, i) => (
          <button
            key={w.week}
            role="tab"
            aria-selected={weekIndex === i}
            onClick={() => selectWeek(i)}
            className={`px-5 py-2 rounded-2xl font-black text-lg transition-all ${
              weekIndex === i ? 'bg-white text-purple-700 shadow-lg' : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            Week {w.week}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {weekDone ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-md">
            <div className="text-7xl mb-3">🎉</div>
            <h2 className="text-3xl font-black text-purple-700 mb-2">Week {week.week} Complete!</h2>
            <p className="text-xl text-gray-600 font-bold mb-6">You spelled all {words.length} words and their sentences!</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setWordIndex(0); setTyped([]); setPhase('spell'); setWeekDone(false); play('click') }}
                className="bg-green-400 text-white font-black text-xl px-6 py-3 rounded-2xl shadow-lg"
                aria-label="Practice this week again">
                🔁 Practice Again
              </motion.button>
              {weekIndex + 1 < spellingData.weeks.length && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => selectWeek(weekIndex + 1)}
                  className="bg-purple-500 text-white font-black text-xl px-6 py-3 rounded-2xl shadow-lg"
                  aria-label="Go to next week">
                  Next Week ➡️
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : phase === 'spell' ? (
          <motion.div key={`${weekIndex}-${wordIndex}-spell`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-lg flex flex-col items-center gap-6">
            <p className="text-white font-bold text-lg">Word {wordIndex + 1} of {words.length} — Spell it</p>

            <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeakerTap}
                className="text-6xl mb-4"
                aria-label="Hear the word again"
              >
                🔊
              </motion.button>
              <p className="text-lg text-gray-500 font-bold mb-4">Tap the speaker, then spell the word!</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {letters.map((_, i) => (
                  <div key={i}
                    className={`w-12 h-12 rounded-xl border-4 flex items-center justify-center text-xl font-black transition-all ${
                      typed[i] ? 'border-green-400 bg-green-100 text-green-700' : 'border-gray-300 bg-gray-50'
                    }`}
                    aria-label={typed[i] ? `Letter ${typed[i]}` : 'Empty space'}
                  >
                    {typed[i] || ''}
                  </div>
                ))}
              </div>
            </div>

            {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 w-full">
              {ALPHABET.map(letter => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleLetterTap(letter)}
                  aria-label={`Letter ${letter}`}
                  className="bg-white text-purple-700 font-black text-xl rounded-2xl shadow-md aspect-square flex items-center justify-center hover:bg-yellow-300 transition-colors"
                >
                  {letter}
                </motion.button>
              ))}
            </div>

            <button onClick={handleBackspace}
              className="text-white/80 underline text-lg font-bold" aria-label="Delete last letter">
              Backspace ⌫
            </button>
          </motion.div>
        ) : (
          <motion.div key={`${weekIndex}-${wordIndex}-sentence`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-lg flex flex-col items-center gap-6">
            <p className="text-white font-bold text-lg">Word {wordIndex + 1} of {words.length} — Use it in a sentence</p>

            <div className="bg-white rounded-3xl p-8 text-center shadow-xl w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeakerTap}
                className="text-6xl mb-4"
                aria-label="Hear the sentence again"
              >
                🔊
              </motion.button>
              <p className="text-lg text-gray-500 font-bold mb-4">
                Tap the speaker, then build the sentence using <span className="text-purple-700">"{currentWord}"</span>!
              </p>
              <div className="flex gap-2 justify-center flex-wrap min-h-[3.5rem] border-4 border-dashed border-gray-200 rounded-2xl p-3">
                {sentenceBuilt.length === 0 && (
                  <span className="text-gray-300 font-bold self-center">Tap words below to build the sentence</span>
                )}
                {sentenceBuilt.map(chip => (
                  <motion.button
                    key={chip.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChipUndo(chip)}
                    aria-label={`Remove "${chip.text}" from sentence`}
                    className="bg-green-100 border-2 border-green-400 text-green-700 font-black text-lg rounded-xl px-3 py-2"
                  >
                    {chip.text}
                  </motion.button>
                ))}
              </div>
            </div>

            {feedback && <FeedbackBanner type={feedback} message={feedbackMsg} />}

            <div className="flex gap-2 justify-center flex-wrap w-full">
              {sentenceAvailable.map(chip => (
                <motion.button
                  key={chip.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleChipTap(chip)}
                  aria-label={`Word: ${chip.text}`}
                  className="bg-white text-purple-700 font-black text-lg rounded-2xl shadow-md px-4 py-3 hover:bg-yellow-300 transition-colors"
                >
                  {chip.text}
                </motion.button>
              ))}
            </div>

            <button onClick={handleClearSentence}
              className="text-white/80 underline text-lg font-bold" aria-label="Clear sentence and start over">
              Clear ↺
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
