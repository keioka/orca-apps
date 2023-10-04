import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ulid } from 'ulid'
import type { Message } from '~types';

interface Lesson {
  id: string;
  chatHistory: Message[];
  vocabs: Vocab[];
  url: string;
}

// Define the lesson state
interface LessonState {
  lessons: { [key: string]: Lesson };
  loading: boolean;
  creating: boolean;
  createdLessonId: string | null;
  error: string | null;
}

// Define the initial state
const initialState: LessonState = {
  lessons: {},
  loading: false,
  creating: false,
  createdLessonId: null,
  error: null,
};

// Define the lesson slice
const lessonLocalSlice = createSlice({
  name: 'lessonLocal',
  initialState,
  reducers: {
    createNewLesson: (state, action) => {
      const { url } = action.payload;
      if (state.lessons[url]) return;

      state.lessons[url] = {
        id: ulid(),
        chatHistory: [],
        url
      }

    },
    addMessageToLesson: (state, action) => {
      const { url, data: { type, message } } = action.payload;
      if (!state.lessons[url]) {
        console.error('redux[addMessageToLesson]: url is empty and no lesson found');
        return;
      }

      state.lessons[url].chatHistory.push({
        id: ulid(),
        type,
        message
      })
    },
    clearCreatedLessonId: (state) => {
      state.createdLessonId = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },

});

export const { createNewLesson, addMessageToLesson } = lessonLocalSlice.actions;

export default lessonLocalSlice.reducer;