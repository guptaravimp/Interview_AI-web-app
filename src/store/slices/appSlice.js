import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTab: 'interviewee',
  isWelcomeBackModalOpen: false,
  pendingCandidateId: undefined
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    openWelcomeBackModal: (state, action) => {
      state.isWelcomeBackModalOpen = true;
      state.pendingCandidateId = action.payload;
    },
    closeWelcomeBackModal: (state) => {
      state.isWelcomeBackModalOpen = false;
      state.pendingCandidateId = undefined;
    }
  }
});

export const {
  setCurrentTab,
  openWelcomeBackModal,
  closeWelcomeBackModal
} = appSlice.actions;

export default appSlice.reducer;
