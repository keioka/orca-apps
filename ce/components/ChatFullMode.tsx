import { useEffect, useRef, useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { IoMicOutline, IoSquare, IoChatboxEllipsesOutline } from "react-icons/io5";
import { useTheme } from '@mui/material/styles';
import { Player, Controls } from '@lottiefiles/react-lottie-player';

export function ChatFullMode({ message, lastMessage, onChangeInputByVoice, onChangeFullMode }: { message: string, lastMessage: any }) {
  const [isSpeeching, setIsSpeeching] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const micObjectRef = useRef(null)
  const LottieRef = useRef(null)

  useEffect(() => {
    // play audio
    if (isAISpeaking) return
    console.log({ lastMessage })
    async function playAudio() {
      if (lastMessage && lastMessage.type === "ai" && lastMessage.audioFile) {
        const audio = new Audio(lastMessage.audioFile.path);
        setIsAISpeaking(true)
        await audio.play()
        audio.addEventListener('ended', () => {
          setIsAISpeaking(false)
        })
      }
    }

    playAudio()
  }, [lastMessage])

  useEffect(() => {
    console.log({ isAISpeaking, LottieRef })
    if (LottieRef.current !== null) {
      LottieRef.current.play();

      if (!isAISpeaking) {
        LottieRef.current.stop();
      }
    }
  }, [isAISpeaking])

  function handleError(err) {
    alert("An error occurred while trying to use the microphone: " + err.error);
    handleStop();
  }

  function handleEventSpeech(event) {
    const result = event.results
    const message = result[0][0].transcript
    onChangeInputByVoice(message)
  }

  function handleStart() {
    setIsSpeeching(true)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.start();
    recognition.onresult = handleEventSpeech
    recognition.onerror = handleError

    micObjectRef.current = recognition
  }

  function handleStop() {
    if (micObjectRef.current) {
      micObjectRef.current.stop()
    }
    setIsSpeeching(false)
  }

  return (
    <Stack sx={{ display: "flex", justifyContent: "center" }}>
      <Box mb={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 2,
            backgroundColor: "#242424",
            width: 48,
            height: 48,
            borderRadius: 48,
          }}
          onClick={onChangeFullMode}
        >
          <IoChatboxEllipsesOutline color="#fff" size={18} />
        </Box>
      </Box>
      <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>{lastMessage.content}</Typography>
        <Player
          ref={LottieRef}
          loop
          src="https://lottie.host/a8b1675a-8b47-4456-82b6-88e9d966df3d/TAK222m2d9.json"
          style={{ height: '300px', width: '300px' }}
        />
        <Typography variant="h6" sx={{ marginBottom: 2 }}>{message}</Typography>
        <Stack spacing={2} direction="row">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 1,
              backgroundColor: "#e36464",
              borderRadius: 64,
              width: 64,
              height: 64,
            }}
            onClick={isSpeeching ? handleStop : handleStart}
          >
            {isSpeeching ? <IoSquare color="#fff" size={32} /> : <IoMicOutline color="#fff" size={32} />}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 1,
              backgroundColor: "lightgray",
              borderRadius: 64,
              width: 64,
              height: 64,
            }}
            onClick={isSpeeching ? handleStop : handleStart}
          >
            {isSpeeching ? <IoSquare color="#fff" size={32} /> : <IoMicOutline color="#fff" size={32} />}
          </Box>
        </Stack>
      </Stack>
    </Stack >
  )
}