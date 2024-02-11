import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from "@plasmohq/redux-persist";
import { localStorage } from "redux-persist-webextension-storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "@plasmohq/redux-persist";
import { Storage } from "@plasmohq/storage";
import publisher from './features/publisher';
import messages from './features/messages';
import auth from './features/auth';
import materials from './features/materials';
import lessons from './features/lessons';
import transcribe from './features/transcribe';
import videoInfo from './features/videoInfo';
import saveData from './features/save';
import lessonsLocal from './features/lessonsLocal';
import payment from './features/payment';
import ui from './features/ui';

// import * as Sentry from "@sentry/react";

const rootReducer = combineReducers({
  auth: auth,
  publisher: publisher,
  materials: materials,
  messages: messages,
  lessons: lessons,
  transcribe: transcribe,
  videoInfo: videoInfo,
  saveData,
  lessonsLocal,
  payment,
  ui
})

const persistConfig = {
  key: "orca-storage",
  storage: localStorage,
  debug: true,
  writeFailHandler: (...err) => {
    console.error("Error writing to storage", err);
  }
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const logger = (storeAPI: any) => (next: any) => (action: any) => {
  console.log(`🔶[Redux]:Dispatching: ${action.type}`, action)
  let result = next(action)
  console.log('🔶[Redux]:Next state', storeAPI.getState())
  return result
}


// const sentryReduxEnhancer = Sentry.createReduxEnhancer({
//   attachReduxState: false,
// });

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // serializableCheck: false,
    })
      .concat(logger),
});

export const persistor = persistStore(store);

const storage = new Storage({
  area: "local",
})

storage.watch({
  [`persist:${persistConfig.key}`]: (change) => {
    console.log({ change })
    const { oldValue, newValue } = change;
    const updatedKeys = [];
    for (const key in oldValue) {
      if (oldValue[key] !== newValue?.[key]) {
        updatedKeys.push(key);
      }
    }
    for (const key in newValue) {
      if (oldValue?.[key] !== newValue[key]) {
        updatedKeys.push(key);
      }
    }
    if (updatedKeys.length > 0) {
      // persistor.resync();
    }
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;