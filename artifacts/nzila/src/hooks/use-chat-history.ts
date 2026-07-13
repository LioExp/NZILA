import { create } from 'zustand';

export interface TravelData {
  placeNames: string[];
  focus: {
    name: string;
    mapLat: number;
    mapLng: number;
    mapZoom: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  versions?: string[];
  currentVersion?: number;
  source?: string;
  matchedGiria?: string | null;
  travelData?: TravelData | null;
  fileAttachment?: { name: string; type: string; dataUrl?: string } | null;
  createdAt: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  activeConversationId: number | null;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setConversationId: (id: number | null) => void;
  clearMessages: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  activeConversationId: null,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  setConversationId: (id) => set({ activeConversationId: id }),
  clearMessages: () => set({ messages: [], activeConversationId: null }),
  setMessages: (messages) => set({ messages }),
}));
