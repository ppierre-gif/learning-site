import { useCallback, useRef, useEffect } from 'react'
import { useSettings } from './useSettings'

// Web Audio API sound generator — no external files needed
function createAudioContext() {
  if (typeof window === 'undefined') return null
  return new (window.AudioContext || window.webkitAudioContext)()
}

function playTone(ctx, frequency, duration, type = 'sine', volume = 0.5, startTime = 0) {
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime)
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration)
  oscillator.start(ctx.currentTime + startTime)
  oscillator.stop(ctx.currentTime + startTime + duration + 0.05)
}

const sounds = {
  correct: (ctx, vol) => {
    playTone(ctx, 523, 0.15, 'sine', vol, 0)
    playTone(ctx, 659, 0.15, 'sine', vol, 0.15)
    playTone(ctx, 784, 0.25, 'sine', vol, 0.3)
    playTone(ctx, 1047, 0.4, 'sine', vol, 0.5)
  },
  wrong: (ctx, vol) => {
    playTone(ctx, 300, 0.2, 'sine', vol * 0.6, 0)
    playTone(ctx, 250, 0.3, 'sine', vol * 0.5, 0.2)
  },
  trophy: (ctx, vol) => {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
      playTone(ctx, f, 0.2, 'sine', vol, i * 0.12)
    })
  },
  click: (ctx, vol) => {
    playTone(ctx, 800, 0.06, 'sine', vol * 0.4, 0)
  },
  complete: (ctx, vol) => {
    const melody = [523, 659, 784, 659, 784, 1047]
    melody.forEach((f, i) => playTone(ctx, f, 0.25, 'sine', vol, i * 0.18))
  },
  drum: (ctx, vol, freq = 80) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.1, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  },
}

export function useAudio() {
  const ctxRef = useRef(null)
  const { settings } = useSettings()
  const volume = (settings.volume ?? 80) / 100

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const play = useCallback((soundName, extraArg) => {
    if (volume === 0) return
    const ctx = getCtx()
    if (!ctx || !sounds[soundName]) return
    sounds[soundName](ctx, volume, extraArg)
  }, [getCtx, volume])

  return { play }
}
