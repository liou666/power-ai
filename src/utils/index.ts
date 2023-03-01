import { createParser } from 'eventsource-parser'

export type TextStreamPayload = {
  prompt: string
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  max_tokens?: number
  stream?: boolean
  n?: number
}

export type ImagePayload = {
  prompt: string
  n?: number
  size?: string
}

const k = import.meta.env.KEY

export const getTextStream = async (payload: TextStreamPayload) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const defaultPayload = {
    model: 'text-davinci-003',
    stream: true,
  }
  const res = await fetch('https://api.openai.com/v1/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${k}`,
    },
    method: 'POST',
    body: JSON.stringify({ ...payload, defaultPayload }),
  })
  return new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === 'event') {
          const data = event.data
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].text
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            // maybe parse error
            controller.error(e)
          }
        }
      }
      const parser = createParser(onParse)
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })
}

export const getImage = async ({ n = 1, size = '256x256', prompt }: ImagePayload) => {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${k}`,
    },
    method: 'POST',
    body: JSON.stringify({ prompt, n, size }),
  })
  return res
}
