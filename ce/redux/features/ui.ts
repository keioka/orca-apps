import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    disabled: false
  },
  reducers: {
    toggleDisable: (state) => {
      state.disabled = !state.disabled;
    }
  }
});

export const { toggleDisable } = uiSlice.actions;

export default uiSlice.reducer;