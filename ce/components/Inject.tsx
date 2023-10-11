import { useState, useEffect, useMemo } from "react"
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
import { Opener } from "./Opener";
import { ChatModeProto } from "./ChatModeProto";
import { RiSpeakLine } from "react-icons/ri";
import { TbVocabulary } from "react-icons/tb";
import { FaFileWord } from "react-icons/fa";
import { ListVocab } from "./ListVocab";
import { saveVocabulary } from "../redux/features/save";
import { toggleDisable, clearSubscriptionForm } from "~redux/features/ui";
import { createNewLesson, addMessageToLesson } from "../redux/features/lessonsLocal";
import type { VocabularyItem, Message } from "~types";
import { urlPath } from "~helpers/path";
import { SummaryMode } from "./SummaryMode";
import { FormSubscription } from "./FormSubscription";

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
  Vocab,
  Summary
}

const blaklist = [
  "github.com",
  "facebook.com",
  "twitter.com",
  "google.com",
  "amazon.com",
  "amazon.co.jp",
]

interface Summary {
  level: string,
  summary: string,
}

export function Inject() {
  const [hideExtention, setHideExtention] = useState(false)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [mode, setMode] = useState(Mode.Talk)
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [isLoadingVocabs, setIsLoadingVocabs] = useState(false)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false)


  const [originalWidth, setOriginalWidth] = useState(0)
  const [error, setError] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const { user, isLoading, onLoginBackground, onLogout } = useFirebase()
  const [message, setMessage] = useState(null)
  const [isFullLoaded, setIsFullLoaded] = useState(false)
  const dispatch = useAppDispatch()
  const lesson = useAppSelector(state => { return state.lessonsLocal.lessons[urlPath] })
  const state = useAppSelector(state => { return state })
  const note = useAppSelector(state => { return state.saveData[urlPath] })
  const uiDisabled = useAppSelector(state => { return state.ui.disabled })
  const shouldShowSubscriptionForm = useAppSelector(state => { return !state.payment.isValidSubscription && state.ui.shouldShowSubscriptionForm })

  useEffect(() => {
    dispatch(clearSubscriptionForm())
  }, [])

  const chatHistory = useMemo(() => {
    return lesson?.chatHistory || []
  }, [lesson])

  useEffect(() => {
    // Create a new lesson using redux
    if (open) {
      dispatch(createNewLesson({ url: urlPath, }))
    }
  }, [open])

  function handleToggleDisable() {
    dispatch(toggleDisable())
  }

  function handleChangeAutoPlay() {
    setIsAutoPlay(!isAutoPlay)
  }

  function handleSaveVocab(vocab: VocabularyItem) {
    dispatch(saveVocabulary({
      url: urlPath,
      data: vocab
    }))
  }

  function handleAddMessage(message: Message) {
    dispatch(addMessageToLesson({
      url: urlPath,
      data: message
    }))
  }

  useEffect(() => {

    window.addEventListener('load', function () {
      setOriginalWidth(window.innerWidth)
      setIsFullLoaded(true)
    })

    if (open && isFullLoaded) {
      const newPixelWidth = window.innerWidth - drawerWidth
      document.body.style.width = `${newPixelWidth}px`
    } else if (!open && isFullLoaded) {
      document.body.style.width = `${originalWidth}px`
    }

    if (open && uiDisabled) {
      document.body.style.width = `${originalWidth}px`
    }

  }, [open, uiDisabled])

  if (uiDisabled || hideExtention || blaklist.some((url) => window.location.href.includes(url))) {
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
              position: "relative",
            }}
          >
            <Header setOpen={setOpen} onLogin={onLoginBackground} handleToggleDisable={handleToggleDisable} uiDisabled={uiDisabled} />
            {
              shouldShowSubscriptionForm && (
                <Box
                  sx={{
                    position: "fixed",
                    background: "rgba(0,0,0,0.5)",
                    height: "100%",
                    width: drawerWidth,
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    padding: "32px",
                    display: "flex",
                  }}
                >
                  <FormSubscription user={user} onLogin={onLoginBackground} />
                </Box>
              )
            }

            <>
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
                  <ChatModeProto isAutoPlay={isAutoPlay} handleAddMessage={handleAddMessage} chatHistory={chatHistory} />
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
              {mode === Mode.Summary &&
                <SummaryMode
                  url={urlPath}
                  summaries={summaries}
                  setSummaries={setSummaries}
                  setIsLoadingSummaries={setIsLoadingSummaries}
                  isLoadingSummaries={isLoadingSummaries}
                  setError={setError}
                />
              }
            </>
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
          const text = paragraph.textContent || paragraph.innerText
          const trimmedText = text.trim()
          const resp = await sendToBackground({
            name: "vocabsFromText",
            body: {
              text: trimmedText,
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

function Header({ setOpen, onLogin, handleToggleDisable, uiDisabled }) {
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
      {/* <Box onClick={onLogin}>
        <Avatar src="" />
      </Box> */}
      <FormControlLabel
        sx={{
          width: "100%",
          justifyContent: "flex-end",
          fontSize: 12,
          fontWeight: 600
        }}
        control={
          <Switch
            size="small"
            checked={uiDisabled}
            onChange={handleToggleDisable}
          />
        }
        label={chrome.i18n.getMessage("toggle_disable")}
      />
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
        sx={(theme) => ({
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          backgroundColor: selectedMode === Mode.Talk ? theme.palette.primary.main : "transparent",
          borderRight: "1px solid #dddddd",
          height: 48,
          color: selectedMode === Mode.Talk ? "#fff" : "#b4b4b4",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,  // Adjust this if you also want to use a theme color on hover
            border: "none",
            borderRight: "1px solid #dddddd",
            color: "#fff",
          },
        })}
        onClick={() => onClickButton(Mode.Talk)}
      >
        <RiSpeakLine size={16} />
        <Typography variant="body2" component="span" sx={{ marginLeft: 0.5, fontWeight: 600 }}>
          {chrome.i18n.getMessage("menu_chat")}
        </Typography>
      </Button>
      <Button
        sx={(theme) => ({
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          backgroundColor: selectedMode === Mode.Vocab ? theme.palette.primary.main : "transparent",
          borderRight: "1px solid #dddddd",
          height: 48,
          color: selectedMode === Mode.Vocab ? "#fff" : "#b4b4b4",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,  // Adjust this if you also want to use a theme color on hover
            border: "none",
            borderRight: "1px solid #dddddd",
            color: "#fff"
          },
        })}
        onClick={() => onClickButton(Mode.Vocab)}
      >
        <FaFileWord size={16} />
        <Typography variant="body2" component="span" sx={{ marginLeft: 0.5, fontWeight: 600 }}>
          {chrome.i18n.getMessage("menu_vocab")}
        </Typography>
      </Button>
      <Button
        sx={(theme) => ({
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          backgroundColor: selectedMode === Mode.Summary ? theme.palette.primary.main : "transparent",
          height: 48,
          color: selectedMode === Mode.Summary ? "#fff" : "#b4b4b4",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,  // Adjust this if you also want to use a theme color on hover
            border: "none",
            color: "#fff",
          },
        })}
        onClick={() => onClickButton(Mode.Summary)}
      >
        <TbVocabulary size={16} />
        <Typography variant="body2" component="span" sx={{ marginLeft: 0.5, fontWeight: 600 }}>
          {chrome.i18n.getMessage("menu_summary")}
        </Typography>
      </Button>
    </ButtonGroup>
  )
}
