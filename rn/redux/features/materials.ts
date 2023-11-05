import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { uniqBy } from 'lodash';
import axios from 'axios';
import qs from 'qs';
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
  isFetchingSummary: boolean;
  isFetchingVocabs: boolean;
  error: string | null;
  vocabs: { [key: string]: string[] }
  summaries: { [key: string]: string[] }
}

// Define the initial state
const initialState: MaterialsState = {
  items: [],
  page: {
    totalItems: 0,
    currentPage: 0,
    totalPages: 0,
  },
  vocabs: {},
  summaries: {},
  loading: false,
  isFetchingSummary: false,
  isFetchingVocabs: false,
  error: null,
};

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

// Create the materials slice
const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLessonIdToMaterial: (state, action: PayloadAction<{ lessonId: string, materialId: string }>) => {
      const { lessonId, materialId } = action.payload

      state.items = state.items.map((material) => {
        if (material.id === Number(materialId)) {
          material.lessonId = lessonId
        }
        return material
      })
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        const newMaterials = action.payload || [];
        state.items = uniqBy([...state.items, ...newMaterials], 'id');
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVocabs.pending, (state) => {
        state.isFetchingVocabs = true;
      })
      .addCase(fetchVocabs.fulfilled, (state, action) => {
        const { vocabs, materialId } = action.payload
        if (!state.vocabs[materialId]) {
          state.vocabs[materialId] = []
        }

        state.vocabs[materialId] = uniqBy([...state.vocabs[materialId], ...vocabs], 'id')
        state.isFetchingVocabs = false
      })
      .addCase(fetchVocabs.rejected, (state, action) => {
        state.isFetchingVocabs = false
      })
      .addCase(fetchSummaries.pending, (state) => {
        state.isFetchingSummary = true;
      })
      .addCase(fetchSummaries.fulfilled, (state, action) => {
        const { summaries, materialId } = action.payload
        if (!state.summaries[materialId]) {
          state.summaries[materialId] = []
        }
        state.summaries[materialId] = uniqBy([...state.summaries[materialId], ...summaries], 'id')
        state.isFetchingSummary = false
      })
      .addCase(fetchSummaries.rejected, (state, action) => {
        state.isFetchingSummary = false
      })
  },
});

export const { clearError, setLessonIdToMaterial } = materialsSlice.actions;

// Export the reducer
export default materialsSlice.reducer;

// Selectors
export const selectMaterials = (state: RootState) => state.material.items;
export const selectLoading = (state: RootState) => state.material.loading;
export const selectError = (state: RootState) => state.material.error;


interface FetchMaterialsParams {
  category: string,
  date: string,
  offset: number,
  limit: number,
  publisherIds: string[],
}

// Define the fetchMaterials async thunk
export const fetchMaterials = createAsyncThunk<Material[], void>(
  'materials/fetchMaterials',
  async (params: FetchMaterialsParams, { rejectWithValue }) => {
    try {
      console.log({ params })
      const response = await axios(`${ROOT_URL}/api/materials`, {
        params: params,
        paramsSerializer: params => {
          console.log(qs.stringify(params, { arrayFormat: 'repeat' }))
          return qs.stringify(params, { arrayFormat: 'repeat' })
        }
      }); // Replace with your API endpoint

      const data = response.data;

      if (!data || !data.items) {
        return rejectWithValue('Failed to fetch materials')
      }

      return data.items;
    } catch (error) {
      const message = error.message;
      return rejectWithValue(message)
    }
  }
);

interface FetchVocabsParams {
  materialId: string,
  url: string,
}

// Define the fetchMaterials async thunk
export const createVocabs = createAsyncThunk<Material[], void>(
  'materials/createVocabs',
  async (params: FetchVocabsParams, { rejectWithValue }) => {
    try {
      const response = await axios(`${ROOT_URL}/api/vocabs`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          materialId: params.materialId,
          url: params.url,
        })
      }); // Replace with your API endpoint

      const data = response.data;
      return data;
    } catch (error) {
      const message = error.message;
      return rejectWithValue(message)
    }
  }
);


export const fetchVocabs = createAsyncThunk(
  'materials/fetchVocabs',
  async ({ materialId }: FetchCaptionArgs, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ROOT_URL}/api/materials/${materialId}/vocabs`)

      const { vocabs } = response.data;

      return { vocabs, materialId }
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
    }
  }
);

interface FetchSummariesParams {
  materialId: string,
  levels: string[]
}

export const fetchSummaries = createAsyncThunk<Material[], void>(
  'materials/fetchSummaries',
  async ({ materialId, levels }: FetchSummariesParams, { rejectWithValue }) => {
    try {
      const response = await axios(`${ROOT_URL}/api/summary`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          materialId,
          levels
        })
      }); // Replace with your API endpoint

      const data = response.data;

      if (!data) {
        return rejectWithValue('Failed to fetch materials')
      }

      return { summaries: data.summaries, materialId };
    } catch (error) {
      console.error(error)
      const message = error.message;
      return rejectWithValue(message)
    }
  }
);

async function getSummariesByLevel(params: { url: string, levels: string[] }) {
  const { url, levels } = params

  const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/summaryByLevel`,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        levels
      })
    }
  )

  const result = await response.json()

  if (!response.ok) {
    console.log({ result })
    console.error("Error fetching Vocab");
    throw new Error("Error fetching Vocab");
  }

  return { result }
}
