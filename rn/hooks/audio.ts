import { useRef, useState } from 'react';
import { Audio } from 'expo-av';
import axios, { RawAxiosRequestHeaders } from 'axios';

type Recording = {
  sound: Audio.Sound,
  duration: string,
  file: string,
};


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

export const useAudio = () => {
  const recording = useRef<Audio.Recording | null>(null);
  // const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [latestFile, setLatestFile] = useState<Blob | null>(null);
  const [latestFileURI, setLatestFileURI] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null); // recordings[recordings.length - 1]?.sound || null);

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

      // await recording.current.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);

      const { recording: recordingObj } = await Audio.Recording.createAsync(RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      recording.current = recordingObj;
      console.log("Recording started");
      setIsRecording(true);
      intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000);
    } catch (err) {
      console.error(" Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording.current) {
      console.log("No active recording to stop");
      return;
    }

    await recording.current.stopAndUnloadAsync();
    const uri = recording.current.getURI();
    await recording.current.createNewLoadedSoundAsync();

    // const updatedRecordings = [...recordings, {
    //   sound: sound,
    //   duration: getDurationFormatted(status.durationMillis),
    //   file: uri,
    // }];

    if (!uri) {
      console.warn("No recording uri returned");
      return;
    }



    const { sound, status } = await Audio.Sound.createAsync({ uri })
    // await sound.playAsync();
    setSound(sound);

    console.log("status", status)
    const response = await fetch(uri)
    const file = await response.blob()

    console.log(file instanceof Blob)
    setLatestFile(file);
    setLatestFileURI(uri);

    console.log({ mimeType: file.type })
    recording.current = null
    // setRecordings(updatedRecordings);
    console.log("Recording stopped and stored at", uri);

    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRecording(false);
  }

  return {
    startRecording,
    stopRecording,
    file: latestFile,
    fileURI: latestFileURI,
    sound
  }
}

export default useAudio;
