import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  matchedGiria?: string | null;
  createdAt: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  activeConversationId: number | null;
  addMessage: (msg: ChatMessage) => void;
  setConversationId: (id: number | null) => void;
  clearMessages: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  activeConversationId: null,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setConversationId: (id) => set({ activeConversationId: id }),
  clearMessages: () => set({ messages: [], activeConversationId: null }),
  setMessages: (messages) => set({ messages }),
}));
