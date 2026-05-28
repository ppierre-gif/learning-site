import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettings } from '../hooks/useSettings.jsx'
import { useProfile } from '../hooks/useProfile.jsx'
import StarCounter from './StarCounter'

const navItems = [
  { to: '/',          label: 'Home',       icon: '🏠' },
  { to: '/letters',   label: 'Letters',    icon: '📚' },
  { to: '/numbers',   label: 'Numbers',    icon: '🔢' },
  { to: '/lifeskills',label: 'Life Skills',icon: '⏰' },
  { to: '/colors',    label: 'Colours',    icon: '🎨' },
  { to: '/music',     label: 'Music',      icon: '🎵' },
  { to: '/trophies',  label: 'Trophies',   icon: '🏆' },
]

export default function NavBar() {
  const location = useLocation()
  const { theme } = useSettings()
  const { currentProfile } = useProfile()

  return (
    <nav className={`${theme.nav} text-white shadow-lg`} aria-label="Main navigation">
      <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {navItems.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to} aria-label={item.label} aria-current={active ? 'page' : undefined}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl text-center min-w-[56px] transition-colors ${
                    active ? 'bg-white/30 font-black' : 'hover:bg-white/20'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-hidden>{item.icon}</span>
                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {currentProfile && (
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2" aria-label={`Playing as ${currentProfile.name}`}>
              <span className="text-2xl" role="img" aria-hidden>{currentProfile.avatar}</span>
              <span className="font-black text-sm leading-tight max-w-[80px] truncate">{currentProfile.name}</span>
            </div>
          )}
          <StarCounter />
          <Link to="/parent" aria-label="Parent Dashboard">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 text-2xl">
              👪
            </motion.div>
          </Link>
          <Link to="/settings" aria-label="Settings">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 text-2xl">
              ⚙️
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
