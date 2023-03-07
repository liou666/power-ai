import type { APIRoute } from 'astro'
import type { RequestInit } from 'undici'
import { ProxyAgent, fetch } from 'undici'
import { generateImagePayload, getImageUrl } from '@/utils'

const apiKey = import.meta.env.OPENAI_API_KEY
const https_proxy = import.meta.env.HTTPS_PROXY
const serve_proxy = import.meta.env.SERVE_PROXY

const genPrompt = (prompt: string) => {
  return `3D动漫风: ${prompt}`
}

export const get: APIRoute = async (context) => {
  const prompt = context.url.searchParams.get('prompt')
  if (!prompt)
    return new Response('[warn] No input prompt!')

  const initOptions = generateImagePayload(apiKey, genPrompt(prompt)) as RequestInit
  if (https_proxy)
    initOptions.dispatcher = new ProxyAgent(https_proxy)

  const response = (await fetch(getImageUrl(serve_proxy), initOptions)) as unknown as Response

  return new Response(response.body)
}
