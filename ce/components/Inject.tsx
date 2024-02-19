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
  Alert,
  Popover
} from "@mui/material"
import { IoPlayCircle, IoCloseCircle, IoMicOutline } from "react-icons/io5";
import { useFirebase } from "../firebase/hooks"
import { sendToBackground } from "@plasmohq/messaging"
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLesson } from '../redux/features/lessons';
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
import { fetchCurrentUser, setSession, login, signup } from "~/redux/features/auth";
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
  const uiDisabled = useAppSelector(state => { return state.ui.disabled })
  const shouldShowSubscriptionForm = useAppSelector(state => { return !state.payment.isValidSubscription && state.ui.shouldShowSubscriptionForm })
  const currentUser = useAppSelector(state => { return state.auth.currentUser })
  const session = useAppSelector(state => { return state.auth.session })
  const currentOpenedMaterial = useAppSelector(state => { return state.materials.currentOpenedMaterial })
  const currentLesson = useAppSelector((state) => state.lesson.lessons.find((lesson) => lesson.materialId === currentOpenedMaterial?.id))
  const messages = useAppSelector((state) => currentLesson ? state.message.messageMap[currentLesson.id] || [] : [])
  const isCreatingMessage = useAppSelector((state) => state.message.isCreatingMessage)
  const errorSigninMessage = useAppSelector((state) => state.auth.errorSigninMessage)
  const errorSignupMessage = useAppSelector((state) => state.auth.errorSignupMessage)

  useEffect(() => {
    dispatch({ type: "global/RESET_STATE" });
    authCheck()
  }, [])

  // set session from Firebase to Redux State
  useEffect(() => {
    if (!open) return
    dispatch(setSession(sessionFB))
  }, [open, sessionFB])

  useEffect(() => {
    if (!open) return
    if (session) {
      dispatch(fetchCurrentUser())
    }
  }, [open, session])

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
    if (currentOpenedMaterial && session) {
      dispatch(fetchOrCreateLessonByMaterialId(currentOpenedMaterial.id))
    }
  }, [open, currentOpenedMaterial, session])

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
    }
  }, [open, currentOpenedMaterial])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("================ onMessage ====================")
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

  async function handleSignup() {
    const userCred = await onLoginBackground()
    console.log({ userCred })
    dispatch(signup({ accessToken: userCred.accessToken, uid: userCred.uid }))
  }

  async function handleSignin() {
    const userCred = await onLoginBackground()
    console.log({ userCred })
    dispatch(login({ accessToken: userCred.accessToken, uid: userCred.uid }))
  }

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
                <Stack
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "32px"
                  }}
                  spacing={2}
                >
                  {errorSigninMessage && <Alert severity="error">{errorSigninMessage}</Alert>}
                  {errorSignupMessage && <Alert severity="error">{errorSignupMessage}</Alert>}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSignin}
                  >
                    {chrome.i18n.getMessage("login_google")}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSignup}
                  >
                    {chrome.i18n.getMessage("signup_google")}
                  </Button>
                </Stack>
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
    <Stack>
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

      </Stack>
      {open &&
        <Stack
          sx={{
            width: "100%",
            borderRadius: 4,
            border: "1px solid #f2f2f2",
            padding: 2,
            marginTop: 1,
          }}
          spacing={1}
        >
          <Typography variant="body2" sx={{ color: "#c4c4c4" }}>Menu</Typography>
          <Box sx={{ paddingY: 1, borderTop: "1px solid #f4f4f4" }}>
            <Typography onClick={handleSignout} fontSize="h6">{chrome.i18n.getMessage("signout")}</Typography>
          </Box>
          <Box sx={{ paddingY: 1, borderTop: "1px solid #f4f4f4" }}>
            <Typography
              onClick={() => {
                console.log({ chrome })
                sendToBackground({ name: "openNote" })
              }}
            >
              {chrome.i18n.getMessage("popup_button_open_note")}
            </Typography>
          </Box>
          <Box sx={{ paddingY: 1, borderTop: "1px solid #f4f4f4" }}>
            <Typography onClick={handleMenuClose}>Close Menu</Typography>
          </Box>
        </Stack>
      }
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
