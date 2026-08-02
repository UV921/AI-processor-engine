import { useEffect, useRef, useState } from 'react'
import {
  IconActivity,
  IconAlert,
  IconCheck,
  IconCpu,
  IconFileText,
  IconLink,
  IconLoader,
  IconQueue,
  IconSend,
  IconSparkles,
  IconTarget,
} from '../Icons'
import type { ResearchStage } from '../types'
import './LivePipeline.css'

type Step = {
  stage: ResearchStage
  label: string
  detail: string
  running: string
  icon: typeof IconQueue
}

const STEPS: Step[] = [
  {
    stage: 'queued',
    label: 'Added to the queue',
    detail: 'resarch-processing',
    running: 'Job created in Redis, waiting for a free worker',
    icon: IconSend,
  },
  {
    stage: 'fetching',
    label: 'Fetching the page',
    detail: 'worker + cheerio',
    running: 'Downloading the URL and stripping it down to text',
    icon: IconLink,
  },
  {
    stage: 'analyzing',
    label: 'Reading with Gemini',
    detail: 'gemini-2.5-flash',
    running: 'Writing the title, summary, key concepts and audience',
    icon: IconCpu,
  },
  {
    stage: 'eval-queued',
    label: 'Handed to evaluation',
    detail: 'result-processing',
    running: 'Research saved, evaluation job queued',
    icon: IconQueue,
  },
  {
    stage: 'extracting-claims',
    label: 'Extracting claims',
    detail: 'gemini-2.5-flash-lite',
    running: 'Turning the summary into checkable statements',
    icon: IconFileText,
  },
  {
    stage: 'verifying-claims',
    label: 'Verifying against source',
    detail: 'gemini-2.5-flash',
    running: 'Checking every claim against the original page text',
    icon: IconSparkles,
  },
  {
    stage: 'scored',
    label: 'Groundedness scored',
    detail: 'supported / total',
    running: 'Computing the final score',
    icon: IconTarget,
  },
]

// `analyzed` is the moment the AI result is written; it collapses into the
// "Reading with Gemini" row rather than getting a row of its own.
const STAGE_TO_INDEX: Record<ResearchStage, number> = {
  queued: 0,
  fetching: 1,
  analyzing: 2,
  analyzed: 2,
  'eval-queued': 3,
  'extracting-claims': 4,
  'verifying-claims': 5,
  scored: 6,
  failed: -1,
}

type StepState = 'done' | 'active' | 'upcoming' | 'failed'

export default function LivePipeline({
  stage,
  failed = false,
  url,
}: {
  stage: ResearchStage
  failed?: boolean
  url?: string | null
}) {
  const activeIdx = failed ? -1 : STAGE_TO_INDEX[stage] ?? 0
  const isScored = stage === 'scored'

  // Freeze the failure point so the rows before it still read as done.
  const lastGoodIdx = useRef(0)
  if (!failed && activeIdx >= 0) lastGoodIdx.current = activeIdx

  const stepState = (i: number): StepState => {
    if (failed) {
      if (i < lastGoodIdx.current) return 'done'
      if (i === lastGoodIdx.current) return 'failed'
      return 'upcoming'
    }
    if (isScored) return 'done'
    if (i < activeIdx) return 'done'
    if (i === activeIdx) return 'active'
    return 'upcoming'
  }

  const reached = failed ? lastGoodIdx.current : isScored ? STEPS.length - 1 : activeIdx
  const progress = (reached / (STEPS.length - 1)) * 100

  return (
    <section className="live-pipeline" aria-label="Processing progress">
      <header className="live-pipeline-head">
        <p className="live-pipeline-kicker">
          <IconActivity size={14} />
          Running now
        </p>
        {url && <span className="live-pipeline-url">{url}</span>}
      </header>

      <div className="live-pipeline-rail" aria-hidden="true">
        <span
          className={`live-pipeline-rail-fill${failed ? ' live-pipeline-rail-fill--failed' : ''}`}
          style={{ height: `${progress}%` }}
        />
      </div>

      <ol className="live-pipeline-steps">
        {STEPS.map((step, i) => {
          const state = stepState(i)
          const Icon = state === 'failed' ? IconAlert : state === 'done' ? IconCheck : step.icon

          return (
            <li key={step.stage} className={`live-step live-step--${state}`}>
              <span className="live-step-marker">
                <Icon size={14} />
              </span>

              <div className="live-step-body">
                <p className="live-step-label">
                  {step.label}
                  {state === 'active' && <IconLoader className="spin live-step-spinner" size={13} />}
                </p>
                <p className="live-step-detail">
                  {state === 'active' ? step.running : step.detail}
                </p>
              </div>

              {state === 'active' && <Elapsed key={step.stage} />}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Elapsed() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - started) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="live-step-elapsed">{seconds}s</span>
}
