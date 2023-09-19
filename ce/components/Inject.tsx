import { useState, useEffect } from "react"
import {
  Button,
  Input,
  Link,
  Stack,
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
import { IoPlayCircle, IoCloseCircle, IoMicOutline } from "react-icons/io5";
import { useFirebase } from "../firebase/hooks"
import { sendToBackground } from "@plasmohq/messaging"
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLesson } from '../redux/features/lessons';
import { fetchMessages, createMessage, addMessage } from '../redux/features/messages';
import { InputChat } from "./InputChat";
import { ChatMode } from "./ChatMode";
import { ChatModeProto } from "./ChatModeProto";

const drawerWidth = 380

interface Vocab {
  id: string
  name: string
  word: string
  meaning: string
  example: string
  pronounce: string
  imageUrls: string[]
  audioFile: string
}

function highlightSelectedText() {
  console.log("orca", "highlightSelectedText")
  // Get the selected text
  const selectedText = window.getSelection().toString().trim();

  // Check if any text is selected
  if (selectedText !== "") {
    // Create a span element to wrap the selected text
    const wordEle = document.createElement("span");
    wordEle.style.backgroundColor = "yellow"; // Set the highlight color

    // Replace the selected text with the span element
    const range = window.getSelection().getRangeAt(0);
    range.surroundContents(wordEle);

    console.log("orca", { rangeSentence: window.getSelection().getRangeAt(1) })

    // // Scroll to the highlighted element for visibility
    // spanElement.scrollIntoView();
  }


  if (selectedText !== "") {
    // Find all occurrences of the selected word
    const occurrences = document.body.innerText.split(/[.!?]/).filter(sentence => sentence.toLowerCase().includes(selectedText.toLowerCase()));

    if (occurrences.length > 0) {
      // Iterate through the occurrences and highlight them
      occurrences.forEach(sentence => {
        const spanElement = document.createElement("span");
        spanElement.style.backgroundColor = "yellow";
        spanElement.textContent = sentence;

        const range = document.createRange();
        range.selectNodeContents(document.body);
        range.collapse(false);
        const foundRange = document.createRange();
        foundRange.selectNodeContents(spanElement);
        range.setEndAfter(foundRange.endContainer, foundRange.endOffset);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        spanElement.scrollIntoView();
      });
    }
  }
}

export function Inject() {
  const [hideExtention, setHideExtention] = useState(false)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const { user, isLoading, onLogin, onLogout } = useFirebase()
  const [message, setMessage] = useState(null)
  const dispatch = useAppDispatch()
  const lessons = useAppSelector(state => { return state.lessons.lessons })
  const lesson = useAppSelector(state => { return state.lessons.lessons.find((lesson) => lesson.id === lessonId) })

  // const onPressToggle = () => setMode(mode === Mode.Learning ? Mode.Talk : Mode.Learning)

  useEffect(() => {
    // dispatch(fetchLesson(lessonId))
    // dispatch(fetchMessages(lessonId))
  }, [])

  // useEffect(() => {
  //   document.addEventListener("mouseup", highlightSelectedText);
  //   return () => {
  //     document.removeEventListener("mouseup", highlightSelectedText);
  //   };
  // }, [])

  // useEffect(() => {
  //   setError(null)

  //   if (!open || data) {
  //     return
  //   }

  //   async function init() {
  //     setIsLoadingData(true)

  //     try {
  //       const resp = await sendToBackground({
  //         name: "material",
  //         body: {
  //           url: window.location.href,
  //         }
  //       })
  //       console.log("orca", { resp })

  //       if (resp.error) {
  //         setError(resp.error)
  //       } else {
  //         setData(resp.data)
  //       }
  //     } catch (e) {
  //       console.error(e)
  //     } finally {
  //       setIsLoadingData(false)
  //     }
  //   }

  //   init()

  // }, [open])


  useEffect(() => {
    if (open) {
      const newPixelWidth = window.innerWidth - drawerWidth
      document.body.style.width = `${newPixelWidth}px`
      console.log("orca", { newPixelWidth })
    }
  }, [open])

  if (hideExtention) {
    return null
  }

  return (
    <Box
      id="orca-window"
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "transparent",
        pointerEvents: "none",
        cursor: "pointer",
      }}
    >
      {open &&
        <Drawer
          variant="persistent"
          anchor="right"
          open={open}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            pointerEvents: "auto",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "#fff",
            }
          }}
        >
          <Box
            sx={{
              padding: "16px",
              height: "100%",
            }}
          >
            <Header setOpen={setOpen} onLogin={onLogin} />
            {true ? <ChatModeProto /> : <ChatMode />}
          </Box>
        </Drawer>
      }

      <Opener setOpen={setOpen} setHideExtention={setHideExtention} />
    </Box >
  )
}

function Opener({ setOpen, setHideExtention }: { setHideExtention: (hide: boolean) => void, setOpen }) {
  return (
    <Box
      sx={{
        position: "fixed",
        right: "0px",
        top: "140px",
        zIndex: 2,
        pointerEvents: "auto",
      }}
    >
      <Button
        onClick={() => setHideExtention(true)}
        sx={{
          backgroundColor: "#2aa2e3",
          color: "#fff",
          width: "64px",
          height: "64px",
          borderRadius: "64px 0px 0px 64px",
          "&:hover": {
            backgroundColor: "#2aa2e3",
          }
        }}
      >
        <IoCloseCircle size={24} color="#fff" />
      </Button>
      <Button
        onClick={() => setOpen(true)}
        sx={{
          fontFamily: "Open Sans",
          backgroundColor: "#2aa2e3",
          color: "#fff",
          width: "64px",
          height: "64px",
          borderRadius: "0px 0px 0px 0px",
          "&:hover": {
            backgroundColor: "#2aa2e3",
          }
        }}
      >
        Open
      </Button>
    </Box>
  )
}
function Header({ setOpen, onLogin }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        paddingBottom: 1,
        borderBottom: "1px solid #f2f2f2"
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => setOpen(false)}
      >
        <IoCloseCircle size={32} color="#dddddd" />
      </Box>
      <Box onClick={onLogin}>
        <Avatar src="" />
      </Box>
    </Stack>
  )
}
