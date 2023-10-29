const SESSION_NOT_DEFINED_ERROR = 'Session is not defined';
const NO_SESSION_FOUND_ERROR = 'No session found';

export const validateSessionAndToken = (state: any) => {
  if (!state.auth.session) {
    throw new Error(SESSION_NOT_DEFINED_ERROR);
  }
  const token = state.auth.session.accessToken;
  if (!token) {
    throw new Error(NO_SESSION_FOUND_ERROR);
  }
  return token;
};