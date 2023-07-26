import { useRef, useState } from 'react';
import { Audio } from 'expo-av';

type Recording = {
  sound: Audio.Sound,
  duration: string,
  file: string,
};

const whisperConfig = {
  apiKey: '',
  autoStart: false,
  autoTranscribe: true,
  mode: 'transcriptions',
  nonStop: false,
  removeSilence: false,
  stopTimeout: 10000,
  streaming: false,
  timeSlice: 1_000,
  onDataAvailable: undefined,
  onTranscribe: undefined,
}

export const useAudio = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [latestFile, setLatestFile] = useState<Audio.Recording | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transcribeInterim = () => { }; // Define this function
  const transcribeTimeout = 1; // Set timeout
  const getDurationFormatted = (duration: number) => { return ""; } // Define this function

  async function startRecording() {
    setLatestFile(null);
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        setMessage("Please grant permission to app to access microphone");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      alert("Starting recording..");

      const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: Audio.RecordingOptions = {
        android: {
          extension: ".mp4",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
      console.log("Recording started");
      setIsRecording(true);
      intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000);
    } catch (err) {
      console.error(" Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) {
      console.log("No active recording to stop");
      return;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const { sound, status } = await recording.createNewLoadedSoundAsync();

    const updatedRecordings = [...recordings, {
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: uri,
    }];

    setLatestFile(recording);
    setRecording(null);
    setRecordings(updatedRecordings);
    console.log("Recording stopped and stored at", uri);

    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRecording(false);
  }

  // function send() {
  //   const body = new FormData()
  //   body.append('file', file)
  //   body.append('model', 'whisper-1')
  //   if (mode === 'transcriptions') {
  //     body.append('language', whisperConfig?.language ?? 'en')
  //   }
  //   if (whisperConfig?.prompt) {
  //     body.append('prompt', whisperConfig.prompt)
  //   }
  //   if (whisperConfig?.response_format) {
  //     body.append('response_format', whisperConfig.response_format)
  //   }
  //   if (whisperConfig?.temperature) {
  //     body.append('temperature', `${whisperConfig.temperature}`)
  //   }
  //   const headers: RawAxiosRequestHeaders = {}
  //   headers['Content-Type'] = 'multipart/form-data'
  //   if (apiKey) {
  //     headers['Authorization'] = `Bearer ${apiKey}`
  //   }
  //   const { default: axios } = await import('axios')
  //   const response = await axios.post(whisperApiEndpoint + mode, body, {
  //     headers,
  //   })
  //   return response.data.text
  // }

  return {
    startRecording,
    stopRecording,
    file: latestFile
  }
}

export default useAudio;
