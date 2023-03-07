import { Index, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import type { ChatMessage, SystemMessage } from '@/types'

const decoder = new TextDecoder()

const Chat: Component = (props) => {
  const systemMessage: SystemMessage = {
    role: 'system',
    content: 'In the following dialogue, you are my spoken English teacher, have a conversation with me and correct my grammar mistakes',
  }

  const roleClass = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-gradient-to-br from-green-400 to-blue-300 rounded-full p-4'
      case 'assistant':
        return 'bg-gradient-to-br from-red-400 to-origin-500 rounded-full p-4'
      case 'system':
        return 'bg-gray-500'
    }
  }

  const [messages, setMessages] = createSignal<ChatMessage[]>([systemMessage])
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal('')
  const [input, setInput] = createSignal('')
  setMessages([...messages(), { role: 'user', content: 'hi, how do you do?' }, { role: 'assistant', content: 'Hello, I am your English teacher,have a conversation with me and correct my grammar' }])

  const fetchGPT = async (messages: ChatMessage[]) => {
    return await fetch('/api/gentext', {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const onSubmit = async () => {
    setCurrentAssistantMessage('')
    setMessages([...messages(), { role: 'user', content: input() }])
    const res = await fetchGPT([...messages(), { role: 'user', content: input() }])
    let done = false
    const reader = res.body!.getReader()
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      if (chunkValue)
        setCurrentAssistantMessage(currentAssistantMessage() + chunkValue)
      console.log(chunkValue)
    }
    setMessages([...messages(), { role: 'assistant', content: currentAssistantMessage() }])
    setInput('')
  }

  return (
    <main class='flex-1 flex flex-col'>
      <section class='flex-1'>
        <Index each={messages().slice(1)}>
          {
          (message, i) => (
            <div class='flex items-center'>
              <div class={roleClass(message().role)} />
              <p class='px-3'>
                {message().content}
              </p>
            </div>
          )
        }
        </Index>
      </section>
      <div class='py-4'>
        <input
          onChange={(e) => { setInput((e.target as HTMLInputElement).value) }}
          value={input()}
          type='text'
        />
        <button onClick={() => onSubmit()}>go</button>
      </div>
    </main>
  )
}

export default Chat
