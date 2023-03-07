import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { createParser } from 'eventsource-parser'
import type { ChatMessage } from '@/types'

const defaultProxy = 'https://api.openai.com/'

export const getTurboUrl = (proxy = defaultProxy) => `${proxy}/v1/chat/completions`
export const getImageUrl = (proxy = defaultProxy) => `${proxy}/v1/images/generations`
export const getChatUrl = (proxy = defaultProxy) => `${proxy}/v1/completions`

// gpt-3.5-turbo
export const generateTurboPayload = (apiKey: string, messages: ChatMessage[]): RequestInit => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.6,
    stream: true,
  }),
})

// common chat text-davinci-003
export const generateChatPayload = (apiKey: string, prompt: string): RequestInit => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({
    model: 'text-davinci-003',
    prompt,
    temperature: 0.6,
    stream: true,
  }),
})

// image-ai
export const generateImagePayload = (apiKey: string, prompt: string) => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({ prompt, n: 1, size: '256x256' }),
})

export const parseOpenAIStream = (rawResponse: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          }
          catch (e) {
            controller.error(e)
          }
        }
      }
      const parser = createParser(streamParser)
      for await (const chunk of rawResponse.body as any)
        parser.feed(decoder.decode(chunk))
    },
  })

  return stream
}
