import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import candidateReducer from './slices/candidateSlice.js';
import interviewReducer from './slices/interviewSlice.js';
import chatReducer from './slices/chatSlice.js';
import appReducer from './slices/appSlice.js';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['candidates', 'interviews', 'chat', 'app']
};

const rootReducer = combineReducers({
  candidates: candidateReducer,
  interviews: interviewReducer,
  chat: chatReducer,
  app: appReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['_persist']
      }
    })
});

export const persistor = persistStore(store);
