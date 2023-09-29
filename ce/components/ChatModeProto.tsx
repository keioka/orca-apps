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

export function ChatModeProto({ isAutoPlay }) {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState(null)
  const [initializing, setInitalizing] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {

    async function init() {
      const message = { message: "Hello!", type: "ai" }
      setMessages([message])
      setInitalizing(true)
      const initPrompt = "Can you ask me a question about the news? I will try to answer it. Don't have to say `Sure!` or `Yes!`."
      const resp = await sendToBackground({
        name: "chat",
        body: {
          url: window.location.href,
          message: initPrompt,
          history: [],
        }
      })
      console.log("orca", { resp })

      const { data: { completion: { choices } } } = resp
      if (resp.error) {
        setError(resp.error)
        return
      }

      setMessages([message, { message: choices[0].message.content, type: "ai" }])
      setInitalizing(false)
    }

    init()
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
    const newMessages = [...messages, { message: message, type: "human" }]
    setMessages(newMessages)
    try {
      const resp = await sendToBackground({
        name: "chat",
        body: {
          url: window.location.href,
          message: message,
          history: [],
        }
      })

      const { data: { completion: { choices } } } = resp
      if (resp.error) {
        setError(resp.error)
        return
      }

      setMessages([...newMessages, { message: choices[0].message.content, type: "ai" }])
      setMessage(null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
    }
  };

  console.log({ message })

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <ListChat messages={messages} loadingAIResp={initializing} isAutoPlay={isAutoPlay} />
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