import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, UpdateTitleData } from '@perpx/shared/types/chat.type';
import { Message } from '@perpx/shared/types/message.type';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: Message[];
  isStreaming: boolean;
  streamingMessage: string;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  activeChat: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[] | []>) => {
      state.chats = action.payload;
    },

    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.unshift(action.payload);
    },

    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);

      if (state.activeChat?.id === action.payload) {
        state.activeChat = null;
        state.messages = [];
      }
    },

    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },

    removeActiveChatId: (state) => {
      state.activeChatId = null;
    },

    setActiveChat: (state, action: PayloadAction<Chat | null>) => {
      state.activeChat = action.payload;
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    appendStreamingToken: (state, action: PayloadAction<string>) => {
      state.streamingMessage += action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      const existingMsgIndex = state.messages.findIndex((m) => m.id === action.payload.id);

      if (existingMsgIndex !== -1) {
        state.messages[existingMsgIndex] = action.payload;
        return;
      } else {
        state.messages.push(action.payload);
      }
    },

    setIsStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },

    setStreamingMessage: (state, action: PayloadAction<string>) => {
      state.streamingMessage = action.payload;
    },

    clearStreamingMessage: (state) => {
      state.streamingMessage = '';
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    updateChatTitle: (state, action: PayloadAction<UpdateTitleData>) => {
      if (!action.payload?.id) return;
      const chatIndex = state.chats.findIndex((chat) => chat && chat.id == action.payload.id);

      if (chatIndex !== -1 && state.chats[chatIndex]) {
        state.chats[chatIndex].title = action.payload.title;
        state.chats[chatIndex].updatedAt = action.payload.updatedAt;
      }

      if (state.activeChat && state.activeChat.id === action.payload.id) {
        state.activeChat.title = action.payload.title;
        state.activeChat.updatedAt = action.payload.updatedAt;
      }
    },

    updateHumanMessageId: (
      state,
      action: PayloadAction<{ tempId: string; realMessage: Message }>,
    ) => {
      const msgIndex = state.messages.findIndex((m) => m.id === action.payload.tempId);
      if (msgIndex !== -1) {
        // Temp message ko real message data se replace kar do
        state.messages[msgIndex] = action.payload.realMessage;
      }
    },

    resetChatState: (state) => {
      state.activeChat = null;
      state.messages = [];
      state.isStreaming = false;
      state.streamingMessage = '';
      state.error = null;
    },

    clearAllChatsState: (state) => {
      state.chats = [];
      state.activeChat = null;
      state.activeChatId = null;
      state.messages = [];
      state.isStreaming = false;
      state.streamingMessage = '';
      state.error = null;
    },
  },
});

export const {
  setChats,
  addChat,
  deleteChat,
  setActiveChatId,
  removeActiveChatId,
  setActiveChat,
  setMessages,
  addMessage,
  setIsStreaming,
  setStreamingMessage,
  clearStreamingMessage,
  appendStreamingToken,
  setError,
  updateChatTitle,
  updateHumanMessageId,
  resetChatState,
  clearAllChatsState,
} = chatSlice.actions;

export default chatSlice.reducer;
