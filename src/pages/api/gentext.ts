import type { APIRoute } from 'astro'
import { getTextStream } from '@/utils'

const genPrompt = (prompt: string) => {
  return `以下面文字开头接着续写一篇小说：
  ${prompt}
  `
}

export const post: APIRoute = async (context) => {
  const body = await context.request.json()
  const prompt = body.input
  const p = {
    prompt: genPrompt(prompt),
    temperature: 0.7,
    max_tokens: 500,
  }
  const stream = await getTextStream(p)
  return new Response(stream)
}
