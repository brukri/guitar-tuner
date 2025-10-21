import React from 'react'
import type { StringSpec } from './App'

type Props = {
  target: StringSpec | null
  cents: number | null
  status: 'low' | 'in' | 'high' | 'idle'
}

export function TuningIndicator({ target, cents, status }: Props) {
  const value = Math.max(-50, Math.min(50, cents ?? 0))
  return (
    <div className="indicator">
      <div className="indicator-scale">
        <div className="tick" />
        <div className="tick" />
        <div className="tick center" />
        <div className="tick" />
        <div className="tick" />
        <div className="needle" style={{ left: `${50 + value}%` }} />
      </div>
      <div className="legend">
        <span className={status === 'low' ? 'active' : ''}>Too Low</span>
        <span className={status === 'in' ? 'active' : ''}>In Tune {target ? `(${target.name})` : ''}</span>
        <span className={status === 'high' ? 'active' : ''}>Too High</span>
      </div>
    </div>
  )
}
