import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, UpdateTitleData } from '@perpx/shared/types/chat.type';
import { Message } from '@perpx/shared/types/message.type';

interface SpaceChatState {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: Message[];
  isStreaming: boolean;
  streamingMessage: string;
  error: string | null;
}

const initialState: SpaceChatState = {
  chats: [],
  activeChatId: null,
  activeChat: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  error: null,
};

const spaceChatSlice = createSlice({
  name: 'spaceChat',
  initialState,
  reducers: {
    setSpaceChats: (state, action: PayloadAction<Chat[] | []>) => {
      state.chats = action.payload;
    },

    addSpaceChat: (state, action: PayloadAction<Chat>) => {
      state.chats.unshift(action.payload);
    },

    deleteSpaceChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);

      if (state.activeChat?.id === action.payload) {
        state.activeChat = null;
        state.messages = [];
      }
    },

    setSpaceActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },

    removeSpaceActiveChatId: (state) => {
      state.activeChatId = null;
    },

    setSpaceActiveChat: (state, action: PayloadAction<Chat | null>) => {
      state.activeChat = action.payload;
    },

    setSpaceMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    appendSpaceStreamingToken: (state, action: PayloadAction<string>) => {
      state.streamingMessage += action.payload;
    },

    addSpaceMessage: (state, action: PayloadAction<Message>) => {
      const existingMsgIndex = state.messages.findIndex((m) => m.id === action.payload.id);

      if (existingMsgIndex !== -1) {
        state.messages[existingMsgIndex] = action.payload;
        return;
      } else {
        state.messages.push(action.payload);
      }
    },

    setSpaceIsStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },

    setSpaceStreamingMessage: (state, action: PayloadAction<string>) => {
      state.streamingMessage = action.payload;
    },

    clearSpaceStreamingMessage: (state) => {
      state.streamingMessage = '';
    },

    setSpaceError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    updateSpaceHumanMessageId: (
      state,
      action: PayloadAction<{ tempId: string; realMessage: Message }>,
    ) => {
      const msgIndex = state.messages.findIndex((m) => m.id === action.payload.tempId);
      if (msgIndex !== -1) {
        state.messages[msgIndex] = action.payload.realMessage;
      }
    },

    updateSpaceChatTitle: (state, action: PayloadAction<UpdateTitleData>) => {
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

    resetSpaceChatState: (state) => {
      state.activeChatId = null;
      state.activeChat = null;
      state.messages = [];
      state.isStreaming = false;
      state.streamingMessage = '';
      state.error = null;
    },
  },
});

export const {
  setSpaceChats,
  addSpaceChat,
  deleteSpaceChat,
  setSpaceActiveChatId,
  removeSpaceActiveChatId,
  setSpaceActiveChat,
  setSpaceMessages,
  addSpaceMessage,
  setSpaceIsStreaming,
  setSpaceStreamingMessage,
  clearSpaceStreamingMessage,
  appendSpaceStreamingToken,
  setSpaceError,
  updateSpaceHumanMessageId,
  updateSpaceChatTitle,
  resetSpaceChatState,
} = spaceChatSlice.actions;

export default spaceChatSlice.reducer;
