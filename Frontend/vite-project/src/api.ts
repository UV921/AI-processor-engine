import type { Research, ResearchStatus } from './types'

const BACKEND_DOWN =
  'Cannot reach the backend on port 3000. Start it with: npx tsx src/server.ts'

async function readJson(res: Response, fallback: string) {
  const body = await res.text()

  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    // An HTML body means the proxy hit something other than our API
    // (dev server fallback, or another app squatting on port 3000).
    throw new Error(body.trimStart().startsWith('<') ? BACKEND_DOWN : fallback)
  }

  if (!res.ok) {
    const message = (data as { message?: string })?.message
    throw new Error(message ?? fallback)
  }
  return data
}

export async function submitUrl(url: string): Promise<{ resarchId: string; status: ResearchStatus }> {
  let res: Response
  try {
    res = await fetch('/resarch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
  } catch {
    throw new Error(BACKEND_DOWN)
  }

  return (await readJson(res, 'Something went wrong')) as {
    resarchId: string
    status: ResearchStatus
  }
}

export async function fetchResearch(id: string): Promise<Research> {
  let res: Response
  try {
    res = await fetch(`/resarch/${id}`)
  } catch {
    throw new Error(BACKEND_DOWN)
  }

  const data = (await readJson(res, 'Research not found')) as { resarch: Research }
  return data.resarch
}
