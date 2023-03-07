export interface MessageCommon {
  content: string
}

export interface UserMessage extends MessageCommon {
  role: 'user'
}

export interface AssistantMessage extends MessageCommon {
  role: 'assistant'
}

export interface SystemMessage extends MessageCommon {
  role: 'system'
}

export interface ChatMessage extends MessageCommon {
  role: UserMessage['role'] | AssistantMessage['role'] | SystemMessage[ 'role']
}

export interface RequestInitWithDispatcher extends RequestInit {
  dispatcher?: any
}

export interface ImagePayload {
  prompt: string
  n?: number
  size?: string
}
