import { useState, useRef } from "react";
import {
  Button,
  Input,
  Box,
  Stack,
} from "@mui/material"
import { IoMicOutline, IoSquare } from "react-icons/io5";

export function InputChat({
  onSubmit,
  onChange,
  onChangeInputByVoice,
  onClearInput,
  value
}) {
  const [isSpeeching, setIsSpeeching] = useState(false)
  const micObjectRef = useRef(null)

  function handleEventSpeech(event) {
    console.log("orca", "handleEventSpeech")
    const result = event.results
    isSpeeching && setIsSpeeching(false)
    const message = result[0][0].transcript
    onChangeInputByVoice(message)
    setIsSpeeching(false)
    micObjectRef.current && micObjectRef.current.stop()
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
          placeholder={chrome.i18n.getMessage("chat_talk_input_placeholder")}
          value={value ? value : ""}
          onChange={onChange}
          sx={{
            paddingY: 2,
            paddingX: 1,
            boxShadow: "none",

          }}
          inputProps={{
            style: {
              borderBottom: "none",
              fontSize: 16,
            }
          }}
        />
        <Stack direction="row" spacing={1} sx={{ marginTop: 1, justifyContent: "space-between" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 1,
              backgroundColor: "#e36464",
              borderRadius: 1,
              width: 36,
              height: 36,
            }}
            onClick={isSpeeching ? handleClickStop : handleClickMic}
          >
            {isSpeeching ? <IoSquare color="#fff" size={24} /> : <IoMicOutline color="#fff" size={24} />}
          </Box>
          <Stack direction="row" spacing={1} sx={{ marginTop: 1, justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#3c223c",
                color: "#3c223c",
                fontSize: 16,
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#3c223c",
                }
              }}
              onClick={onClearInput}
            >
              {chrome.i18n.getMessage("chat_talk_clear_button")}
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#3c223c",
                color: "#fff",
                fontSize: 16,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#3c223c",
                }
              }}
              onClick={onSubmit}
            >
              {chrome.i18n.getMessage("chat_talk_button")}
            </Button>
          </Stack>

        </Stack>
      </Stack>
    </Box >
  )
}