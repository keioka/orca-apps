import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import message from './features/messages';
import auth from './features/auth'
import material from './features/materials';
import lesson from './features/lessons';
import transcribe from './features/transcribe';
import videoInfo from './features/videoInfo';
import note from './features/note';
import publisher from './features/publishers';
import featureFlag from './features/featureFlag';

import * as Sentry from "@sentry/react";

const logger = (storeAPI: any) => (next: any) => (action: any) => {
  if (process.env.NODE_ENV === 'production') {
    const state = storeAPI.getState()
    if (action.type.includes('rejected')) {
      Sentry.configureScope(function (scope) {
        const userId = state.auth.currentUser?.id
        console.log({ userId })
        scope.setUser({
          userId,
        });
        scope.setExtra("action", action);
      });
      Sentry.captureMessage(`[Redux Action]: ${action.type}`, "error")
    }
    return next(action)
  }

  console.log(`🔶 Dispatching: ${action.type}`, action)
  let result = next(action)
  console.log('🟢 Next state', storeAPI.getState())
  return result
}

export const store = configureStore({
  reducer: {
    auth: auth,
    material: material,
    message: message,
    lesson: lesson,
    transcribe: transcribe,
    videoInfo: videoInfo,
    note: note,
    publisher: publisher,
    featureFlag: featureFlag,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  enhancers: [Sentry.createReduxEnhancer({})],
});

function initAppState() {
  store.dispatch({ type: 'auth/init' });
  store.dispatch({ type: 'material/init' });
  store.dispatch({ type: 'message/init' });
  store.dispatch({ type: 'lesson/init' });
  store.dispatch({ type: 'transcribe/init' });
  store.dispatch({ type: 'videoInfo/init' });
  store.dispatch({ type: 'note/init' });
  store.dispatch({ type: 'publisher/init' });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;