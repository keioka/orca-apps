import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    disabled: false,
    shouldShowSubscriptionForm: true,
  },
  reducers: {
    toggleDisable: (state) => {
      state.disabled = !state.disabled;
    },
    toggleSubscriptionForm: (state) => {
      state.shouldShowSubscriptionForm = !state.shouldShowSubscriptionForm;
    },
    clearSubscriptionForm: (state) => {
      state.shouldShowSubscriptionForm = false;
    }
  }
});

export const { toggleDisable, toggleSubscriptionForm, clearSubscriptionForm } = uiSlice.actions;

export default uiSlice.reducer;