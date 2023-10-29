import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import feed from './features/feed';
import messages from './features/messages';
import auth from './features/auth'
import materials from './features/materials';
import lessons from './features/lessons';
import transcribe from './features/transcribe';
import videoInfo from './features/videoInfo';
import note from './features/note';

const logger = (storeAPI: any) => (next: any) => (action: any) => {
  console.log(`🔶 Dispatching: ${action.type}`, action)
  let result = next(action)
  console.log('🟢 Next state', storeAPI.getState())
  return result
}

export const store = configureStore({
  reducer: {
    auth: auth,
    feed: feed,
    materials: materials,
    messages: messages,
    lessons: lessons,
    transcribe: transcribe,
    videoInfo: videoInfo,
    note: note,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;