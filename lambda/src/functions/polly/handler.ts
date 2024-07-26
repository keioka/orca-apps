import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import * as AWS from 'aws-sdk';


const polly: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  // Credentials come from the Lambda execution role by default; the env vars are
  // only a fallback for local invocation.
  const polly = new AWS.Polly({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  if (!event.body.text) {
    return formatJSONResponse({
      message: 'Please provide text',
    });
  }

  const voiceId = event.body.type === "female" ? "Ruth" : "Stephen"

  const params = {
    Engine: 'neural',
    Text: event.body.text as string,
    OutputFormat: 'mp3',
    OutputS3BucketName: 'orca-articles',
    OutputS3KeyPrefix: event.body.slug + "/" + event.body.paragraphNumber + "/",
    VoiceId: voiceId, // Ruth
  };

  try {
    const response: AWS.Polly.StartSpeechSynthesisTaskOutput = await new Promise((resolve, reject) => {
      polly.startSpeechSynthesisTask(params, function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

    if (!response) {
      return formatJSONResponse({
        message: 'Failed to run AWS Polly',
      });
    }

    const filePath = response.SynthesisTask.OutputUri;

    return formatJSONResponse({
      filePath,
    });

  } catch (error) {
    console.error(error);
    return formatJSONResponse({
      message: 'Error occurred while running AWS Polly',
      error,
    });
  }
}

export const main = middyfy(polly);
