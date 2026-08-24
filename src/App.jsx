import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProfileProvider, useProfile } from './hooks/useProfile.jsx'
import { SettingsProvider } from './hooks/useSettings.jsx'
import { ProgressProvider } from './hooks/useProgress.jsx'
import Layout from './components/Layout'
import SessionTimer from './components/SessionTimer'
import ProfileSelect from './pages/ProfileSelect'
import Home from './pages/Home'
import Letters from './pages/Letters'
import Spelling from './pages/Spelling'
import Numbers from './pages/Numbers'
import LifeSkills from './pages/LifeSkills'
import ColorsShapes from './pages/ColorsShapes'
import Music from './pages/Music'
import Trophies from './pages/Trophies'
import ParentDashboard from './pages/ParentDashboard'
import Settings from './pages/Settings'

function MainApp({ profileId }) {
  return (
    <SettingsProvider profileId={profileId}>
      <ProgressProvider profileId={profileId}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/letters" element={<Letters />} />
              <Route path="/spelling" element={<Spelling />} />
              <Route path="/numbers" element={<Numbers />} />
              <Route path="/lifeskills" element={<LifeSkills />} />
              <Route path="/colors" element={<ColorsShapes />} />
              <Route path="/music" element={<Music />} />
              <Route path="/trophies" element={<Trophies />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <SessionTimer />
        </BrowserRouter>
      </ProgressProvider>
    </SettingsProvider>
  )
}

function AppShell() {
  const { currentProfile } = useProfile()
  if (!currentProfile) return <ProfileSelect />
  return <MainApp key={currentProfile.id} profileId={currentProfile.id} />
}

export default function App() {
  return (
    <ProfileProvider>
      <AppShell />
    </ProfileProvider>
  )
}
