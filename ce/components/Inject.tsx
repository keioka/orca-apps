import { useState, useEffect } from "react"
import {
  Button,
  Stack,
  Typography,
  Box,
  Drawer,
  Avatar,
  Switch,
  FormControlLabel,
  ButtonGroup,
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
import { RiSpeakLine } from "react-icons/ri";
import { TbVocabulary } from "react-icons/tb";
import { ListVocab } from "./ListVocab";
import { saveVocabulary } from "../redux/features/save";

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

enum Mode {
  Talk,
  Vocab
}

export function Inject() {
  const [hideExtention, setHideExtention] = useState(false)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [mode, setMode] = useState(Mode.Talk)
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [isLoadingVocabs, setIsLoadingVocabs] = useState(false)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [error, setError] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const { user, isLoading, onLogin, onLogout } = useFirebase()
  const [message, setMessage] = useState(null)
  const [isFullLoaded, setIsFullLoaded] = useState(false)
  const dispatch = useAppDispatch()
  const lessons = useAppSelector(state => { return state.lessons.lessons })
  const lesson = useAppSelector(state => { return state.lessons.lessons.find((lesson) => lesson.id === lessonId) })
  const state = useAppSelector(state => { return state })
  // const onPressToggle = () => setMode(mode === Mode.Learning ? Mode.Talk : Mode.Learning)

  useEffect(() => {
    // dispatch(fetchLesson(lessonId))
    // dispatch(fetchMessages(lessonId))
  }, [])

  function handleChangeAutoPlay() {
    setIsAutoPlay(!isAutoPlay)
  }


  function handleSaveVocab(vocab) {
    dispatch(saveVocabulary({
      url: window.location.href,
      data: vocab
    }))
  }

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

    window.addEventListener('load', function () {
      setIsFullLoaded(true)
    })

    if (open) {
      setOriginalWidth(window.innerWidth)
      const newPixelWidth = window.innerWidth - drawerWidth
      document.body.style.width = `${newPixelWidth}px`
    } else if (!open && isFullLoaded) {
      document.body.style.width = `${originalWidth}px`
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
            <Box mt={2}>
              <Menu onClickButton={(mode) => setMode(mode)} selectedMode={mode} />
            </Box>

            {mode === Mode.Talk && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end"
                  }}
                  mt={0} mb={2}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAutoPlay}
                        onChange={handleChangeAutoPlay}
                      />
                    }
                    label={chrome.i18n.getMessage("chat_toggle_autoplay")}
                  />
                </Box>
                <ChatModeProto isAutoPlay={isAutoPlay} />
              </>
            )}
            {mode === Mode.Vocab &&
              <VocabMode
                vocabs={vocabs}
                setVocabs={setVocabs}
                setIsLoadingVocabs={setIsLoadingVocabs}
                isLoadingVocabs={isLoadingVocabs}
                setError={setError}
                onSaveVocab={handleSaveVocab}
              />
            }
          </Box>
        </Drawer>
      }

      <Opener setOpen={setOpen} setHideExtention={setHideExtention} />
    </Box >
  )
}

function VocabMode({
  vocabs,
  setVocabs,
  setIsLoadingVocabs,
  isLoadingVocabs,
  setError,
  onSaveVocab
}) {

  useEffect(() => {
    if (vocabs.length > 0) {
      return
    }

    async function init() {
      setIsLoadingVocabs(true);

      try {
        // Select all paragraphs in the DOM
        const paragraphs = Array.from(document.querySelectorAll('p'));

        // Loop over each paragraph
        for (const paragraph of paragraphs) {
          // Send the text content of the paragraph to the background
          const resp = await sendToBackground({
            name: "vocabsFromText",
            body: {
              text: paragraph.textContent || paragraph.innerText,
            },
          });

          if (resp.error) {
            // Handle error
            setError(resp.error);
          } else {
            setIsLoadingVocabs(false);
            // Update the vocabs state with the returned vocabs
            setVocabs(prevVocabs => [...prevVocabs, ...resp.vocabs]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    init()
  }, [])


  return (
    <Box mt={2}>
      <ListVocab vocabs={vocabs} isLoading={isLoadingVocabs} onSaveVocab={onSaveVocab} />
    </Box>
  )
}

const OpenerSize = 32

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
          width: `${OpenerSize}px`,
          height: `${OpenerSize}px`,
          minWidth: "0px",
          padding: 0,
          borderRadius: "50% 0px 0px 50%",
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
          width: `${OpenerSize}px`,
          height: `${OpenerSize}px`,
          borderRadius: "0px 0px 0px 0px",
          "&:hover": {
            backgroundColor: "#2aa2e3",
          }
        }}
      >
        <Typography sx={{ fontSize: 8, fontWeight: 700 }}>{chrome.i18n.getMessage("opener_label")}</Typography>
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

function Menu({
  onClickButton,
  selectedMode
}) {
  return (
    <ButtonGroup
      variant="outlined"
      sx={{
        backgroundColor: "#f8f8f8",
        width: "100%",
      }}
    >
      <Button
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          backgroundColor: selectedMode === Mode.Talk ? "#3c223c" : "transparent",
          borderRight: "1px solid #dddddd",
          "&:hover": {
            backgroundColor: "#614461",
            border: "none",
            borderRight: "1px solid #dddddd",
          },
        }}
        onClick={() => onClickButton(Mode.Talk)}
      >
        <RiSpeakLine size={24} color={selectedMode === Mode.Talk ? "#fff" : "#bbbbbb"} />
      </Button>
      <Button
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRight: "1px solid #dddddd",
          backgroundColor: selectedMode === Mode.Vocab ? "#3c223c" : "transparent",
          "&:hover": {
            backgroundColor: "#614461",
            border: "none",
            borderRight: "1px solid #dddddd",
          },
        }}
        onClick={() => onClickButton(Mode.Vocab)}
      >
        <TbVocabulary size={24} color={selectedMode === Mode.Vocab ? "#fff" : "#bbbbbb"} />
      </Button>
      <Button
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          "&:hover": {
            backgroundColor: "#f8f8f8",
            border: "none",
          },
        }}
      >
        <IoCloseCircle size={24} color="#dddddd" />
      </Button>
    </ButtonGroup>
  )
}
