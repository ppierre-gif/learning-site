import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettings } from '../hooks/useSettings.jsx'
import { useProgress } from '../hooks/useProgress.jsx'
import { useAudio } from '../hooks/useAudio.jsx'
import { useProfile } from '../hooks/useProfile.jsx'

const modules = [
  { to: '/letters', label: 'Reading & Letters', icon: '📚', bg: '#F87171', bgHover: '#EF4444' },
  { to: '/spelling', label: 'Spelling Words', icon: '✏️', bg: '#FBBF24', bgHover: '#F59E0B' },
  { to: '/numbers', label: 'Numbers & Maths', icon: '🔢', bg: '#60A5FA', bgHover: '#3B82F6' },
  { to: '/lifeskills', label: 'Life Skills', icon: '⏰', bg: '#4ADE80', bgHover: '#22C55E' },
  { to: '/colors', label: 'Colours & Shapes', icon: '🎨', bg: '#FB923C', bgHover: '#F97316' },
  { to: '/music', label: 'Music & Fun', icon: '🎵', bg: '#C084FC', bgHover: '#A855F7' },
]

const dailyChallenges = [
  { label: 'Spell a 3-letter word!', icon: '✏️', to: '/letters' },
  { label: "This week's spelling words!", icon: '📝', to: '/spelling' },
  { label: 'Count to 10!', icon: '🔢', to: '/numbers' },
  { label: 'What time is it?', icon: '⏰', to: '/lifeskills' },
  { label: 'Name a shape!', icon: '🔷', to: '/colors' },
  { label: 'Make some music!', icon: '🥁', to: '/music' },
]

function getDayName() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getDailyChallenge() {
  const day = new Date().getDay()
  return dailyChallenges[day % dailyChallenges.length]
}

export default function Home() {
  const { settings } = useSettings()
  const { progress } = useProgress()
  const { play } = useAudio()
  const { currentProfile } = useProfile()
  const challenge = getDailyChallenge()

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-2 float" role="img" aria-label="Waving hand">👋</div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">
          Hello, {currentProfile?.name}!
        </h1>
        <p className="text-xl text-white/90 font-bold mt-1">{getDayName()}</p>
      </motion.div>

      {/* Daily Challenge */}
      <Link to={challenge.to} className="w-full max-w-lg" aria-label={`Daily challenge: ${challenge.label}`}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => play('click')}
          className="bg-yellow-300 border-4 border-yellow-500 rounded-3xl p-6 text-center shadow-xl cursor-pointer"
        >
          <p className="text-lg font-bold text-yellow-800 uppercase tracking-wide">⚡ Daily Challenge</p>
          <p className="text-3xl font-black text-yellow-900 mt-1">
            {challenge.icon} {challenge.label}
          </p>
        </motion.div>
      </Link>

      {/* Module buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-3xl">
        {modules.map((mod, i) => (
          <Link key={mod.to} to={mod.to} aria-label={`Go to ${mod.label}`}>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => play('click')}
              className="shadow-lg text-white rounded-3xl p-6 text-center font-black cursor-pointer flex flex-col items-center gap-3 border-b-4 border-black/10"
              style={{ minHeight: '140px', backgroundColor: mod.bg }}
            >
              <span className="text-6xl" role="img" aria-hidden>{mod.icon}</span>
              <span className="text-2xl leading-tight">{mod.label}</span>
              <span className="text-sm font-bold bg-white/20 rounded-full px-3 py-1">
                ⭐ {progress.moduleStars[mod.to.replace('/', '')] || 0} stars
              </span>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Trophies link */}
      <Link to="/trophies" aria-label="View my trophies">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => play('click')}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black text-2xl rounded-2xl px-8 py-4 shadow-lg flex items-center gap-3"
        >
          🏆 My Trophies ({progress.trophies.length})
        </motion.div>
      </Link>
    </div>
  )
}
