import { getImage } from '@/utils'
import type { APIRoute } from 'astro'

const genPrompt = (prompt: string) => {
  return `3D动漫风: ${prompt}`
}

export const get:APIRoute=async (c) =>{
  const prompt =genPrompt(c.url.searchParams.get('text')|| '') 
  const res = await getImage({prompt})
  return new Response(res.body)
}

