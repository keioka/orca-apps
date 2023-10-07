import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Payment } from '~types';
import { sendToBackground } from '@plasmohq/messaging';

interface PaymentHistoryState {
  subscriptions: Payment[];
  status: string;
  isValidSubscription: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentHistoryState = {
  subscriptions: [],
  isLoading: false,
  error: null,
  isValidSubscription: false,
  status: 'no_subscription'
};

export const fetchPayments = createAsyncThunk<Payment[], void>(
  'payment/fetchPayments',
  async ({ email }, {
    rejectWithValue
  }) => {
    const { result, error } = await sendToBackground({
      name: "paymentHistory",
      body: {
        email
      }
    })

    if (error) {
      rejectWithValue(error)
    }

    console.log({ result })

    return result;
  }
);

const paymentHistorySlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        console.log({ action })
        state.isLoading = false
        state.subscriptions = action.payload.subscriptions;
        state.status = action.payload.status;
        state.isValidSubscription = action.payload.isValidSubscription;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message;
      });
  }
});

export default paymentHistorySlice.reducer;