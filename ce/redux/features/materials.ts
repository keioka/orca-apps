import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { uniqBy } from 'lodash';
import axios from 'axios';
import qs from 'qs';
import { sendToBackground } from '@plasmohq/messaging';
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
  searchResult: Material[];
  originalItems: Material[];
  currentOpenedMaterial: Material | null;
  isInitMaterials: boolean;
  isCreatingVocabs: boolean;
  isFetchingMaterials: boolean;
  isFetchingSummary: boolean;
  isFetchingVocabs: boolean;
  error: string | null;
  errorFetchCurrentOpenedMaterial: string | null;
  vocabs: { [key: string]: string[] }
  statusCreatingVocabs: { [key: string]: string }
  summaries: { [key: string]: string[] }
}

// Define the initial state
const initialState: MaterialsState = {
  items: [],
  searchResult: [],
  currentOpenedMaterial: null,
  page: {
    totalItems: 0,
    currentPage: 0,
    totalPages: 0,
  },
  vocabs: {},
  statusCreatingVocabs: {},
  summaries: {},
  isInitMaterials: false,
  isCreatingVocabs: false,
  isFetchingMaterials: false,
  isFetchingSummary: false,
  isFetchingVocabs: false,
  error: null,
  errorFetchCurrentOpenedMaterial: null,
};

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

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
        state.isFetchingMaterials = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        const newMaterials = action.payload || [];
        state.items = uniqBy([...state.items, ...newMaterials], 'id');
        state.isFetchingMaterials = false;
        state.isInitMaterials = true;
        state.error = null;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isFetchingMaterials = false;
        state.isInitMaterials = true;
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

        state.vocabs[materialId] = uniqBy([...vocabs, ...state.vocabs[materialId]], 'id')
        state.statusCreatingVocabs = { ...state.statusCreatingVocabs, [action.payload.materialId]: action.payload.status }
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
        state.summaries[materialId] = uniqBy([...summaries, ...state.summaries[materialId]], 'id')
        state.isFetchingSummary = false
      })
      .addCase(fetchSummaries.rejected, (state, action) => {
        state.isFetchingSummary = false
      })
      .addCase(searchMaterials.pending, (state) => {
        state.isFetchingMaterials = true;
        state.error = null;
      })
      .addCase(searchMaterials.fulfilled, (state, action) => {
        state.isFetchingMaterials = false;
        state.error = null;
        state.items.push(...state.searchResult)
        state.searchResult = action.payload || [];
      })
      .addCase(createVocabs.pending, (state) => {
        state.isCreatingVocabs = true;
      })
      .addCase(createVocabs.fulfilled, (state, action) => {
        console.log("createVocabs", { action })
        state.isCreatingVocabs = false;
        state.statusCreatingVocabs = { ...state.statusCreatingVocabs, [action.meta.arg.materialId]: "IN_PROGRESS" }
      })
      .addCase(createVocabs.rejected, (state) => {
        state.isCreatingVocabs = false;
      })
      .addCase(fetchOriginalMaterials.pending, (state) => {
        state.isFetchingMaterials = false;
        state.error = null;
      })
      .addCase(fetchOriginalMaterials.fulfilled, (state, action) => {
        state.isFetchingMaterials = true;
        state.error = null;
        state.originalItems = action.payload || [];
      })
      .addCase(fetchOriginalMaterials.rejected, (state, action) => {
        state.isFetchingMaterials = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentOpenedMaterial.pending, (state, action) => {
        state.isFetchingMaterial = false;
        state.errorFetchCurrentOpenedMaterial = null;
      })
      .addCase(fetchCurrentOpenedMaterial.fulfilled, (state, action) => {
        state.isFetchingMaterial = false;
        state.currentOpenedMaterial = action.payload || null;
        state.errorFetchCurrentOpenedMaterial = null;
      })
      .addCase(fetchCurrentOpenedMaterial.rejected, (state, action) => {
        state.isFetchingMaterial = false;
        state.errorFetchCurrentOpenedMaterial = action.payload.message as string;
      })
      .addMatcher(
        (action) => {
          return action.type === "global/RESET_STATE"
        },
        (state) => {
          console.log(">>>>>>>> Init materials state >>>>>>>>>")
          state.items = []
          state.searchResult = []
          state.originalItems = []
          state.isFetchingMaterials = false
          state.isFetchingSummary = false
          state.isFetchingVocabs = false
          state.error = null
          state.errorFetchCurrentOpenedMaterial = null
          state.vocabs = {}
          state.summaries = {}
          state.statusCreatingVocabs = {}
        })
  },
});

export const { clearError, setLessonIdToMaterial } = materialsSlice.actions;

// Export the reducer
export default materialsSlice.reducer;

// Selectors
export const selectMaterials = (state: RootState) => state.material.items;
export const selectLoading = (state: RootState) => state.material.isFetchingMaterials;
export const selectError = (state: RootState) => state.material.error;


interface FetchMaterialsParams {
  category: string,
  date: string,
  offset: number,
  limit: number,
  publisherIds: string[],
}

// Define the fetchMaterials async thunk
// Define a cancel token source variable
let cancelTokenSource: CancelTokenSource | null = null;

// ...
export const createMaterial = createAsyncThunk<Material[], void>(
  'materials/createMaterial',
  async (params: FetchMaterialsParams, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${ROOT_URL}/api/materials`, {
        params: params,
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

// Define the fetchMaterials async thunk
export const fetchMaterials = createAsyncThunk<Material[], void>(
  'materials/fetchMaterials',
  async (params: FetchMaterialsParams, { rejectWithValue }) => {
    try {
      // Cancel the previous request if it exists
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Request canceled');
        console.log(">>>>>>>>>>>>>>>>>> cancel >>>>>>>>>>>>>>>>>")
        return rejectWithValue('Request canceled')
      }

      // Create a new cancel token source
      cancelTokenSource = axios.CancelToken.source();

      const response = await axios(`${ROOT_URL}/api/materials`, {
        params: params,
        paramsSerializer: params => {
          console.log(qs.stringify(params, { arrayFormat: 'repeat' }))
          return qs.stringify(params, { arrayFormat: 'repeat' })
        },
        cancelToken: cancelTokenSource.token // Pass the cancel token to the request
      }); // Replace with your API endpoint

      const data = response.data;

      if (!data || !data.items) {
        return rejectWithValue('Failed to fetch materials')
      }

      return data.items;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was canceled, handle accordingly
        console.log('Request canceled:', error.message);
      } else {
        const message = error.message;
        return rejectWithValue(message)
      }
    } finally {
      // Reset the cancel token source
      cancelTokenSource = null;
    }
  }
);

export const fetchCurrentOpenedMaterial = createAsyncThunk<Material[], void>(
  'materials/fetchCurrentOpenedMaterial',
  async (url: string, { rejectWithValue }) => {
    try {

      const response = await sendToBackground({
        name: "api/material/fetchMaterialByUrl",
        body: {
          url
        }
      })

      if (response.error) {
        console.error(response)
        return rejectWithValue(response.error)
      }

      const data = response.data;

      return data.material;
    } catch (error) {
      const message = error.message;
      return rejectWithValue(message)
    }
  }
);

export const fetchOriginalMaterials = createAsyncThunk<Material[], void>(
  'materials/fetchOriginalMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios(`${ROOT_URL}/api/materials/original`); // Replace with your API endpoint

      const data = response.data;

      if (!data || !data.materials) {
        return rejectWithValue('Failed to fetch materials')
      }

      return data.materials;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
    }
  }
);

interface SeachMaterialParams {
  tag: string,
  query: string
}

export const searchMaterials = createAsyncThunk<Material[], void>(
  'materials/searchMaterials',
  async (params: SeachMaterialParams, { rejectWithValue }) => {
    try {
      const response = await axios(`${ROOT_URL}/api/materials/search`, {
        params: params,
      }); // Replace with your API endpoint

      const data = response.data;

      if (!data || !data.materials) {
        return rejectWithValue('Failed to search materials')
      }

      return data.materials;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
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
      // const response = await axios(`${ROOT_URL}/api/vocabs`, {
      //   method: "POST",
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   data: JSON.stringify({
      //     materialId: params.materialId,
      //     url: params.url,
      //   })
      // }); // Replace with your API endpoint

      const response = await sendToBackground({
        name: "api/material/createVocabs",
        body: {
          materialId: params.materialId,
        }
      })

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
  async ({ materialId }: { materialId: string }, { rejectWithValue }) => {
    try {
      const response = await sendToBackground({
        name: "api/material/fetchVocabs",
        body: {
          materialId,
        }
      })

      const { vocabs, material, status } = response.data;

      return { vocabs, materialId, material, status }
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
      const response = await sendToBackground({
        name: "api/material/fetchSummaries",
        body: {
          materialId,
          levels
        }
      })

      if (response.error) {
        return rejectWithValue(response.error)
      }

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
    console.error({ result })
    console.error("Error fetching Vocab");
    throw new Error("Error fetching Vocab");
  }

  return { result }
}
