import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  candidates: [],
  currentCandidateId: undefined
};

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload };
      }
    },
    setCurrentCandidate: (state, action) => {
      state.currentCandidateId = action.payload;
    },
    deleteCandidate: (state, action) => {
      state.candidates = state.candidates.filter(c => c.id !== action.payload);
      if (state.currentCandidateId === action.payload) {
        state.currentCandidateId = undefined;
      }
    },
    clearCandidates: (state) => {
      state.candidates = [];
      state.currentCandidateId = undefined;
    }
  }
});

export const {
  addCandidate,
  updateCandidate,
  setCurrentCandidate,
  deleteCandidate,
  clearCandidates
} = candidateSlice.actions;

export default candidateSlice.reducer;
