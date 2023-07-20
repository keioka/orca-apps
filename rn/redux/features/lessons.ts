import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Lesson } from "../../types/lesson";

// Define the lesson state
interface LessonState {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: LessonState = {
  lessons: [],
  loading: false,
  error: null,
};

// Define the lesson slice
const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {},
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
      const index = state.lessons.findIndex((lesson) => lesson.id === updatedLesson.id);

      console.log({ updatedLesson })
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
  },
});

const ROOT_URL = 'http://localhost:3000';


export const fetchLesson = createAsyncThunk(
  'lesson/fetchLesson',
  async (lessonId: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const { session } = auth
      if (!session) {
        throw new Error('No session found')
      }

      const token = session?.access_token
      if (!token) {
        throw new Error('No session found')
      }

      const response = await fetch(`${ROOT_URL}/api/lessons/${lessonId}`, {
        headers: {
          Cookie: `orca=${token}`
        }
      }); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch lesson');
    }
  }
);

// Define the async thunk to fetch the lesson
export const fetchLessons = createAsyncThunk<Lesson[]>('lesson/fetch', async (args, thunkAPI) => {
  try {
    const { getState } = thunkAPI
    const { auth } = getState()
    const { session } = auth
    if (!session) {
      throw new Error('No session found')
    }

    const token = session?.access_token
    if (!token) {
      throw new Error('No session found')
    }

    const response = await fetch(`${ROOT_URL}/api/lessons`, {
      headers: {
        Cookie: `orca=${token}`
      }
    }); // Replace with your API endpoint

    console.log({ response })
    if (!response.ok) {
      throw new Error('Failed to fetch lesson');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch lesson');
  }
});

export default lessonSlice.reducer;