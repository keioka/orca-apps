import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { Lesson } from "../../types/lesson";
import axios from 'axios';
import { sendToBackground } from '@plasmohq/messaging';
import { validateSessionAndToken } from '../helpers';
import { uniqBy } from 'lodash';
// Define the lesson state
interface LessonState {
  lessons: Lesson[];
  loading: boolean;
  creating: boolean;
  sampleResponses: {
    sentence: string,
    jaSentence: string
  }[];
  createdLessonId: string | null;
  loadingSampleResponses: boolean;
  error: string | null;
}

// Define the initial state
const initialState: LessonState = {
  lessons: [],
  loading: false,
  creating: false,
  sampleResponses: [],
  loadingSampleResponses: false,
  createdLessonId: null,
  error: null,
};

// Define the lesson slice
const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    clearCreatedLessonId: (state) => {
      state.createdLessonId = null;
    },
    clearSampleResponses: (state) => {
      state.loadingSampleResponses = false;
      state.sampleResponses = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Define the async thunk to fetch the lesson
    builder.addCase(fetchLessons.fulfilled, (state, action) => {
      state.lessons = action.payload;
      state.loading = false;
      state.error = null;
    });

    builder.addCase(fetchLessons.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchLessons.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch lesson';
    });

    // Define the async thunk to fetch the lesson
    builder.addCase(fetchLesson.fulfilled, (state, action) => {
      const updatedLesson = action.payload;
      console.log({ a: action.payload })
      const index = state.lessons.findIndex((lesson) => lesson.id === updatedLesson.id);
      if (index !== -1) {
        state.lessons[index] = updatedLesson;
      } else {
        state.lessons.push(updatedLesson);
      }

      state.loading = false;
      state.error = null;
    });

    builder.addCase(fetchLesson.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchLesson.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch lesson';
    });

    builder.addCase(createLesson.pending, (state) => {
      state.creating = true;
      state.error = null;
    });

    builder.addCase(createLesson.fulfilled, (state, action) => {
      state.lessons = uniqBy([...state.lessons, action.payload], 'id');
      state.createdLessonId = action.payload.id;
      state.creating = false;
      state.error = null;
    });

    builder.addCase(fetchOrCreateLessonByMaterialId.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    builder.addCase(fetchOrCreateLessonByMaterialId.fulfilled, (state, action) => {
      console.log({ lesson: action.payload })
      state.lessons = uniqBy([...state.lessons, action.payload], 'id');
      state.loading = false;
      state.error = null;
    })

    builder.addCase(fetchOrCreateLessonByMaterialId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch lesson';
    });

    builder.addCase(createLesson.rejected, (state, action) => {
      state.creating = false;
      state.error = action.error.message || 'Failed to fetch lesson';
    });

    builder.addCase(fetchSampleResponses.pending, (state, action) => {
      state.sampleResponses = [];
      state.loadingSampleResponses = true;
      state.error = null;
    })

    builder.addCase(fetchSampleResponses.fulfilled, (state, action) => {
      state.sampleResponses = action.payload.samples;
      state.loadingSampleResponses = false;
      state.error = null;
    })

    builder.addCase(fetchSampleResponses.rejected, (state, action) => {
      state.loadingSampleResponses = false;
      state.error = action.error.message || 'Failed to fetch sample responses';
    })

    builder.addCase("global/RESET_STATE", (state, action) => {
      state.lessons = [];
      state.loading = false;
      state.creating = false;
      state.createdLessonId = null;
      state.sampleResponses = [];
      state.loadingSampleResponses = false;
      state.error = null;
    })
  },
});

export const { clearCreatedLessonId } = lessonSlice.actions;

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

export const fetchOrCreateLessonByMaterialId = createAsyncThunk(
  'lesson/fetchOrCreateLessonByMaterialId',
  async (materialId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      if (!token) {
        return rejectWithValue('No session found')
      }

      const response = await sendToBackground({
        name: 'api/material/lesson',
        body: {
          materialId,
          token
        }
      })

      if (!response || !response.data) {
        return rejectWithValue('Failed to fetch lesson');
      }

      const data = response.data;

      return data;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchLesson = createAsyncThunk(
  'lesson/fetchLesson',
  async (lessonId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState()
      const { session } = auth
      if (!session) {
        return rejectWithValue('No session found')
      }

      const token = session?.accessToken
      if (!token) {
        return rejectWithValue('No session found')
      }

      const response = await axios.get(`${ROOT_URL}/api/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      // data is the server's response
      const data = response.data;

      return data;

    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Define the async thunk to fetch the lesson
export const fetchLessons = createAsyncThunk<Lesson>('lesson/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState()
    const { session } = auth
    if (!session) {
      rejectWithValue('No session found')
    }

    const token = session?.accessToken
    if (!token) {
      return rejectWithValue('No session found')
    }

    const response = await sendToBackground({
      name: 'api/lessons/fetchLessons',
      body: {
        token
      }
    })

    if (response.error) {
      return rejectWithValue(response.error);
    }

    return response.data;
  } catch (error) {
    console.error(error)
    return rejectWithValue(error);
  }
});


export const fetchSampleResponses = createAsyncThunk(
  'lesson/fetchSampleResponses',
  async (lessonId: string, { getState, rejectWithValue, dispatch }) => {
    const state = getState()
    const token = await validateSessionAndToken(state, dispatch)

    try {

      const response = await sendToBackground({
        name: 'api/lessons/fetchSampleResponses',
        body: {
          token,
          lessonId,
        }
      })


      if (response.error) {
        return rejectWithValue(response.error);
      }
      // data is the server's response

      return response.data

    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response.data.message);
    }
  }
);



// Define the async thunk to fetch the lesson
export const createLesson = createAsyncThunk<Lesson[]>('lesson/create', async ({ materialId, url }, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState()
    const { session } = auth
    if (!session) {
      return rejectWithValue('No session found')
    }

    const token = session?.accessToken
    if (!token) {
      return rejectWithValue('No session found')
    }

    const response = await createLessonAPI({ materialId, url, token });

    const { data } = response;

    dispatch(setLessonIdToMaterial({ materialId, lessonId: data.id }))
    return data;
  } catch (error) {
    console.error(error)
    return rejectWithValue(error);
  }
});

async function createLessonAPI({ materialId, url, token }: { materialId: string, url, token: string }) {
  return await sendToBackground({
    name: 'api/lessons',
    body: {
      materialId,
      url,
      token
    }
  })
}

export const { clearError, clearSampleResponses } = lessonSlice.actions;

export default lessonSlice.reducer;