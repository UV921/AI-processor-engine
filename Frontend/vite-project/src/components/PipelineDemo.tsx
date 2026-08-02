import { useCallback, useEffect, useRef, useState } from 'react'
import {
  IconActivity,
  IconCheck,
  IconCpu,
  IconEngine,
  IconQueue,
  IconSparkles,
  IconTarget,
} from '../Icons'
import './PipelineDemo.css'

type Stage =
  | 'idle'
  | 'submit'
  | 'research-queue'
  | 'research-worker'
  | 'eval-queue'
  | 'eval-engine'
  | 'score'

const STAGE_ORDER: Stage[] = [
  'submit',
  'research-queue',
  'research-worker',
  'eval-queue',
  'eval-engine',
  'score',
]

const STAGE_MS: Record<Stage, number> = {
  idle: 1800,
  submit: 1200,
  'research-queue': 1600,
  'research-worker': 2200,
  'eval-queue': 1200,
  'eval-engine': 2400,
  score: 3200,
}

const DEMO_CLAIMS = [
  { text: 'React 19 supports server components', supported: true },
  { text: 'Vite uses esbuild for dev transforms', supported: true },
  { text: 'BullMQ runs on Redis', supported: true },
  { text: 'Mcaly guarantees zero email loss.', supported: false },
]

const GROUNDEDNESS = 75

function stageIndex(stage: Stage) {
  if (stage === 'idle') return -1
  return STAGE_ORDER.indexOf(stage)
}

export default function PipelineDemo() {
  const [stage, setStage] = useState<Stage>('idle')
  const [playing, setPlaying] = useState(false)
  const [scoreVisible, setScoreVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const runStage = useCallback((next: Stage, onDone?: () => void) => {
    setStage(next)
    if (next === 'score') setScoreVisible(true)
    else setScoreVisible(false)

    timerRef.current = setTimeout(() => {
      const idx = stageIndex(next)
      if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
        runStage(STAGE_ORDER[idx + 1], onDone)
      } else if (next === 'score') {
        timerRef.current = setTimeout(() => {
          setPlaying(false)
          setStage('idle')
          setScoreVisible(false)
          onDone?.()
        }, STAGE_MS.score)
      }
    }, STAGE_MS[next])
  }, [])

  const start = useCallback(() => {
    clearTimer()
    setPlaying(true)
    setScoreVisible(false)
    runStage('submit')
  }, [runStage])

  useEffect(() => {
    const t = setTimeout(start, 900)
    return () => {
      clearTimeout(t)
      clearTimer()
    }
  }, [start])

  const activeIdx = stageIndex(stage)

  const nodeState = (i: number): 'done' | 'active' | 'upcoming' => {
    if (activeIdx < 0) return 'upcoming'
    if (i < activeIdx) return 'done'
    if (i === activeIdx) return 'active'
    return 'upcoming'
  }

  const packetPosition =
    activeIdx < 0 ? 0 : Math.min(100, (activeIdx / (STAGE_ORDER.length - 1)) * 100)

  return (
    <section className="pipeline-demo" aria-label="Processing pipeline demo">
      <div className="pipeline-demo-head">
        <p className="pipeline-demo-kicker">
          <IconActivity size={14} />
          Live architecture
        </p>
        <h2>Queue → Worker → Evaluation</h2>
        <p className="pipeline-demo-sub">
          Jobs flow through BullMQ queues. Workers process research, then the evaluation engine scores groundedness.
        </p>
      </div>

      <div className={`pipeline-board${playing ? ' pipeline-board--live' : ''}`}>
        <div className="pipeline-track" aria-hidden="true">
          <div className="pipeline-track-line" />
          <div
            className="pipeline-track-fill"
            style={{ width: `${packetPosition}%` }}
          />
          <div
            className="pipeline-packet"
            style={{ left: `${packetPosition}%` }}
          >
            <span className="pipeline-packet-inner">Job</span>
          </div>
        </div>

        <div className="pipeline-nodes">
          <PipelineNode
            state={nodeState(0)}
            icon={<IconEngine size={16} />}
            label="API"
            detail="POST /resarch"
          />
          <PipelineNode
            state={nodeState(1)}
            icon={<IconQueue size={16} />}
            label="Research Queue"
            detail="resarch-processing"
            queueItems={stage === 'research-queue' ? 2 : nodeState(1) === 'done' ? 0 : 1}
          />
          <PipelineNode
            state={nodeState(2)}
            icon={<IconCpu size={16} />}
            label="Research Worker"
            detail="Fetch + AI analyze"
            working={stage === 'research-worker'}
          />
          <PipelineNode
            state={nodeState(3)}
            icon={<IconQueue size={16} />}
            label="Eval Queue"
            detail="result-processing"
            queueItems={stage === 'eval-queue' ? 1 : nodeState(3) === 'done' ? 0 : 0}
          />
          <PipelineNode
            state={nodeState(4)}
            icon={<IconSparkles size={16} />}
            label="Evaluation Engine"
            detail="Claims + verify"
            working={stage === 'eval-engine'}
          />
          <PipelineNode
            state={nodeState(5)}
            icon={<IconTarget size={16} />}
            label="Score"
            detail="Groundedness"
          />
        </div>

        <div className="pipeline-status">
          <StageMessage stage={stage} />
        </div>
      </div>

      <div className={`pipeline-score${scoreVisible ? ' pipeline-score--visible' : ''}`}>
        <div className="pipeline-score-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="pipeline-score-ring-bg" cx="60" cy="60" r="52" />
            <circle
              className="pipeline-score-ring-fill"
              cx="60"
              cy="60"
              r="52"
              style={{
                strokeDasharray: `${2 * Math.PI * 52}`,
                strokeDashoffset: `${2 * Math.PI * 52 * (1 - GROUNDEDNESS / 100)}`,
              }}
            />
          </svg>
          <div className="pipeline-score-value">
            <span className="pipeline-score-num">{GROUNDEDNESS}%</span>
            <span className="pipeline-score-label">Groundedness</span>
          </div>
        </div>

        <div className="pipeline-score-details">
          <p className="pipeline-score-summary">
            <IconCheck size={15} />
            3 of 4 claims supported by source text
          </p>
          <ul className="pipeline-claims">
            {DEMO_CLAIMS.map((claim) => (
              <li
                key={claim.text}
                className={claim.supported ? 'pipeline-claim--ok' : 'pipeline-claim--bad'}
              >
                <span className="pipeline-claim-mark" aria-hidden="true">
                  {claim.supported ? '✓' : '✗'}
                </span>
                {claim.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        className="pipeline-replay"
        onClick={start}
        disabled={playing && stage !== 'score'}
      >
        {playing && stage !== 'score' ? 'Running…' : 'Replay pipeline'}
      </button>
    </section>
  )
}

function PipelineNode({
  state,
  icon,
  label,
  detail,
  working = false,
  queueItems = 0,
}: {
  state: 'done' | 'active' | 'upcoming'
  icon: React.ReactNode
  label: string
  detail: string
  working?: boolean
  queueItems?: number
}) {
  return (
    <div className={`pipeline-node pipeline-node--${state}${working ? ' pipeline-node--working' : ''}`}>
      <div className="pipeline-node-icon">{icon}</div>
      <span className="pipeline-node-label">{label}</span>
      <span className="pipeline-node-detail">{detail}</span>
      {queueItems > 0 && (
        <div className="pipeline-queue-stack" aria-hidden="true">
          {Array.from({ length: queueItems }).map((_, i) => (
            <span key={i} className="pipeline-queue-item" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      )}
      {working && <span className="pipeline-node-pulse" aria-hidden="true" />}
    </div>
  )
}

function StageMessage({ stage }: { stage: Stage }) {
  const messages: Record<Stage, string> = {
    idle: 'Ready — job will enter the pipeline…',
    submit: 'URL submitted → job created in Redis',
    'research-queue': 'Job waiting in research queue…',
    'research-worker': 'Worker picked up job — fetching page & running AI',
    'eval-queue': 'Research done → forwarded to evaluation queue',
    'eval-engine': 'Extracting claims & verifying against source',
    score: 'Evaluation complete — groundedness score computed',
  }

  return <p className="pipeline-stage-msg">{messages[stage]}</p>
}
