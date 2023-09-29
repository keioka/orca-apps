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
import feed from './features/feed';
import messages from './features/messages';
import auth from './features/auth';
import materials from './features/materials';
import lessons from './features/lessons';
import transcribe from './features/transcribe';
import videoInfo from './features/videoInfo';
import saveData from './features/save';

const rootReducer = combineReducers({
  auth: auth,
  feed: feed,
  materials: materials,
  messages: messages,
  lessons: lessons,
  transcribe: transcribe,
  videoInfo: videoInfo,
  saveData
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

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // serializableCheck: false,
    }),
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
      persistor.resync();
    }
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;