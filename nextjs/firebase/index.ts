import admin from 'firebase-admin';
import camelcaseKeys from 'camelcase-keys';

const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_AUTH_URI,
  "token_uri": process.env.FIREBASE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
}


export function init() {
  if (admin.apps.length > 0) return
  return admin.initializeApp({
    // Add your Firebase Admin SDK configuration here
    credential: admin.credential.cert(serviceAccount),
  });
}

init()

export const validateToken = async (req: NextApiRequest, res: NextApiResponse): Promise<{ error: { code: string, message: string } | null }> => {
  // Extract the token from the request headers
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      throw new Error('No token found')
    }

    // Verify the token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const authInfo = camelcaseKeys(decodedToken, { deep: true });
    req.auth = authInfo
    req.fbUid = authInfo.userId
    return { error: null }
  } catch (error) {
    console.error(error)
    let code = "AUTH/ERROR"
    let message = "Invalid Token"
    if (error.code === "auth/id-token-expired") {
      code = "AUTH/TOKEN_EXPIRED"
      message = "Token Expired"
    }
    return { error: { code: code, message: message } }
  }
}

export const validateTokenWithoutError = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return
    }

    // Verify the token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Attach the decoded token to the request for further processing in your route handler
    req.decodedToken = decodedToken;
    req.currentUser = decodedToken.user
    // If the token is valid, proceed with your protected API logic here
    // For example, you can extract the user ID from `decodedToken` and fetch user data
    // from your Firebase Realtime Database or Firestore

  } catch (error) {
    console.error('Error validating Firebase token:', error);
    return res.status(403).json({ error: 'Invalid Token: Unauthorized' });
  }
}