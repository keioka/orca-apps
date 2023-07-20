/**
 * Text-to-speech was originally served by ElevenLabs from the client. That path
 * was retired in favour of AWS Polly (see `lambda/src/functions/polly`), which
 * keeps the provider credential server-side. This stub is kept so callers in
 * the chat flow keep their existing signature.
 */
export async function callTextToSpeechAPI(_text: string): Promise<HTMLAudioElement> {
  return new Audio();
}
