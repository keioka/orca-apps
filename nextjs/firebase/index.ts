import admin from 'firebase-admin';


const serviceAccount = process.env.NODE_ENV === "production" ? {
  "type": "service_account",
  "project_id": "orca-app-prod",
  "private_key_id": "REDACTED_PRIVATE_KEY_ID",
  "private_key": "REDACTED_PRIVATE_KEY",
  "client_email": "firebase-adminsdk-1znz1@orca-app-prod.iam.gserviceaccount.com",
  "client_id": "109675224456330449053",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1znz1%40orca-app-prod.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
} : {
  "type": "service_account",
  "project_id": "orca-app-stg",
  "private_key_id": "REDACTED_PRIVATE_KEY_ID",
  "private_key": "REDACTED_PRIVATE_KEY",
  "client_email": "firebase-adminsdk-oxopy@orca-app-stg.iam.gserviceaccount.com",
  "client_id": "117964680977205155062",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-oxopy%40orca-app-stg.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}


export function init() {
  if (admin.apps.length > 0) return

  return admin.initializeApp({
    // Add your Firebase Admin SDK configuration here
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com', // Your Firebase Realtime Database URL
  });
}

init()

export const validateToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'validateToken: No token provided' });
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

export const setCustomUserClaims = async (userUid: string, values: { [attributeName: string]: any }) => {
  try {
    await admin.auth().setCustomUserClaims(userUid, values);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}