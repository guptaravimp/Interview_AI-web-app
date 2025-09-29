import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  interviews: {}
};

const interviewSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    startInterview: (state, action) => {
      state.interviews[action.payload.candidateId] = action.payload;
    },
    updateInterview: (state, action) => {
      const { candidateId, ...updates } = action.payload;
      if (state.interviews[candidateId]) {
        state.interviews[candidateId] = { ...state.interviews[candidateId], ...updates };
      }
    },
    addAnswer: (state, action) => {
      const { candidateId, answer } = action.payload;
      if (state.interviews[candidateId]) {
        state.interviews[candidateId].answers.push(answer);
      }
    },
    updateAnswer: (state, action) => {
      const { candidateId, questionId, score } = action.payload;
      if (state.interviews[candidateId]) {
        const answerIndex = state.interviews[candidateId].answers.findIndex(a => a.questionId === questionId);
        if (answerIndex !== -1) {
          state.interviews[candidateId].answers[answerIndex].score = score;
        }
      }
    },
    pauseInterview: (state, action) => {
      const candidateId = action.payload;
      if (state.interviews[candidateId]) {
        state.interviews[candidateId].isPaused = true;
      }
    },
    resumeInterview: (state, action) => {
      const candidateId = action.payload;
      if (state.interviews[candidateId]) {
        state.interviews[candidateId].isPaused = false;
      }
    },
    completeInterview: (state, action) => {
      const candidateId = action.payload;
      if (state.interviews[candidateId]) {
        state.interviews[candidateId].endTime = new Date().toISOString();
      }
    },
    deleteInterview: (state, action) => {
      delete state.interviews[action.payload];
    }
  }
});

export const {
  startInterview,
  updateInterview,
  addAnswer,
  updateAnswer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  deleteInterview
} = interviewSlice.actions;

export default interviewSlice.reducer;
