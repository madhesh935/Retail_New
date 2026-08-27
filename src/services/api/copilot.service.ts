/**
 * Back-compat re-exports — prefer `@/services/api/chat.service`.
 */
export {
  sendCopilotChat,
  copilotService,
  type CopilotPersona,
  type ChatTurn,
  type CopilotChatRequest,
  type CopilotChatResponse,
} from './chat.service'
