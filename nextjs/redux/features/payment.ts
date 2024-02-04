import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import type { Payment } from '~types';

interface PaymentHistoryState {
  subscriptions: Payment[];
  status: string;
  isValidSubscription: boolean;
  isLoading: boolean;
  error: string | null;
  paymentRequiredAlert: string;
}

const initialState: PaymentHistoryState = {
  subscriptions: [],
  isLoading: false,
  error: null,
  isValidSubscription: false,
  status: 'no_subscription',
  paymentRequiredAlert: null,
};

// export const fetchPayments = createAsyncThunk<Payment[], void>(
//   'payment/fetchPayments',
//   async ({ email }, {
//     rejectWithValue
//   }) => {
//     const { result, error } = await sendToBackground({
//       name: "paymentHistory",
//       body: {
//         email
//       }
//     })

//     if (error) {
//       rejectWithValue(error)
//     }

//     console.log({ result })

//     return result;
//   }
// );


export async function fetchPaymentHistory(email: string | null, token: string): { error?: string, result?: string } {
  try {
    const result = await fetch(`/api/stripe/payment`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        email
      })
    });

    const data = await result.json();

    if (!result.ok) {
      console.log({ result })
      console.error("Error fetching payment history");
    }

    return { result: data }
  } catch (error) {
    console.error("There was a problem with the request:", error);
    return { error: error.message };
  }
}

export const fetchPayments = createAsyncThunk<Payment[], void>(
  'payment/fetchPayments',
  async (_, {
    getState,
    rejectWithValue
  }) => {

    const state = getState()
    const token = state.auth.session?.accessToken

    const { result, error } = await fetchPaymentHistory(null, token)

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
  reducers: {
    initState: (state) => {
      console.log("initState")
      state.isLoading = false;
      state.error = null;
      state.subscriptions = [];
      state.status = 'no_subscription';
      state.isValidSubscription = false;

      console.log({ state })
    },
    setPaymentRequiredAlert: (state, action: PayloadAction<boolean>) => {
      state.paymentRequiredAlert = action.payload;
    },
    clearPaymentRequiredAlert: (state) => {
      state.paymentRequiredAlert = null;
    }
  },
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

export const { initState, setPaymentRequiredAlert, clearPaymentRequiredAlert } = paymentHistorySlice.actions;
export default paymentHistorySlice.reducer;