import React, { useEffect, useMemo, useState } from 'react'
import type { StringSpec } from './App'

type Props = {
  tuning: readonly StringSpec[]
  pluckEvent: { name: string; at: number } | null
  activeString?: string
}

export function GuitarNeck({ tuning, pluckEvent, activeString }: Props) {
  // Maintain per-string animation state
  const [plucked, setPlucked] = useState<Record<string, number>>({})

  useEffect(() => {
    if (pluckEvent) {
      setPlucked((prev) => ({ ...prev, [pluckEvent.name]: pluckEvent.at }))
      const t = setTimeout(() => {
        setPlucked((prev) => {
          const copy = { ...prev }
          delete copy[pluckEvent.name]
          return copy
        })
      }, 300)
      return () => clearTimeout(t)
    }
  }, [pluckEvent])

  const strings = useMemo(() => tuning, [tuning])

  return (
    <section className="neck" aria-label="Guitar neck">
      <div className="frets" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="fret" />
        ))}
      </div>
      <ul className="strings">
        {strings.map((s) => {
          const isActive = activeString === s.name
          const isPlucked = plucked[s.name] != null
          return (
            <li key={s.name} className={"string" + (isActive ? " active" : "") + (isPlucked ? " plucked" : "")}>
              <span className="badge">{s.name}</span>
              <div className="wire" />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
