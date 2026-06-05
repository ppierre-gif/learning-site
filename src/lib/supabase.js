import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function getProfileId() {
  return localStorage.getItem('learning-site-current-profile') || null
}

// --- Profiles ---

export async function loadProfiles() {
  if (!supabase) return []
  const { data } = await supabase.from('profiles').select('*').order('created_at')
  return data || []
}

export async function createProfileRemote(name, avatar) {
  if (!supabase) return null
  const { data } = await supabase.from('profiles').insert({ name, avatar }).select().single()
  return data
}

export async function deleteProfileRemote(id) {
  if (!supabase) return
  await supabase.from('profiles').delete().eq('id', id)
}

// --- Sessions ---

export async function logSession(moduleName, starsEarned, durationSeconds) {
  const profileId = getProfileId()
  if (!supabase || !profileId) return
  await supabase.from('sessions').insert({
    module_name: moduleName,
    stars_earned: starsEarned,
    duration_seconds: durationSeconds,
    date: new Date().toISOString().split('T')[0],
    profile_id: profileId,
  })
}

// --- Wrong answers ---

export async function logWrongAnswer(moduleName, questionText) {
  const profileId = getProfileId()
  if (!supabase || !profileId) return
  await supabase.from('wrong_answers').insert({
    module_name: moduleName,
    question_text: questionText,
    attempted_at: new Date().toISOString(),
    profile_id: profileId,
  })
}

// --- Trophies ---

export async function earnTrophy(trophyName, trophyIcon) {
  const profileId = getProfileId()
  if (!supabase || !profileId) return
  await supabase.from('trophies').insert({
    trophy_name: trophyName,
    trophy_icon: trophyIcon,
    earned_at: new Date().toISOString(),
    profile_id: profileId,
  })
}

// --- Progress ---

export async function loadProgress(profileId) {
  if (!supabase || !profileId) return null
  const { data } = await supabase
    .from('progress')
    .select('*')
    .eq('profile_id', profileId)
    .limit(1)
    .single()
  return data
}

export async function saveProgress(profileId, progress) {
  if (!supabase || !profileId) return
  await supabase.from('progress').upsert(
    {
      profile_id: profileId,
      stars: progress.stars,
      streak: progress.streak,
      best_streak: progress.bestStreak,
      trophies: progress.trophies,
      module_stars: progress.moduleStars,
      daily_stars: progress.dailyStars,
      unlocked_levels: progress.unlockedLevels,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' }
  )
}

// --- Settings ---

export async function getSettings() {
  const profileId = getProfileId()
  if (!supabase || !profileId) return null
  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('profile_id', profileId)
    .limit(1)
    .single()
  return data
}

export async function saveSettings(settings) {
  const profileId = getProfileId()
  if (!supabase || !profileId) return
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .eq('profile_id', profileId)
    .limit(1)
    .single()
  if (existing) {
    await supabase.from('settings').update(settings).eq('id', existing.id)
  } else {
    await supabase.from('settings').insert({ ...settings, profile_id: profileId })
  }
}
