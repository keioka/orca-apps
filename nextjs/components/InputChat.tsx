import { useState, useRef } from "react";
import {
  Button,
  Input,
  Box,
  Stack,
} from "@mui/material"
import { IoMicOutline, IoSquare } from "react-icons/io5";
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next'

export function InputChat({
  onSubmit,
  onChange,
  onChangeInputByVoice,
  onClickFetchSamples,
  onClearInput,
  value
}) {
  const theme = useTheme();
  const [isSpeeching, setIsSpeeching] = useState(false)
  const micObjectRef = useRef(null)
  const { t } = useTranslation('common')

  function handleEventSpeech(event) {
    const result = event.results
    const message = result[0][0].transcript
    onChangeInputByVoice(message)
    handleStop()
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
      micObjectRef.current = null;
    }
    setIsSpeeching(false)
  }

  function handleError(err) {
    alert("An error occurred while trying to use the microphone: " + err.error);
    handleStop();
  }

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: 4,
        padding: 1,
      }}
    >
      <Stack>
        <Input
          multiline
          disableUnderline={true}
          // placeholder={chrome.i18n.getMessage("chat_talk_input_placeholder")}
          placeholder="Type your message here..."
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
        <Stack direction="row" spacing={1} sx={{ marginTop: 1, justifyContent: "space-between", padding: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 1,
              backgroundColor: "#e36464",
              borderRadius: 1,
              width: 24,
              height: 24,
            }}
            onClick={isSpeeching ? handleStop : handleStart}
          >
            {isSpeeching ? <IoSquare color={theme.palette.customPalette.red} size={24} /> : <IoMicOutline color="#fff" size={24} />}
          </Box>
          <Stack direction="row" spacing={1} sx={{ marginTop: 1, justifyContent: "space-between" }}>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                color: "#3c223c",
                boxShadow: "none",
                backgroundColor: "#fff",
                fontWeight: "bold",
              }}
              onClick={onClickFetchSamples}
            >
              {t('inputChat.fetchSampleButton')}
              {/* {chrome.i18n.getMessage("chat_talk_clear_button")} */}
            </Button>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                color: "#3c223c",
                boxShadow: "none",
                backgroundColor: "#fff",
                fontWeight: "bold",
              }}
              onClick={onClearInput}
            >
              {t('inputChat.clearButton')}
              {/* {chrome.i18n.getMessage("chat_talk_clear_button")} */}
            </Button>
            <Button
              size="small"
              color="primary"
              variant="contained"
              sx={{
                color: "#fff",
                boxShadow: "none",
                fontWeight: "bold",
              }}
              onClick={onSubmit}
            >
              {t("inputChat.talk")}
              {/* {chrome.i18n.getMessage("chat_talk_button")} */}
            </Button>
          </Stack>

        </Stack>
      </Stack>
    </Box >
  )
}