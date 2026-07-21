export type ResearchStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Research {
  id: string
  url: string
  status: ResearchStatus
  title?: string | null
  summary?: string | null
  keyConcepts?: string[] | null
  usefulFor?: string[] | null
  errorMessage?: string | null
}
