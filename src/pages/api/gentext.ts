import type { APIRoute } from 'astro'
import type { RequestInit } from 'undici'
import { ProxyAgent, fetch } from 'undici'
import { generateTurboPayload, getTurboUrl, parseOpenAIStream } from '@/utils'

const apiKey = import.meta.env.OPENAI_API_KEY
const https_proxy = import.meta.env.HTTPS_PROXY
const serve_proxy = import.meta.env.SERVE_PROXY

export const post: APIRoute = async (context) => {
  const { messages } = await context.request.json()
  if (!messages)
    return new Response('[warn] No input text!')

  const initOptions = generateTurboPayload(apiKey, messages) as RequestInit
  if (https_proxy)
    initOptions.dispatcher = new ProxyAgent(https_proxy)

  const response = (await fetch(getTurboUrl(serve_proxy), initOptions)) as unknown as Response

  return new Response(parseOpenAIStream(response))
}
