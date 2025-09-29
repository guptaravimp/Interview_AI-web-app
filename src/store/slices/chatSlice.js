import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chatSessions: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    initializeChat: (state, action) => {
      const candidateId = action.payload;
      if (!state.chatSessions[candidateId]) {
        state.chatSessions[candidateId] = {
          candidateId,
          messages: [],
          isWaitingForField: undefined
        };
      }
    },
    addMessage: (state, action) => {
      const { candidateId, message } = action.payload;
      if (state.chatSessions[candidateId]) {
        state.chatSessions[candidateId].messages.push(message);
      }
    },
    setWaitingForField: (state, action) => {
      const { candidateId, field } = action.payload;
      if (state.chatSessions[candidateId]) {
        state.chatSessions[candidateId].isWaitingForField = field;
      }
    },
    clearChat: (state, action) => {
      const candidateId = action.payload;
      if (state.chatSessions[candidateId]) {
        state.chatSessions[candidateId].messages = [];
        state.chatSessions[candidateId].isWaitingForField = undefined;
      }
    },
    updateMessage: (state, action) => {
      const { candidateId, messageId, updates } = action.payload;
      if (state.chatSessions[candidateId]) {
        const messageIndex = state.chatSessions[candidateId].messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          state.chatSessions[candidateId].messages[messageIndex] = {
            ...state.chatSessions[candidateId].messages[messageIndex],
            ...updates
          };
        }
      }
    }
  }
});

export const {
  initializeChat,
  addMessage,
  setWaitingForField,
  clearChat,
  updateMessage
} = chatSlice.actions;

export default chatSlice.reducer;
