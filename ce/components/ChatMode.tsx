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
import { sendToBackground } from "@plasmohq/messaging"
import { InputChat } from "./InputChat";
import { ListChat } from "./ListChat";
import { Preview } from "./Preview";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMessages, createMessage, addMessage } from '../redux/features/messages';

const messages = [
  {
    message: "Orca is an AI-powered extension that helps you learn English while browsing the web.",
    type: "ai"
  },
  {
    message: "Orca is an AI-powered extension that helps you learn English while browsing the web.",
    type: "human"
  },

]


export function ChatMode() {
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [message, setMessage] = useState(null)
  const dispatch = useAppDispatch()
  const lessons = useAppSelector(state => { return state.lessons.lessons })
  const lesson = useAppSelector(state => { return state.lessons.lessons.find((lesson) => lesson.id === lessonId) })

  useEffect(() => {
    setError(null)

    if (!open || data) {
      return
    }

    async function init() {
      setIsLoadingData(true)

      try {
        const resp = await sendToBackground({
          name: "material",
          body: {
            url: window.location.href,
          }
        })
        console.log("orca", { resp })

        if (resp.error) {
          setError(resp.error)
        } else {
          setData(resp.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoadingData(false)
      }
    }

    init()

  }, [open])


  const onChangeInput = (e) => {
    setMessage(e.target.value)
  }

  const submitMessage = () => {
    dispatch(addMessage({ message, lessonId: lesson.id }))
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        padding: 1
      }}
    >
      <Box
        sx={{
          overflow: "scroll",
          paddingBottom: 4,
        }}
      >
        {isLoadingData && (
          <Typography variant="body2" component="h6">
            Loading...
          </Typography>
        )}
        <Box my={2}>
          {error &&
            <Alert severity="error">{error}</Alert>
          }
          {data &&
            <Preview {...data} />
          }
        </Box>
        {/* <ListVocab /> */}
        <ListChat messages={messages} />
      </Box>
      <Box
        sx={{
          paddingY: 2
        }}
      >
        <InputChat onChange={onChangeInput} sumbit={submitMessage} />
      </Box>
    </Box>
  )
}