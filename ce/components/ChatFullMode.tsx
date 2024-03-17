import { useEffect, useRef, useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { IoMicOutline, IoSquare, IoChatboxEllipsesOutline } from "react-icons/io5";
import { useTheme } from '@mui/material/styles';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import { ReactTyped } from "react-typed";

export function ChatFullMode({
  message,
  lastMessage,
  onChangeInputByVoice,
  onChangeFullMode,
  submitMessage
}: { message: string, lastMessage: any }) {
  const [isSpeeching, setIsSpeeching] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [hasRetry, setHasRetry] = useState(false)
  const micObjectRef = useRef(null)
  const LottieRef = useRef(null)
  const MAX_RETRY_COUNT = 3
  useEffect(() => {
    // play audio
    console.log({ lastMessage, isAISpeaking })
    if (isAISpeaking) return
    setHasRetry(false)

    async function playAudio(retryCount: number = 0) {
      console.log({ retryCount })
      try {
        if (lastMessage && lastMessage.type === "ai" && lastMessage.audioFile) {
          console.log("========== playAudio ==============")
          console.log(lastMessage.audioFile.path)
          const audio = new Audio(lastMessage.audioFile.path);
          audio.playbackRate = 0.9;

          setIsAISpeaking(true)
          await audio.play()
          audio.addEventListener('ended', () => {
            console.log("========== ended ==============")
            setIsAISpeaking(false)
            audio.remove()
          })
        }
      } catch (error) {
        setIsAISpeaking(false)
        console.error(error)

        if (retryCount > MAX_RETRY_COUNT) return

        const newCount = retryCount + 1
        setTimeout(() => {
          playAudio(newCount)
        }, 1000 * newCount)

        setHasRetry(true)
      }
    }

    setTimeout(playAudio, 1000)

  }, [lastMessage])

  useEffect(() => {
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
    const results = [...event.results]
    if (!results) return
    const message = results.map((result) => result[0].transcript).join("")
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
    recognition.onend = () => {
      console.warn("Speech has ended")
    }
    recognition.onspeechend = () => {
      console.warn("Speech has ended")
    }
    recognition.onerror = handleError

    micObjectRef.current = recognition
  }

  function handleStop() {
    if (micObjectRef.current) {
      micObjectRef.current.stop()
    }
    setIsSpeeching(false)
    submitMessage()
  }

  return (
    <Stack sx={{ display: "flex" }}>
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


      <Stack spacing={2} sx={{ justifyContent: "space-between" }}>
        <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {lastMessage &&
            <ReactTyped
              style={{ fontFamily: "Outfit", fontSize: 20, marginBottom: 2 }}
              strings={[lastMessage.content]}
              typeSpeed={10}
              showCursor={false}
            />
          }
          <Player
            ref={LottieRef}
            loop
            src="https://lottie.host/a8b1675a-8b47-4456-82b6-88e9d966df3d/TAK222m2d9.json"
            style={{ height: '150px', width: '150px' }}
          />
        </Stack>

        <Stack
          spacing={2}
          direction="column"
          sx={{
            position: "absolute",
            bottom: 20,
            left: "0%",
            alignItems: "center",
            width: "100%"
          }}>
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
          </Stack>
        </Stack>

      </Stack>
    </Stack >
  )
}