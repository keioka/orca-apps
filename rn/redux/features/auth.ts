import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { firebase } from "../../firebase"
import axios from "axios";
import { formatThunkError, parseErrorMessageStr } from "../helpers";
import { validateSessionAndToken } from '../helpers';

interface Session {
  accessToken: string
  uid: string
  lastUpdatedAt?: Date
}

interface CurrentUserStats {
  lessonsByDay: Record<string, number>;
  vocabulariesByDay: Record<string, number>;
  paraphrasesByDay: Record<string, number>;
  wordCountByDay: Record<string, number>;
}

interface AuthState {
  session: Session | null
  currentUser: any
  stats: CurrentUserStats | null
  signupLoading: boolean
  singinLoading: boolean
  isOnFeatureFlag: boolean
  isFetchingCurrentUser: boolean
  isFetchingCurrentUserStats: boolean
  errorSignupMessage: string | null,
  errorSigninMessage: string | null,
}

const initialState: AuthState = {
  session: null,
  currentUser: null,
  stats: null,
  signupLoading: false,
  singinLoading: false,
  isOnFeatureFlag: false,
  isFetchingCurrentUser: false,
  isFetchingCurrentUserStats: false,
  errorSignupMessage: null,
  errorSigninMessage: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    init: (state) => {
      state.session = null
      state.currentUser = null
      state.stats = null
      state.signupLoading = false
      state.singinLoading = false
      state.errorSignupMessage = null
      state.errorSigninMessage = null
      state.isFetchingCurrentUserStats = false
      state.isOnFeatureFlag = false
    },
    toggleFeatureFlag: (state) => {
      state.isOnFeatureFlag = !state.isOnFeatureFlag
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      if (!action.payload) {
        state.session = null
        return
      }
      const newSession = {
        ...state.session,
        ...action.payload,
      }

      console.log({
        stateSession: state.session,
        newSession: action.payload
      })

      if (!state.session || !state.session.lastUpdatedAt) {
        newSession.lastUpdatedAt = new Date().toISOString()
      } else if (state.session.accessToken && action.payload.accessToken && state.session.accessToken !== action.payload.accessToken) {
        newSession.lastUpdatedAt = new Date().toISOString()
      }

      state.session = newSession || {}
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signInWithEmail.pending, (state) => {
      state.singinLoading = true;
    });
    builder.addCase(signInWithEmail.fulfilled, (state, action) => {
      state.singinLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(signInWithEmail.rejected, (state, action) => {
      state.singinLoading = false;
      state.errorSigninMessage = parseErrorMessageStr(action);
    });
    builder.addCase(signUpWithEmail.pending, (state) => {
      state.signupLoading = true;
    });
    builder.addCase(signUpWithEmail.fulfilled, (state, action: PayloadAction<Session | null>) => {
      state.signupLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(signUpWithEmail.rejected, (state, action) => {
      state.signupLoading = false;
      state.errorSignupMessage = action.payload.error.message;
    });
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isFetchingCurrentUser = true
    })
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isFetchingCurrentUser = false
      state.currentUser = action.payload
    })
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isFetchingCurrentUser = false
      state.currentUser = null
    });
    builder.addCase(fetchCurrentUserStats.pending, (state) => {
      state.isFetchingCurrentUserStats = true
    })
    builder.addCase(fetchCurrentUserStats.fulfilled, (state, action) => {
      state.isFetchingCurrentUserStats = false
      state.stats = action.payload
    })
    builder.addCase(fetchCurrentUserStats.rejected, (state, action) => {
      state.isFetchingCurrentUserStats = false
      state.stats = null
    });

    builder.addCase(signOut.pending, (state) => { })
    builder.addCase(signOut.fulfilled, (state) => {
      state.session = null
      state.stats = null
      state.currentUser = null
      state.signupLoading = false
      state.singinLoading = false
      state.errorSignupMessage = null
      state.errorSigninMessage = null
      state.isFetchingCurrentUserStats = false
    })
    builder.addCase(signOut.rejected, (state, action) => {

    })

    builder.addMatcher(
      (action) => action.type === "global/RESET_STATE",
      (state) => {
        state.session = null
        state.stats = null
        state.currentUser = null
        state.signupLoading = false
        state.singinLoading = false
        state.errorSignupMessage = null
        state.errorSigninMessage = null
        state.isFetchingCurrentUserStats = false
      });

  },
})

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

export const signUpWithEmail = createAsyncThunk(
  "auth/signUpWithEmail",
  async ({ email, password }: { email: string; password: string }, { dispatch, getState, rejectWithValue }) => {
    const auth = getAuth(firebase)
    let resFb: any

    try {
      resFb = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!resFb || !resFb.user) {
        rejectWithValue(formatThunkError({}, { message: "No user" }))
      }
    } catch (error) {
      console.error(error)
      let message = "Firebase Error"
      if (error.code === 'auth/email-already-in-use') {
        message = 'That email address is already in use!'
      } else if (error.code === 'auth/invalid-email') {
        message = 'That email address is invalid!'
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters'
      }
      return rejectWithValue(formatThunkError(error, { message }))
    }

    try {

      const res = await axios(`${ROOT_URL}/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Cookie': 'orca=' + session?.access_token
          'Authorization': 'Bearer ' + resFb.user?.accessToken
        },
        data: JSON.stringify({
          providerId: resFb.user?.uid,
        })
      })

      dispatch(setSession({
        accessToken: resFb.user?.accessToken,
        uid: resFb.user?.uid,
      }))

      return res.data;
    } catch (error) {
      console.error(error)
      auth.signOut()
      return rejectWithValue(formatThunkError(error))
    }
  }
);

export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const auth = getAuth(firebase)
    try {
      const resFb = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!resFb.user) {
        rejectWithValue(formatThunkError({}, { message: "No user" }))
      }

      const res = await axios(`${ROOT_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Cookie': 'orca=' + session?.access_token
          'Authorization': 'Bearer ' + resFb.user?.accessToken
        },
        data: JSON.stringify({
          providerId: resFb.user?.uid,
        })
      })

      return res.data;
    } catch (error) {
      console.error(error)
      let message = "Firebase Error"
      if (error.code === "auth/invalid-email") {
        message = "Invalid email address format."
      } else if (error.code === "auth/user-not-found") {
        message = "User not found."
      } else if (error.code === "auth/wrong-password") {
        message = "Wrong password or email."
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many requests. Try again later."
      } else if (error.code === "auth/invalid-login-credentials") {
        message = "Invalid login credentials."
      }
      return rejectWithValue(formatThunkError(error, { message }))
    }
  }
);


export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async ({ accessToken }: { accessToken: string }, { rejectWithValue }) => {
    try {

      const res = await axios(`${ROOT_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Cookie': 'orca=' + session?.access_token
          'Authorization': 'Bearer ' + accessToken
        }
      })

      return res.data;
    } catch (error) {
      console.error(error)
      return rejectWithValue(formatThunkError(error))
    }
  }
);


export const signUpWithGoogle = createAsyncThunk(
  "auth/signUpWithGoogle",
  async (_, { getState, rejectWithValue }) => {
    try {
      const auth = getAuth(firebase)
      const resFb = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!resFb.user) {
        rejectWithValue("No user")
      }

      const res = await axios(`${ROOT_URL}/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Cookie': 'orca=' + session?.access_token
          'Authorization': 'Bearer ' + resFb.user?.accessToken
        }
      })

      return res.data;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
);


export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const auth = getAuth(firebase)
      await firebaseSignOut(auth);
    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { dispatch, rejectWithValue }) => {
    const auth = getAuth(firebase)

    const idToken = await auth.currentUser.getIdToken(true)

    dispatch(setSession({
      accessToken: idToken,
      uid: auth.currentUser.uid,
    }))
  }
)

export const fetchCurrentUserStats = createAsyncThunk(
  "auth/fetchCurrentUserStats",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.get(`${ROOT_URL}/api/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); // Replace with your API endpoint

      const data = response.data;
      return data;
    } catch (error) {
      console.error(error)
      return rejectWithValue('Failed to fetch lesson');
    }
  }
)

export const setMpTrackingId = createAsyncThunk(
  "auth/setMpTrackingId",
  async ({ mpTrackingId }: { mpTrackingId: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.post(
        `${ROOT_URL}/api/users/setMpTrackingId`, {
        mpTrackingId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); // Replace with your API endpoint

      const data = response.data;
      return data;
    } catch (error) {
      console.error(error)
      return rejectWithValue('Failed to fetch lesson');
    }
  }
)

export const { setSession, toggleFeatureFlag } = authSlice.actions

export default authSlice.reducer

