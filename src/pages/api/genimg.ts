import { generateImagePayload, IMAGE_URL } from '@/utils'
import type { APIRoute } from 'astro'
import { fetch, ProxyAgent } from 'undici'

const apiKey = import.meta.env.OPENAI_API_KEY
const https_proxy = import.meta.env.HTTPS_PROXY

const genPrompt = (prompt: string) => {
  return `3D动漫风: ${prompt}`
}

export const get: APIRoute = async (context) => {
  const prompt = context.url.searchParams.get('prompt')
  if (!prompt) {
    return new Response('[warn] No input prompt!')
  }
  const initOptions = generateImagePayload(apiKey, genPrompt(prompt))
  if (https_proxy) {
    initOptions['dispatcher'] = new ProxyAgent(https_proxy)
  }

  //@ts-ignore
  const response = (await fetch(IMAGE_URL, initOptions)) as Response

  return new Response(response.body)
}
