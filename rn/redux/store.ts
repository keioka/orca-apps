import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import feed from './features/feed';
import message from './features/messages';
import auth from './features/auth'
import material from './features/materials';
import lesson from './features/lessons';
import transcribe from './features/transcribe';
import videoInfo from './features/videoInfo';
import note from './features/note';
import publisher from './features/publishers';

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
    material: material,
    message: message,
    lesson: lesson,
    transcribe: transcribe,
    videoInfo: videoInfo,
    note: note,
    publisher: publisher,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;