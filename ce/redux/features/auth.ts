import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { app as firebase, auth } from "../../firebase"
import axios from "axios";
import { sendToBackground } from "@plasmohq/messaging";
import { validateSessionAndToken } from '../helpers';

interface Session {
  accessToken: string
  uid: string
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
  loadingCurrentUser: boolean
  stats: CurrentUserStats | null
  isFetchingCurrentUserStats: boolean
  loadingSignup: boolean
  loadingLogin: boolean
  error: string | null
  errorSignupMessage: string | null,
  errorSigninMessage: string | null,
}

const initialState: AuthState = {
  session: null,
  currentUser: null,
  stats: null,
  isFetchingCurrentUserStats: false,
  loadingCurrentUser: false,
  loadingSignup: false,
  loadingLogin: false,
  error: null,
  errorSignupMessage: null,
  errorSigninMessage: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.errorSignupMessage = null;
      state.errorSigninMessage = null;
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload
    },
    setCurrentUser: (state, action: PayloadAction<any | null>) => {
      state.currentUser = action.payload
    },
    initState: (state) => {
      state.session = null
      state.currentUser = null
      state.loadingCurrentUser = false
      state.loadingSignup = false
      state.loadingLogin = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.pending, (state, action) => {
      state.loadingCurrentUser = true;
      state.currentUser = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.loadingCurrentUser = false;
      state.currentUser = action.payload;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loadingCurrentUser = false;
      state.error = action.error.message;
      state.currentUser = null;
    });
    builder.addCase(login.pending, (state, action) => {
      state.errorSignupMessage = null
      state.errorSigninMessage = null
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.errorSigninMessage = null
      state.currentUser = action.payload;
    })
    builder.addCase(login.rejected, (state, action) => {
      let errorMessage = action.payload.message;
      if (action.payload.code === "NO_USER") {
        errorMessage = "No user found. Please sign up."
      }

      state.errorSigninMessage = errorMessage;
    })
    builder.addCase(signup.pending, (state) => {
      state.errorSignupMessage = null
      state.errorSigninMessage = null
      state.loadingSignup = true;
    })
    builder.addCase(signup.fulfilled, (state, action) => {
      state.loadingSignup = false;
      state.currentUser = action.payload;
    })
    builder.addCase(signup.rejected, (state, action) => {
      state.loadingSignup = false;
      let errorMessage = action.payload.message;
      if (action.payload.code === "ALREADY_EXISTS") {
        errorMessage = "User already exists. Please sign in."
      }
      state.errorSignupMessage = errorMessage
      state.currentUser = null;
    })

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

    builder.addCase("global/RESET_STATE", (state, action) => {
      state.currentUser = null
      state.session = null
      state.error = null
      state.loadingCurrentUser = false
      state.loadingLogin = false
      state.loadingSignup = false
      state.isFetchingCurrentUserStats = false
      state.errorSignupMessage = null
      state.errorSigninMessage = null
      state.stats = null

    })
  },
})

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

export const login = createAsyncThunk(
  "auth/login",
  async ({ accessToken, uid }: { accessToken: string, uid: string }, { dispatch, getState, rejectWithValue }) => {
    try {

      if (!accessToken || !uid) {
        return rejectWithValue({ message: "No access token or uid" })
      }

      const res = await sendToBackground({
        name: 'api/auth/login',
        body: {
          token: accessToken,
          uid: uid,
        }
      })

      if (res.error) {
        return rejectWithValue(res.error)
      }

      dispatch(setSession({
        accessToken,
        uid
      }))

      return res.data

    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
)

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ accessToken, uid }: { accessToken: string, uid: string }, { dispatch, getState, rejectWithValue }) => {
    try {

      const res = await sendToBackground({
        name: 'api/auth/signup',
        body: {
          token: accessToken,
          uid: uid,
        }
      })

      if (res.error) {
        return rejectWithValue(res.error)
      }

      dispatch(setSession({
        accessToken,
        uid
      }))

      return res.data

    } catch (error) {
      console.error(error)
      return rejectWithValue(error)
    }
  }
)



export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState()
    const currentUser = state.auth.currentUser
    if (currentUser) {
      await auth.signOut()
      dispatch(initState())
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {

    try {
      const state = getState()

      if (!state.auth.session) {
        return rejectWithValue('fetchCurrentUser: No session')
      }


      const res = await sendToBackground({
        name: 'api/auth/fetchCurrentUser',
        body: {
          token: state.auth.session?.accessToken,
          uid: state.session?.uid,
        }
      })

      if (res.error) {
        return rejectWithValue(res.error)
      }

      return res.data;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
    }
  }
)


export const fetchCurrentUserStats = createAsyncThunk(
  "auth/fetchCurrentUserStats",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await sendToBackground({
        name: 'api/auth/fetchCurrentUserStats',
        body: {
          token,
        }
      })

      if (response.error) {
        return rejectWithValue(response.error)
      }

      const data = response.data;
      return data;
    } catch (error) {
      console.error(error)
      return rejectWithValue('Failed to fetch lesson');
    }
  }
)

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { dispatch, getState, rejectWithValue }) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setSession({
          accessToken: user.accessToken,
          uid: user.uid
        }))

        dispatch(fetchCurrentUser())
      } else {
        dispatch(initState())
      }
    })
  }
)


export const setMpTrackingId = createAsyncThunk(
  "auth/setMpTrackingId",
  async ({ mpTrackingId }: { mpTrackingId: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await sendToBackground({
        name: 'api/auth/setMpTrackingId',
        body: {
          token,
          mpTrackingId
        }
      })

      const data = response.data;
      return data;
    } catch (error) {
      console.error(error)
      return rejectWithValue('Failed to fetch lesson');
    }
  }
)

// export const loginWithEmail = createAsyncThunk(
//   "auth/loginWithEmail",
//   async ({ email, password }: { email: string; password: string }, { getState, rejectWithValue }) => {
//     try {
//       const auth = getAuth(firebase)
//       const resFb = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password,
//       );

//       if (!resFb.user) {
//         rejectWithValue("No user")
//       }

//       const res = await axios(`${ROOT_URL}/api/users/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // 'Cookie': 'orca=' + session?.access_token
//           'Authorization': 'Bearer ' + resFb.user?.accessToken
//         },
//         data: JSON.stringify({
//           providerId: resFb.user?.uid,
//         })
//       })

//       return res.data;
//     } catch (error) {
//       console.error(error)
//       return rejectWithValue(error)
//     }
//   }
// );


// export const signInWithEmail = createAsyncThunk(
//   "auth/signInWithEmail",
//   async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
//     const auth = getAuth(firebase)
//     const { error } = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password,
//     );

//     if (error) {
//       console.error(error)
//       return rejectWithValue(error)
//     }
//   }
// );

// export const signOut = createAsyncThunk(
//   "auth/signOut",
//   async (_, { rejectWithValue }) => {
//     try {
//       const auth = getAuth(firebase)
//       await firebaseSignOut(auth);
//     } catch (error) {
//       console.error(error)
//       return rejectWithValue(error)
//     }
//   }
// );

export const { setSession, setCurrentUser, initState, clearError } = authSlice.actions

export default authSlice.reducer