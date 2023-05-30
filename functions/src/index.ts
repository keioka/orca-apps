import * as functions from "firebase-functions";
import * as chatHandlers from "./handlers/chat";
// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const ping = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});


export const chat = functions.https.onRequest(chatHandlers.chat);
