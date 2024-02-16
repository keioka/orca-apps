import { getAuth } from "firebase/auth";
import { firebase } from "../firebase/client"
import moment from "moment";
import { setSession } from "./features/auth";
import { type ThunkDispatch, type AnyAction } from "@reduxjs/toolkit";

const SESSION_NOT_DEFINED_ERROR = 'Session is not defined';
const NO_SESSION_FOUND_ERROR = 'No session found';

export const validateSessionAndToken = async (state: any, dispatch: ThunkDispatch<unknown, unknown, AnyAction>): Promise<string | undefined> => {
  if (!state.auth.session) {
    throw new Error(SESSION_NOT_DEFINED_ERROR);
  }
  const hasPastedOneHour = moment().diff(moment(state.auth?.lastUpdatedAt), 'hours') > 1

  if (hasPastedOneHour) {
    console.warn("token is expired", state.auth?.lastUpdatedAt)
    const auth = getAuth(firebase);
    const token = await auth.currentUser?.getIdToken();
    dispatch(setSession({
      accessToken: token,
      uid: state.auth.session.uid,
    }))
    return token;
  }

  const token = state.auth.session.accessToken;
  if (!token) {
    throw new Error(NO_SESSION_FOUND_ERROR);
  }

  return token;
};


export function formatThunkError(error: any, override: any = {}) {
  return {
    error: {
      message: override.message || error.message,
      code: override.code || error.code,
      name: override.name || error.name,
      stack: error.stack,
    }
  }
}

export function parseErrorMessageStr(rejectAction: { payload: { error: { message: string } } }) {
  return rejectAction.payload.error.message
}