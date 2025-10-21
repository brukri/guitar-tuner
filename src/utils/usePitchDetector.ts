import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {StringSpec} from "../ui/App";

export type Tuning = readonly { name: string; freq: number }[]

export function usePitchDetector(tuning: Tuning) {
  const [running, setRunning] = useState(false)
  const [pitch, setPitch] = useState<number | null>(null)
  const [energy, setEnergy] = useState(0)
  const [nearest, setNearest] = useState<StringSpec | null>(null)
  const [cents, setCents] = useState<number | null>(null)
  const [status, setStatus] = useState<'low' | 'in' | 'high' | 'idle'>('idle')
  const [pluckEvent, setPluckEvent] = useState<{ name: string; at: number } | null>(null)

  const audioRef = useRef<{ ctx: AudioContext; src: MediaStreamAudioSourceNode; proc: ScriptProcessorNode } | null>(null)

  const computeNearest = useCallback((f: number) => {
    let best = tuning[0]
    let min = Infinity
    for (const t of tuning) {
      const d = Math.abs(t.freq - f)
      if (d < min) {
        min = d
        best = t
      }
    }
    return best as StringSpec
  }, [tuning])

  const toCents = (f: number, target: number) => 1200 * Math.log2(f / target)

  const detectPitch = useMemo(() => {
    // Autocorrelation with parabolic interpolation
    return (buf: Float32Array, sampleRate: number) => {
      const size = buf.length
      // Remove DC offset and normalize
      let mean = 0
      for (let i = 0; i < size; i++) mean += buf[i]
      mean /= size
      let rms = 0
      const input = new Float32Array(size)
      for (let i = 0; i < size; i++) { const v = buf[i] - mean; input[i] = v; rms += v * v }
      rms = Math.sqrt(rms / size)
      // Energy for hit/pluck detection
      const energy = rms

      if (rms < 0.005) return { freq: null as number | null, energy }

      const minLag = Math.floor(sampleRate / 1000) // max 1000 Hz
      const maxLag = Math.floor(sampleRate / 60)   // min 60 Hz
      let bestLag = -1
      let bestCorr = 0
      for (let lag = minLag; lag <= maxLag; lag++) {
        let corr = 0
        for (let i = 0; i < size - lag; i++) {
          corr += input[i] * input[i + lag]
        }
        if (corr > bestCorr) { bestCorr = corr; bestLag = lag }
      }
      if (bestLag === -1) return { freq: null as number | null, energy }

      // Parabolic interpolation around best lag
      const y0 = correlationAt(input, bestLag - 1)
      const y1 = correlationAt(input, bestLag)
      const y2 = correlationAt(input, bestLag + 1)
      const shift = (y2 - y0) / (2 * (2 * y1 - y2 - y0))
      const lag = bestLag + (isFinite(shift) ? shift : 0)
      const freq = sampleRate / lag
      return { freq, energy }
    }

    function correlationAt(x: Float32Array, lag: number): number {
      if (lag < 0 || lag >= x.length) return 0
      let sum = 0
      for (let i = 0; i < x.length - lag; i++) sum += x[i] * x[i + lag]
      return sum
    }
  }, [])

  const start = useCallback(async () => {
    if (running) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false })
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const src = ctx.createMediaStreamSource(stream)
    const proc = ctx.createScriptProcessor(2048, 1, 1)
    src.connect(proc)
    proc.connect(ctx.destination)

    proc.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0)
      const { freq, energy } = detectPitch(input, ctx.sampleRate)
      setEnergy((prev) => 0.8 * prev + 0.2 * energy)
      if (freq && isFinite(freq) && freq > 50 && freq < 1200) {
        setPitch(freq)
        const nearest = computeNearest(freq)
        setNearest(nearest)
        const c = toCents(freq, nearest.freq)
        setCents(c)
        const newStatus: typeof status = Math.abs(c) < 5 ? 'in' : c < 0 ? 'low' : 'high'
        setStatus(newStatus)
        // Hit detection: if a fresh local energy spike and changed status near the target
        if (energy > 0.02) {
          setPluckEvent({ name: nearest.name, at: Date.now() })
        }
      } else {
        setPitch(null)
        setNearest(null)
        setCents(null)
        setStatus('idle')
      }
    }

    audioRef.current = { ctx, src, proc }
    setRunning(true)
  }, [computeNearest, detectPitch, running])

  const stop = useCallback(() => {
    if (!audioRef.current) return
    const { ctx, proc, src } = audioRef.current
    try { proc.disconnect(); src.disconnect(); ctx.close() } catch {}
    audioRef.current = null
    setRunning(false)
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { start, stop, running, pitch, energy, nearest, cents, status, pluckEvent }
}
