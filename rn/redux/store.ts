import { configureStore } from '@reduxjs/toolkit';
import feed from './features/feed';
import messages from './features/messages';
import auth from './features/auth'
import materials from './features/materials';
import lessons from './features/lessons';

export const store = configureStore({
  reducer: {
    auth: auth,
    feed: feed,
    materials: materials,
    message: messages,
    lessons: lessons,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;