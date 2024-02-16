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
import { sendToBackground } from "@plasmohq/messaging"
import { urlPath } from "~helpers/path";

export function ChatModeProto({ isAutoPlay, handleSubmitMessage, messages }) {
  const [message, setMessage] = useState(null)
  const [initializing, setInitalizing] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const url = urlPath

  useEffect(() => {
    // async function init() {
    //   setInitalizing(true)     
    //   setInitalizing(false)
    // }

    // if (chatHistory.length === 0) {
    //   init()
    // }
  }, [])

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
  };

  const submitMessage = async () => {
    console.log("submit")
    handleSubmitMessage(message)

    try {
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
    }
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <ListChat messages={messages} loadingAIResp={initializing} isAutoPlay={isAutoPlay} url={url} />
      <Box
        sx={{
          paddingY: 2
        }}
      >
        <InputChat
          onChange={onChangeInput}
          onChangeInputByVoice={onChangeInputByVoice}
          onClearInput={onClearInput}
          onSubmit={submitMessage}
          value={message}
        />
      </Box >
    </>
  )
}