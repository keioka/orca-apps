import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import axios from 'axios';
// Define the type for the material
interface Material {
  id: number;
  name: string;
  type: string;
  category: string;
  url: string;
  publishedAt: string;
}

// Define the type for the state
interface MaterialsState {
  items: Material[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: MaterialsState = {
  items: [],
  loading: false,
  error: null,
};

const ROOT_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://orca-fullstack.vercel.app"  // process.env.EXPO_PUBLIC_API_ROOT


// Define the fetchMaterials async thunk
export const fetchMaterials = createAsyncThunk<Material[], void>(
  'materials/fetchMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios(`${ROOT_URL}/api/materials`); // Replace with your API endpoint
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      const message = error.response.data.message;
      return rejectWithValue(message)
    }
  }
);

// Create the materials slice
const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = materialsSlice.actions;

// Export the reducer
export default materialsSlice.reducer;

// Selectors
export const selectMaterials = (state: RootState) => state.materials.items;
export const selectLoading = (state: RootState) => state.materials.loading;
export const selectError = (state: RootState) => state.materials.error;