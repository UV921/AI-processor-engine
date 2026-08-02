import { useEffect, useRef, useState } from 'react'
import { fetchResearch, submitUrl } from '../api'
import GroundednessCard from '../components/GroundednessCard'
import LivePipeline from '../components/LivePipeline'
import PipelineDemo from '../components/PipelineDemo'
import type { Research, ResearchStage, ResearchStatus } from '../types'
import {
  IconAlert,
  IconCheck,
  IconEngine,
  IconLightbulb,
  IconLink,
  IconLoader,
  IconSend,
  IconTarget,
} from '../Icons'
import './Home.css'

// Stages change faster than the research status, so poll often enough that
// every step of the pipeline is actually visible.
const POLL_MS = 900

type Phase = 'idle' | 'submitting' | ResearchStatus

export default function Home() {
  const [url, setUrl] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [research, setResearch] = useState<Research | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastStatusRef = useRef<ResearchStatus | null>(null)

  const stage: ResearchStage = research?.stage ?? 'queued'
  const isFailed = phase === 'failed' || research?.status === 'failed' || stage === 'failed'
  const hasResult = research?.status === 'completed'
  // The evaluation worker keeps running after status flips to "completed",
  // so the pipeline stays on screen until the score lands.
  const isSettled = stage === 'scored' || isFailed
  const isWorking = phase !== 'idle' && !isSettled
  const loading = phase !== 'idle' && !isSettled

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const applyUpdate = (data: Research) => {
    setResearch(data)
    if (lastStatusRef.current !== data.status) {
      lastStatusRef.current = data.status
      setPhase(data.status)
    }
  }

  const startPolling = (id: string) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const data = await fetchResearch(id)
        applyUpdate(data)
        if (data.status === 'failed' || data.stage === 'failed' || data.stage === 'scored') {
          stopPolling()
        }
      } catch {
        stopPolling()
        setPhase('failed')
        setError('Lost connection while checking status')
      }
    }, POLL_MS)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    setPhase('submitting')
    setError(null)
    setResearch(null)
    lastStatusRef.current = null
    stopPolling()

    try {
      const { resarchId, status } = await submitUrl(trimmed)
      const data = await fetchResearch(resarchId)
      applyUpdate(data)
      if (status !== data.status) setPhase(data.status)
      if (data.stage !== 'scored' && data.stage !== 'failed' && data.status !== 'failed') {
        startPolling(resarchId)
      }
    } catch (err) {
      setPhase('failed')
      setError(err instanceof Error ? err.message : 'Failed to submit URL')
    }
  }

  const resetToIdle = () => {
    stopPolling()
    setPhase('idle')
    setError(null)
    setResearch(null)
    lastStatusRef.current = null
  }

  const searchBar = (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar-input">
        <IconLink size={18} />
        <input
          type="url"
          placeholder="Paste a URL to research…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
          autoFocus={phase === 'idle'}
        />
      </div>
      <button type="submit" disabled={loading || !url.trim()} aria-label="Analyze">
        {loading ? <IconLoader className="spin" size={18} /> : <IconSend size={16} />}
      </button>
    </form>
  )

  return (
    <div className="shell">
      <main className={`content${hasResult ? ' content--result' : ''}`}>
        {phase === 'idle' && (
          <div className="welcome">
            <p className="brand">
              <IconEngine size={22} />
              uvengine
            </p>
            <h1>
              Turn any page into
              <em> clear research</em>
            </h1>
            <p className="welcome-tagline">
              Paste an article or docs link. Get a summary, key concepts, and who it helps.
            </p>
            {searchBar}
            <p className="welcome-hint">Works with public web pages and articles.</p>
            <PipelineDemo />
          </div>
        )}

        {phase !== 'idle' && (
          <header className="topbar">
            <button type="button" className="brand-link" onClick={resetToIdle} aria-label="Back to home">
              <IconEngine size={18} />
              <span>uvengine</span>
            </button>
          </header>
        )}

        {isWorking && (
          <div className="status-panel reveal">
            <LivePipeline stage={stage} url={research?.url ?? url} />
          </div>
        )}

        {(error || (isFailed && research?.errorMessage)) && (
          <div className="status-panel reveal">
            <div className="status-error">
              <IconAlert size={18} />
              <p>{error ?? research?.errorMessage}</p>
            </div>
            {research && <LivePipeline stage={stage} url={research.url} failed />}
            <button type="button" className="ghost-btn" onClick={resetToIdle}>
              Try another URL
            </button>
          </div>
        )}

        {hasResult && research && (
          <article className="research reveal">
            <header className="research-head">
              <p className="research-ready">
                <IconCheck size={15} /> Research ready
              </p>
              <a href={research.url} target="_blank" rel="noreferrer" className="research-link">
                <IconLink size={15} /> {research.url}
              </a>
              {research.title && <h1>{research.title}</h1>}
            </header>

            {research.summary && (
              <section className="research-section">
                <h2>Summary</h2>
                <p className="research-summary">{research.summary}</p>
              </section>
            )}

            {research.keyConcepts && research.keyConcepts.length > 0 && (
              <section className="research-section">
                <h2><IconLightbulb size={17} /> Key concepts</h2>
                <ul className="research-concepts">
                  {research.keyConcepts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {research.usefulFor && research.usefulFor.length > 0 && (
              <section className="research-section">
                <h2><IconTarget size={17} /> Useful for</h2>
                <ul className="research-uses">
                  {research.usefulFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {typeof research.groundedness === 'number' && research.claims && (
              <GroundednessCard
                groundedness={research.groundedness}
                claims={research.claims}
              />
            )}
          </article>
        )}
      </main>

      {phase !== 'idle' && (
        <footer className="footer">{searchBar}</footer>
      )}
    </div>
  )
}
