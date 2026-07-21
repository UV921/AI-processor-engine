import { STEP_ICONS } from '../Icons'
import type { ResearchStatus } from '../types'
import './StatusSteps.css'

const STEPS = [
  { key: 'submitting', label: 'Submitted' },
  { key: 'pending', label: 'Queued' },
  { key: 'processing', label: 'Analyzing' },
  { key: 'completed', label: 'Done' },
] as const

type Phase = ResearchStatus | 'submitting'

function getStepState(i: number, phase: Phase, failed: boolean) {
  if (failed) return i >= 2 ? 'failed' : 'done'
  if (phase === 'completed') return 'done'
  const order: Phase[] = ['submitting', 'pending', 'processing', 'completed']
  const active = order.indexOf(phase)
  if (i < active) return 'done'
  if (i === active) return 'active'
  return 'upcoming'
}

export default function StatusSteps({
  phase,
  failed = false,
}: {
  phase: Phase
  failed?: boolean
}) {
  return (
    <div className="status-steps">
      {STEPS.map((step, i) => {
        const state = getStepState(i, phase, failed)
        const Icon = failed && i >= 2 ? STEP_ICONS.failed : STEP_ICONS[step.key]

        return (
          <div key={step.key} className={`status-step status-step--${state}`}>
            <span className="status-step-dot"><Icon size={13} /></span>
            <span className="status-step-label">
              {failed && i === 3 ? 'Failed' : step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
