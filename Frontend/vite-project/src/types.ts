export type ResearchStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type ResearchStage =
  | 'queued'
  | 'fetching'
  | 'analyzing'
  | 'analyzed'
  | 'eval-queued'
  | 'extracting-claims'
  | 'verifying-claims'
  | 'scored'
  | 'failed'

export interface ClaimVerdict {
  claim: string
  supported: boolean
  evidence: string | null
  reason: string
}

export interface Research {
  id: string
  url: string
  status: ResearchStatus
  stage?: ResearchStage | null
  title?: string | null
  summary?: string | null
  keyConcepts?: string[] | null
  usefulFor?: string[] | null
  claims?: ClaimVerdict[] | null
  groundedness?: number | null
  errorMessage?: string | null
}
