import NavBar from './NavBar'
import CelebrationOverlay from './CelebrationOverlay'
import { useSettings } from '../hooks/useSettings.jsx'

export default function Layout({ children }) {
  const { theme, fontSize } = useSettings()

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg}`}
      style={{ fontSize: fontSize.base }}
    >
      <NavBar />
      <main className="px-4 py-6 max-w-5xl mx-auto">
        {children}
      </main>
      <CelebrationOverlay />
    </div>
  )
}
