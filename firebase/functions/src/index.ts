import * as functions from "firebase-functions";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const polly = functions.https.onRequest(async (request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  await runPolly(request, response)
})


async function runPolly(request: functions.https.Request, response: functions.Response) {

  const polly = new AWS.Polly({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  if (!request.body.text) {
    return response.json({
      message: 'Please provide text',
    });
  }

  const params = {
    Engine: 'neural',
    Text: request.body.text as string,
    OutputFormat: 'mp3',
    OutputS3BucketName: 'orca-articles',
    VoiceId: 'Joanna',
  };

  try {
    const resp: AWS.Polly.StartSpeechSynthesisTaskOutput = await new Promise((resolve, reject) => {
      polly.startSpeechSynthesisTask(params, function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

    if (!resp) {
      return response.json({
        message: 'Failed to run AWS Polly',
      });
    }

    const filePath = resp.SynthesisTask?.OutputUri;

    return response.json({
      filePath,
    });

  } catch (error) {
    console.error(error);
    return response.json({
      message: 'Error occurred while running AWS Polly',
      error,
    });
  }
}