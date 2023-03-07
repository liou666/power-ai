export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface RequestInitWithDispatcher extends RequestInit {
  dispatcher?: any
}

export interface ImagePayload {
  prompt: string
  n?: number
  size?: string
}
