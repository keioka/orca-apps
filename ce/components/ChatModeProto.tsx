import {
  Typography,
  Box,
  Drawer,
  Card,
  CardActions,
  Chip,
  Grid,
  Alert,
  Avatar
} from "@mui/material"
import { useState, useEffect } from "react"
import { ListChat } from "./ListChat";
import { InputChat } from "./InputChat";
import { urlPath } from "~helpers/path";
import { useAppDispatch, useAppSelector } from '~/redux/hooks';
import { fetchSampleResponses } from '~/redux/features/lessons'
import mixpanel from "mixpanel-browser"
import { ChatFullMode } from "~/components/ChatFullMode";
import { IoExpandOutline } from "react-icons/io5";

export function ChatModeProto({ isAutoPlay, isCreatingMessage, handleSubmitMessage, messages, currentLesson }) {
  const [message, setMessage] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isFullMode, setIsFullMode] = useState(false)
  const [error, setError] = useState(null)
  const sampleResponses = useAppSelector((state) => state.lesson.sampleResponses)
  const loadingSampleResponses = useAppSelector((state) => state.lesson.loadingSampleResponses)
  const dispatch = useAppDispatch()

  const url = urlPath

  const onClearInput = () => {
    setMessage(null)
  }

  const onChangeInput = (e) => {
    setMessage(e.target.value)
  }

  const onChangeInputByVoice = async (newMessages: string) => {
    if (!message) {
      setMessage(newMessages + ". ")
      return
    }

    setMessage(message + newMessages + ". ")

    if (isFullMode) {
      submitMessage()
    }
  };

  const handleFetchSamples = () => {
    mixpanel.track("ACT:FetchSampleResponses", {
      lessonId: currentLesson.id
    })
    if (currentLesson) {
      dispatch(fetchSampleResponses(currentLesson.id))
    }
  }

  const handleFullMode = () => {
    console.log(">>>>>>>>>>handleFullMode>>>>>>>>>>")
    setIsFullMode(!isFullMode)
  }

  const submitMessage = async () => {
    try {
      console.log("submit")
      handleSubmitMessage(message)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
      setMessage(null)
    }
  };

  const lastMessage = messages ? messages[messages.length - 1] : null

  if (lastMessage && isFullMode) {
    return (
      <ChatFullMode message={message} lastMessage={lastMessage} onChangeInputByVoice={onChangeInputByVoice} onChangeFullMode={handleFullMode} />
    )
  }

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        sx={{
          padding: 2,
          background: "#242424",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: 48,
          height: 48,
          borderRadius: 48,
        }}
      >
        <IoExpandOutline size={18} color="#fff" onClick={handleFullMode} />
      </Box>
      <ListChat messages={messages} isAutoPlay={isAutoPlay} isCreatingMessage={isCreatingMessage} url={url} />
      <Box
        sx={{
          paddingY: 2
        }}
      >
        {loadingSampleResponses && <Box sx={{ background: "#fff" }} p={3}>{chrome.i18n.getMessage("fetching_sample_responses")}</Box>}
        {sampleResponses && sampleResponses.length > 0 && <Box sx={{ background: "#fff" }} p={3}>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>{chrome.i18n.getMessage("sample_responses_title")}</Typography>
          {sampleResponses.map((response) => (
            <Box sx={{ borderTop: "1px solid #e4e4e4", paddingTop: 2 }}>
              <Box mb={2} sx={{ fontSize: 16 }}>{response.sentence}</Box>
              <Box mb={2} sx={{ fontSize: 14, color: "#747474" }}>{response.jaSentence}</Box>
            </Box>
          ))}
        </Box>}
        <InputChat
          onChange={onChangeInput}
          onChangeInputByVoice={onChangeInputByVoice}
          onClickFetchSamples={handleFetchSamples}
          onClearInput={onClearInput}
          onSubmit={submitMessage}
          value={message}
          loadingSampleResponses={loadingSampleResponses}
        />
      </Box >
    </>
  )
}