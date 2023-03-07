import { Index, createSignal, createEffect, Show } from 'solid-js'
import type { Component  } from 'solid-js'
import type { ChatMessage, SystemMessage } from '@/types'
import Delete from '@/icons/Delete'
import Send from '@/icons/Send'

const decoder = new TextDecoder()

const Chat: Component = (props) => {
  let chatWrapper: HTMLDivElement

  const systemMessage: SystemMessage = {
    role: 'system',
    content: 'In the following dialogue, you are my spoken English teacher, have a conversation with me and correct my grammar mistakes',
  }

  const roleClass = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-gradient-to-br from-green-400 to-blue-300 rounded-full p-4'
      case 'assistant':
        return 'bg-gradient-to-br from-blue-300 to-red-600 rounded-full p-4'
      case 'system':
        return 'bg-gray-500'
    }
  }

  const [messages, setMessages] = createSignal<ChatMessage[]>([systemMessage])
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal('')
  const [input, setInput] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  // setMessages([...messages(), { role: 'user', content: 'hi' }, { role: 'assistant', content: 'Hello, I am your English teacher,have a conversation with me and correct my grammar' }])

  createEffect(() => {
    console.log(messages())
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
  })

  const fetchGPT = async (messages: ChatMessage[]) => {
    return await fetch('/api/gentext', {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: { 'Content-Type': 'application/json' },
    })
  }



  const onSubmit = async () => {
    if(!input() || loading()) return
    setLoading(true)
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
    setLoading(false)
  }

  const onClear = () => {
    setMessages([systemMessage])
  }

  return (
    <main class='flex-1 flex flex-col relative'>
      <section ref={chatWrapper} class='max-h-[calc(100vh-16rem)] overflow-auto'>
        <Index each={messages().slice(1)}>
          {
            (message, i) => (
              <div class='flex items-center odd:flex-row-reverse'>
                <div class={roleClass(message().role)} />
                <p class='mx-2 p-3 bg-white dark:bg-slate-500 dark:text-slate-200 rounded'>
                  {message().content}
                </p>
              </div>
            )
          }
        </Index>
      </section>
      <div class='h-11 w-full flex items-center absolute bottom-0'>
        <Show
          when={!loading()}
          fallback={
            <div class='animate-pulse w-full h-full px-3 flex items-center justify-center dark:text-slate-400 dark:placeholder:text-slate-400 dark:placeholder:opacity-30 dark:bg-slate-500/40 '>
              Loading...
            </div>
          }
        >
          <input
            onChange={(e) => { setInput((e.target as HTMLInputElement).value) }}
            value={input()}
            type='text'
            placeholder='Type your message here...'
            class='dark:text-slate-400 dark:placeholder:text-slate-400 dark:placeholder:opacity-30 dark:bg-slate-500/40 border-0 text-lg outline-none rounded w-full h-full px-3'
          />
        </Show>

        <button
          disabled={loading()}
          class='ml-2 mr-1 px-5 flex items-center text-xl text-white bg-gradient-to-r rounded from-green-400 to-blue-400 hover:shadow-md duration-300  cursor-pointer h-full border-0 font-sans disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:font'
          onClick={() => onSubmit()
          }>
          <Send />
        </button>
        <button
          onClick={() => onClear()}
          disabled={loading()}
          class='px-4 flex items-center text-xl text-white rounded bg-gray-500 hover:shadow-md duration-300  cursor-pointer h-full border-0 font-sans disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:font'
        >
          <Delete />
        </button>
      </div>
    </main>
  )
}

export default Chat

