import { useState, useRef } from "react";
import {
  Button,
  Input,
  Box,
  Stack,
} from "@mui/material"
import { IoMicOutline, IoSquare } from "react-icons/io5";

export function InputChat({ onSubmit, onChange, onSpeechResult, value }) {
  const [isSpeeching, setIsSpeeching] = useState(false)
  const micObjectRef = useRef(null)

  function handleEventSpeech(event) {
    console.log("orca", "handleEventSpeech")
    const result = event.results
    isSpeeching && setIsSpeeching(false)
    console.log("orca", { result })
    const message = result[0][0].transcript
    onSpeechResult(message)
    setIsSpeeching(false)
  }

  function handleClickMic() {
    setIsSpeeching(true)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.start();
    recognition.onresult = handleEventSpeech
    recognition.onerror = (err) => {
      console.log("orca", { err })
      recognition.stop()
    }

    micObjectRef.current = recognition
  }

  function handleClickStop() {
    micObjectRef.current && micObjectRef.current.stop()
    setIsSpeeching(false)
  }

  return (
    <Box
      sx={{
        background: "#f4f4f4",
        borderRadius: 4,
        padding: 1,
      }}
    >
      {/* create a record button */}
      <Stack>
        <Input
          multiline
          disableUnderline={true}
          placeholder="Type a message"
          value={value}
          onChange={onChange}
          sx={{
            paddingY: 2,
            paddingX: 1,
            boxShadow: "none",

          }}
          inputProps={{
            style: {
              borderBottom: "none",
            }
          }}
        />
        <Stack direction="row" spacing={1} sx={{ marginTop: 1, justifyContent: "space-between" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: 1,
              backgroundColor: "#e36464",
              borderRadius: 1,
              width: "32px",
              height: "32px",
            }}
            onClick={isSpeeching ? handleClickStop : handleClickMic}
          >
            {isSpeeching ? <IoSquare color="#fff" /> : <IoMicOutline color="#fff" />}
          </Box>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#3c223c",
              color: "#fff",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#3c223c",
              }
            }}
            onClick={onSubmit}
          >
            Speak
          </Button>
        </Stack>
      </Stack>
    </Box >
  )
}