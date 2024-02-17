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
  Menu,
  MenuItem,
} from "@mui/material"
import { IoPlayCircle, IoCloseCircle, IoMicOutline } from "react-icons/io5";
import { useFirebase } from "../firebase/hooks"
import { sendToBackground } from "@plasmohq/messaging"
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLesson } from '../redux/features/lessons';
// import { fetchMessages, createMessage, addMessage } from '~redux/features/messagesLocal';
import { fetchMessages, addUserMessage, createAIMessage } from "~redux/features/messages";
import { fetchCurrentOpenedMaterial, createVocabs, fetchVocabs } from "~redux/features/materials";
import { fetchSavedVocab, saveVocab } from "~redux/features/note";
import { clearState, removeAll } from "../redux/store";
import { Opener } from "./Opener";
import { ChatModeProto } from "./ChatModeProto";
import { RiSpeakLine } from "react-icons/ri";
import { TbVocabulary } from "react-icons/tb";
import { FaFileWord } from "react-icons/fa";
import { ListVocab } from "./ListVocab";
import { toggleDisable, clearSubscriptionForm } from "~redux/features/ui";
import type { VocabularyItem, Message } from "~types";
import { SummaryMode } from "./SummaryMode";
import { FormSubscription } from "./FormSubscription";
import { fetchCurrentUser, setSession, setCurrentUser } from "~/redux/features/auth";
import { fetchOrCreateLessonByMaterialId } from "~/redux/features/lessons";

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
  const urlPath = `${window.location.origin}${window.location.pathname}`
  const [url, setUrl] = useState(urlPath)
  const [hideExtention, setHideExtention] = useState(false)
  const [open, setOpen] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [mode, setMode] = useState(Mode.Talk)
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [isLoadingVocabs, setIsLoadingVocabs] = useState(false)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false)

  const [originalWidth, setOriginalWidth] = useState(0)
  const [error, setError] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const { user, session: sessionFB, isLoading, onLogin, onLoginBackground, onLogout, authCheck } = useFirebase()
  const [message, setMessage] = useState(null)
  const [isFullLoaded, setIsFullLoaded] = useState(false)
  const dispatch = useAppDispatch()
  const note = useAppSelector(state => { return state.saveData[url] })
  const uiDisabled = useAppSelector(state => { return state.ui.disabled })
  const shouldShowSubscriptionForm = useAppSelector(state => { return !state.payment.isValidSubscription && state.ui.shouldShowSubscriptionForm })
  const currentUser = useAppSelector(state => { return state.auth.currentUser })
  const session = useAppSelector(state => { return state.auth.session })
  const currentOpenedMaterial = useAppSelector(state => { return state.materials.currentOpenedMaterial })
  const currentLesson = useAppSelector((state) => state.lesson.lessons.find((lesson) => lesson.materialId === currentOpenedMaterial?.id))
  const messages = useAppSelector((state) => currentLesson ? state.message.messageMap[currentLesson.id] || [] : [])
  const isCreatingMessage = useAppSelector((state) => state.message.creatingMessage)

  useEffect(() => {
    authCheck()
  }, [])

  useEffect(() => {
    if (!open) return
    dispatch(setSession(sessionFB))
  }, [open, sessionFB])

  useEffect(() => {
    if (!user) return
    dispatch(setCurrentUser(null))
  }, [user])

  useEffect(() => {
    if (!open) return
    if (session) {
      dispatch(fetchCurrentUser())
    }
  }, [open, session])

  console.log({ open, currentOpenedMaterial, url })

  useEffect(() => {
    if (!open) return
    if (!currentOpenedMaterial || currentOpenedMaterial.url !== url) {
      dispatch(fetchCurrentOpenedMaterial(url))
    }
  }, [open, url, currentOpenedMaterial])

  useEffect(() => {
    if (!open) return
    if (currentLesson) {
      dispatch(fetchMessages(currentLesson.id))
    }
    dispatch(clearSubscriptionForm())
  }, [open, currentLesson])


  useEffect(() => {
    if (!open) return
    if (currentOpenedMaterial && currentUser) {
      dispatch(fetchOrCreateLessonByMaterialId(currentOpenedMaterial.id))
    }
  }, [open, currentOpenedMaterial, currentUser])

  console.log({
    messages,
    currentLesson,
    isCreatingMessage,
    currentOpenedMaterial,
    currentUser,
    url
  })
  useEffect(() => {
    if (!open) return
    if (!isCreatingMessage && currentLesson && !currentLesson.initMessage && messages.length === 0) {
      dispatch(createAIMessage({ message: "Ask me a question about the news.", lessonId: currentLesson.id }))
    }
  }, [open, isCreatingMessage, currentLesson, messages])

  useEffect(() => {
    if (!open) return
    if (currentOpenedMaterial) {
      dispatch(fetchVocabs({ materialId: currentOpenedMaterial.id }))
      dispatch(fetchMessages(currentOpenedMaterial.id))
    }
  }, [open, currentOpenedMaterial])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("================ onMessage ====================")
      console.log({ request, sender, sendResponse })
      if (request.name === "logout") {
        console.log("logout")
        onLogout()
      }

      if (request.name === "urlChange") {
        console.log("urlChanged")
        setUrl(request.url)
        sendResponse(true)
      }
    })
  }, [])

  function handleToggleDisable() {
    dispatch(toggleDisable())
  }

  function handleChangeAutoPlay() {
    setIsAutoPlay(!isAutoPlay)
  }

  function handleSaveVocab(vocab: VocabularyItem) {
    dispatch(saveVocab({
      vocabId: vocab.id
    }))
  }

  function handleSubmitMessage(message: Message) {
    if (currentLesson) {
      dispatch(
        addUserMessage({
          lessonId: currentLesson.id,
          message,
        })
      )
      dispatch(
        createAIMessage({
          lessonId: currentLesson.id,
          message,
        })
      )
    }
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

            {
              !currentUser && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "32px"
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onLoginBackground}
                  >
                    {chrome.i18n.getMessage("login_google")}
                  </Button>
                </Box>
              )
            }

            {currentUser && (
              <>
                <Box mt={2}>
                  <Tabs onClickButton={(mode) => setMode(mode)} selectedMode={mode} />
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
                    <ChatModeProto isAutoPlay={isAutoPlay} handleSubmitMessage={handleSubmitMessage} messages={messages} />
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
                    url={url}
                    summaries={summaries}
                    setSummaries={setSummaries}
                    setIsLoadingSummaries={setIsLoadingSummaries}
                    isLoadingSummaries={isLoadingSummaries}
                    setError={setError}
                  />
                }
              </>
            )}
          </Box>
        </Drawer>
      }

      <Opener setOpen={setOpen} setHideExtention={setHideExtention} />
    </Box >
  )
}

function VocabMode({
  setVocabs,
  setIsLoadingVocabs,
  isLoadingVocabs,
  setError,
  onSaveVocab
}) {

  const dispatch = useAppDispatch()
  const materialId = useAppSelector(state => state.materials.currentOpenedMaterial?.id)
  const vocabs = useAppSelector(state => state.materials.vocabs[materialId] || [])
  const savedVocabs = useAppSelector(state => state.note.vocabularies || [])

  useEffect(() => {
    dispatch(fetchSavedVocab({ materialId: materialId }))

    if (vocabs.length > 0) {
      return
    }
    const fetchVocabsInterval = setInterval(() => {
      dispatch(fetchVocabs({ materialId: materialId }))
    }, 5000);

    // setIsLoadingVocabs(true);

    // try {
    //   // Select all paragraphs in the DOM
    //   const paragraphs = Array.from(document.querySelectorAll('p'));

    //   // Loop over each paragraph
    //   for (const paragraph of paragraphs) {
    //     // Send the text content of the paragraph to the background
    //     const text = paragraph.textContent || paragraph.innerText
    //     const trimmedText = text.trim()
    //     const resp = await sendToBackground({
    //       name: "vocabsFromText",
    //       body: {
    //         text: trimmedText,
    //       },
    //     });

    //     if (resp.error) {
    //       // Handle error
    //       setError(resp.error);
    //     } else {
    //       setIsLoadingVocabs(false);
    //       // Update the vocabs state with the returned vocabs
    //       setVocabs(prevVocabs => [...prevVocabs, ...resp.vocabs]);
    //     }
    //   }
    // } catch (e) {
    //   console.error(e);
    // }

    dispatch(createVocabs({ materialId: materialId }))


    return () => {
      clearInterval(fetchVocabsInterval)
    }

  }, [])


  return (
    <Box mt={2}>
      <ListVocab vocabs={vocabs} savedVocabs={savedVocabs} isLoading={isLoadingVocabs} onSaveVocab={onSaveVocab} />
    </Box>
  )
}

function Header({ setOpen, onLogin, handleToggleDisable, uiDisabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { onLogout } = useFirebase()
  const dispatch = useAppDispatch()
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignout = () => {
    onLogout()
  }

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        paddingBottom: 1,
        borderBottom: "1px solid #f2f2f2",
        position: "relative"
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
      <Avatar
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleMenuOpen}
      // alt={currentUser.username}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id="basic-menu"
        MenuListProps={{
          sx: {
            position: "absolute",
          },
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem>
          hello
        </MenuItem>
        <MenuItem onClick={handleSignout}>
          Signout
        </MenuItem>
      </Menu>
    </Stack>
  )
}

function Tabs({
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
        <Typography variant="body1" component="span" sx={{ marginLeft: 0.5, fontWeight: 600 }}>
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
