import { IconTarget } from '../Icons'
import type { ClaimVerdict } from '../types'
import './GroundednessCard.css'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function GroundednessCard({
  groundedness,
  claims,
}: {
  groundedness: number
  claims: ClaimVerdict[]
}) {
  const percent = Math.round(groundedness * 100)
  const supported = claims.filter((c) => c.supported).length

  return (
    <section className="grounded-card">
      <h2 className="grounded-heading">
        <IconTarget size={17} /> Groundedness
      </h2>

      <div className="grounded-body">
        <div className="grounded-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="grounded-ring-bg" cx="60" cy="60" r={RADIUS} />
            <circle
              className="grounded-ring-fill"
              cx="60"
              cy="60"
              r={RADIUS}
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: CIRCUMFERENCE * (1 - groundedness),
              }}
            />
          </svg>
          <div className="grounded-ring-value">
            <span className="grounded-num">{percent}%</span>
            <span className="grounded-label">grounded</span>
          </div>
        </div>

        <div className="grounded-details">
          <p className="grounded-summary">
            {supported} of {claims.length} claims supported by the source text
          </p>
          <ul className="grounded-claims">
            {claims.map((claim, i) => (
              <li
                key={`${claim.claim}-${i}`}
                className={claim.supported ? 'grounded-claim--ok' : 'grounded-claim--bad'}
              >
                <span className="grounded-claim-mark" aria-hidden="true">
                  {claim.supported ? '✓' : '✗'}
                </span>
                <span>
                  {claim.claim}
                  {!claim.supported && claim.reason && (
                    <em className="grounded-claim-reason">{claim.reason}</em>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
