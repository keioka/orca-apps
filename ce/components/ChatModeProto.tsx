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

export function ChatModeProto({ isAutoPlay, handleAddMessage, chatHistory }) {
  const [messages, setMessages] = useState(chatHistory)
  const [message, setMessage] = useState(null)
  const [initializing, setInitalizing] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const url = urlPath

  useEffect(() => {
    async function init() {
      const message = { message: "Hello!", type: "ai" }
      setMessages([message])
      setInitalizing(true)
      const initPrompt = "Can you ask me a question about the news? I will try to answer it. Don't have to say `Sure!` or `Yes!`."
      const resp = await sendToBackground({
        name: "chat",
        body: {
          url: urlPath,
          message: initPrompt,
          history: chatHistory,
        }
      })
      console.log("orca", { resp })

      const { data: { completion: { choices } } } = resp
      if (resp.error) {
        setError(resp.error)
        return
      }
      handleAddMessage({ message: choices[0].message.content, type: "ai" })
      setMessages([message, { message: choices[0].message.content, type: "ai" }])
      setInitalizing(false)
    }

    if (chatHistory.length === 0) {
      init()
    }
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
    const pastMessages = [...messages] // copy
    const newMessages = [...messages, { message: message, type: "human" }]
    setMessages(newMessages)
    handleAddMessage({ message: message, type: "human" })

    try {
      const resp = await sendToBackground({
        name: "chat",
        body: {
          url: urlPath,
          message: message,
          history: pastMessages || [],
        }
      })

      const { data: { completion: { choices } } } = resp
      if (resp.error) {
        setError(resp.error)
        return
      }
      handleAddMessage({ message: choices[0].message.content, type: "ai" })
      setMessages([...newMessages, { message: choices[0].message.content, type: "ai" }])
      setMessage(null)
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