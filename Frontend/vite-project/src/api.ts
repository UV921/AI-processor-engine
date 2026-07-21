import type { Research, ResearchStatus } from './types'

export async function submitUrl(url: string): Promise<{ resarchId: string; status: ResearchStatus }> {
  const res = await fetch('/resarch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Something went wrong')
  return data
}

export async function fetchResearch(id: string): Promise<Research> {
  const res = await fetch(`/resarch/${id}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Research not found')
  return data.resarch
}
