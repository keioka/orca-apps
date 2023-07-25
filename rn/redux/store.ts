import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import feed from './features/feed';
import messages from './features/messages';
import auth from './features/auth'
import materials from './features/materials';
import lessons from './features/lessons';

const logger = (storeAPI: any) => (next: any) => (action: any) => {
  console.log(`dispatching: ${action.type}`, action)
  let result = next(action)
  console.log('next state', storeAPI.getState())
  return result
}

export const store = configureStore({
  reducer: {
    auth: auth,
    feed: feed,
    materials: materials,
    messages: messages,
    lessons: lessons,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;