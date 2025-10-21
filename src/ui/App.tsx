import React from 'react'
import { usePitchDetector } from '../utils/usePitchDetector'
import { GuitarNeck } from './GuitarNeck'
import { TuningIndicator } from './TuningIndicator'

export const STANDARD_TUNING = [
  { name: 'E4', freq: 329.63 },
  { name: 'B3', freq: 246.94 },
  { name: 'G3', freq: 196.00 },
  { name: 'D3', freq: 146.83 },
  { name: 'A2', freq: 110.00 },
  { name: 'E2', freq: 82.41 },
] as const

export type StringSpec = typeof STANDARD_TUNING[number]

export function App() {
  const { start, stop, running, pitch, energy, nearest, cents, status, pluckEvent } = usePitchDetector(STANDARD_TUNING)

  return (
    <div className="app">
      <header>
        <h1>Guitar Tuner</h1>
        <div className="controls">
          {!running ? (
            <button onClick={start} className="primary">Enable Microphone</button>
          ) : (
            <button onClick={stop}>Stop</button>
          )}
        </div>
      </header>

      <main>
        <GuitarNeck tuning={STANDARD_TUNING} pluckEvent={pluckEvent} activeString={nearest?.name} />

        <section className="readout">
          <div className="row">
            <div className="metric"><label>Pitch</label><span>{pitch ? pitch.toFixed(2) + ' Hz' : '—'}</span></div>
            <div className="metric"><label>Energy</label><span>{energy.toFixed(2)}</span></div>
          </div>
          <TuningIndicator target={nearest} cents={cents} status={status} />
        </section>
      </main>

      <footer>
        <small>Standard tuning E A D G B E • Microphone stays in your browser, no upload</small>
      </footer>
    </div>
  )
}
