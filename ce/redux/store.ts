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
import message from './features/messages';
import auth from './features/auth';
import materials from './features/materials';
import lessons from './features/lessons';
import payment from './features/payment';
import ui from './features/ui';
import note from './features/note';

// import * as Sentry from "@sentry/react";

const rootReducer = combineReducers({
  auth: auth,
  publisher: publisher,
  materials: materials,
  message: message,
  lesson: lessons,
  payment,
  ui,
  note
})

export const persistConfig = {
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
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // serializableCheck: false,
    })

    if (process.env.NODE_ENV !== 'production') {
      middlewares.push(logger)
    }

    return middlewares
  }

});

export const persistor = persistStore(store);

export const storage = new Storage({
  area: "session",
})

export const clearState = () => store.dispatch(persistor.purge);
export const removeAll = () => storage.clear()

storage.watch({
  [`persist:${persistConfig.key}`]: async (change, area) => {
    const { oldValue, newValue } = change;
    const updatedKeys = [];

    if (newValue === null) {
      await persistor.pause();
      await persistor.flush()
      await persistor.purge();
      store.dispatch({ type: "global/RESET_STATE" });
    } else {
      persistor.resync()
    }


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
      persistor.resync()

    }
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;