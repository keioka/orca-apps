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
  Chip,
  Popover,
  Tooltip
} from "@mui/material"
import { IoPlayCircle, IoCloseCircle, IoMicOutline } from "react-icons/io5";
import { useFirebase } from "../firebase/hooks"
import { sendToBackground } from "@plasmohq/messaging"
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMessages, addUserMessage, createAIMessage } from "~redux/features/messages";
import { fetchCurrentOpenedMaterial, createVocabs, fetchVocabs, fetchSummaries } from "~redux/features/materials";
import { fetchSavedVocab, fetchSavedParaphrases, saveVocab } from "~redux/features/note";
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
import { fetchOrCreateLessonByMaterialId, fetchSampleResponses, clearSampleResponses } from "~/redux/features/lessons";
import { ButtonGoogleAuth } from "./ButtonGoogleAuth";
import mixpanel from "mixpanel-browser";

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

const levels = ["5Y", "K5", "A1", "A2", "B1", "B2", "C1", "C2"];

const description = {
  "5Y": "5 years old: knows only 250 basic words.",
  "K5": "Kindergarten: TOEIC < 220, TOEFL iBT < 42, IELTS < 4.0",
  "A1": "Beginner: TOEIC < 220, TOEFL iBT < 42, IELTS < 4.0",
  "A2": "Elementary: TOEIC 220 - 545, TOEFL iBT 42 - 71, IELTS 4.0",
  "B1": "Intermediate: TOEIC 546 - 780, TOEFL iBT 42 - 71, IELTS 4.0 - 5.0",
  "B2": "Upper Intermediate: TOEIC 780 - 940, TOEFL iBT 72 - 94, IELTS 5.5 - 6.5",
  "C1": "Advanced: TOEIC 941 - 990, TOEFL iBT 95 - 120, IELTS 7.0 - 8.0",
  "C2": "Proficient: IELTS 8.5 - 9.0"
}

export function Inject() {
  const urlPath = `${window.location.origin}${window.location.pathname}`
  const dispatch = useAppDispatch()
  const [url, setUrl] = useState(urlPath)
  const [hideExtention, setHideExtention] = useState(false)
  const [open, setOpen] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [mode, setMode] = useState(Mode.Talk)

  const [originalWidth, setOriginalWidth] = useState(0)
  const [error, setError] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const { user, session: sessionFB, isLoading, onLogin, onLoginBackground, onLogout, authCheck } = useFirebase()
  const [message, setMessage] = useState(null)
  const [isFullLoaded, setIsFullLoaded] = useState(false)

  const uiDisabled = useAppSelector(state => { return state.ui.disabled })
  const shouldShowSubscriptionForm = useAppSelector(state => { return !state.payment.isValidSubscription && state.ui.shouldShowSubscriptionForm })
  const currentUser = useAppSelector(state => { return state.auth.currentUser })
  const session = useAppSelector(state => { return state.auth.session })
  const currentOpenedMaterial = useAppSelector(state => { return state.materials.currentOpenedMaterial })
  const currentLesson = useAppSelector((state) => state.lesson.lessons.find((lesson) => lesson.materialId === currentOpenedMaterial?.id))
  const messages = useAppSelector((state) => currentLesson ? state.message.messageMap[currentLesson.id] || [] : [])
  const vocabs = useAppSelector(state => currentOpenedMaterial ? state.materials.vocabs[currentOpenedMaterial.id] || [] : [])
  const summaries = useAppSelector(state => currentOpenedMaterial ? state.materials.summaries[currentOpenedMaterial.id] || [] : [])

  const isCreatingMessage = useAppSelector((state) => state.message.isCreatingMessage)
  const isFetchingVocabs = useAppSelector((state) => state.materials.isFetchingVocabs)
  const isFetchingSummary = useAppSelector((state) => state.materials.isFetchingSummary)
  const isCreatingVocabs = useAppSelector((state) => state.materials.isCreatingVocabs)

  const errorSigninMessage = useAppSelector((state) => state.auth.errorSigninMessage)
  const errorSignupMessage = useAppSelector((state) => state.auth.errorSignupMessage)
  const errorCreateAIMessage = useAppSelector(state => state.message.errorCreateAIMessage)
  const errorFetchCurrentOpenedMaterial = useAppSelector(state => state.materials.errorFetchCurrentOpenedMaterial)

  useEffect(() => {
    dispatch({ type: "global/RESET_STATE" });
    dispatch(clearSampleResponses())
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
    if (currentOpenedMaterial && currentOpenedMaterial.id && session) {
      dispatch(fetchOrCreateLessonByMaterialId(currentOpenedMaterial.id))
    }
  }, [open, currentOpenedMaterial, session, currentUser])

  useEffect(() => {
    if (!open) return
    if (errorCreateAIMessage) return
    if (!isCreatingMessage && currentLesson && !currentLesson.initMessage && messages.length === 0) {
      dispatch(createAIMessage({ message: "Ask me a question about the news.", lessonId: currentLesson.id }))
    }
  }, [open, isCreatingMessage, currentLesson, messages])

  useEffect(() => {
    if (!open) return
    if (currentOpenedMaterial && currentOpenedMaterial.id) {
      dispatch(fetchVocabs({ materialId: currentOpenedMaterial.id }))
      dispatch(fetchSummaries({ materialId: currentOpenedMaterial.id, levels: ["5Y"] }))
    }
  }, [open, currentOpenedMaterial])

  useEffect(() => {
    if (!open) return
    if (currentOpenedMaterial && currentOpenedMaterial.id && !isCreatingVocabs && !isFetchingVocabs && vocabs.length === 0) {
      dispatch(createVocabs({ materialId: currentOpenedMaterial.id }))
    }
  }, [open, currentOpenedMaterial, isFetchingVocabs])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("================ onMessage ====================")
      if (request.name === "logout") {
        console.log("onMessage > logout")
        onLogout()
      }

      if (request.name === "urlChange") {
        console.log("onMessage > urlChanged")
        setUrl(request.url)
        sendResponse(true)
      }
    })
  }, [])

  const messageSorted = useMemo(() => {
    if (!messages) return []
    return [...messages].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [messages])

  async function handleSignup() {
    mixpanel.track("ACT:signup")
    const userCred = await onLoginBackground()
    dispatch(signup({ accessToken: userCred.accessToken, uid: userCred.uid }))
  }

  async function handleSignin() {
    mixpanel.track("ACT:signin")
    const userCred = await onLoginBackground()
    dispatch(login({ accessToken: userCred.accessToken, uid: userCred.uid }))
  }

  function handleOpen(shouldOpen: boolean) {
    mixpanel.track("ACT:openExtension")
    setOpen(shouldOpen)
  }

  function handleHideExtension(shouldHide: boolean) {
    mixpanel.track("ACT:hideExtension")
    setHideExtention(shouldHide)
  }


  function handleToggleDisable() {
    dispatch(toggleDisable())
  }

  function handleChangeAutoPlay() {
    setIsAutoPlay(!isAutoPlay)
  }

  function handleSaveVocab(vocab: VocabularyItem) {
    mixpanel.track("ACT:saveVocab")
    dispatch(saveVocab({
      vocabId: vocab.id
    }))
  }

  function handleSelectLevel(level: string) {
    if (currentOpenedMaterial) {
      dispatch(fetchSummaries({ materialId: currentOpenedMaterial.id, levels: [level] }))
    }
  }

  function handleSubmitMessage(message: Message) {
    mixpanel.track("ACT:submitMessage")
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

  function handleSetMode(mode: Mode) {
    let modeName

    switch (mode) {
      case Mode.Talk:
        modeName = "Chat"
        break
      case Mode.Vocab:
        modeName = "Vocab"
        break
      case Mode.Summary:
        modeName = "Summary"
        break
    }

    mixpanel.track(`NAV:Mode${modeName}`)
    setMode(mode)
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

            {errorCreateAIMessage && (
              <Alert
                color="error"
                severity="error"
                sx={{ position: "relative" }}
              >
                {errorCreateAIMessage}
              </Alert>
            )}
            {errorFetchCurrentOpenedMaterial && <Alert color="error" severity="error">{chrome.i18n.getMessage("error_failed_to_fetch_material")}</Alert>}

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
              !isLoading && !currentUser && (
                <Stack
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "32px"
                  }}
                  spacing={2}
                >
                  <Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {chrome.i18n.getMessage("welcome_orca")}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#444444" }}>
                      {chrome.i18n.getMessage("welcome_orca_desc")}
                    </Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ color: "#444444" }}>
                    {chrome.i18n.getMessage("message_signin")}
                  </Typography>
                  {errorSigninMessage && <Alert severity="error">{errorSigninMessage}</Alert>}
                  {errorSignupMessage && <Alert severity="error">{errorSignupMessage}</Alert>}
                  <ButtonGoogleAuth
                    size="large"
                    onClick={handleSignup}
                    isSignup
                  />
                  <Typography>or</Typography>
                  <ButtonGoogleAuth
                    size="large"
                    onClick={handleSignin}
                  />
                </Stack>
              )
            }

            {!isLoading && currentUser && (
              <>
                <Box mt={2}>
                  <Tabs onClickButton={handleSetMode} selectedMode={mode} />
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
                      {/* <FormControlLabel
                        control={
                          <Switch
                            checked={isAutoPlay}
                            onChange={handleChangeAutoPlay}
                          />
                        }
                        label={chrome.i18n.getMessage("chat_toggle_autoplay")}
                      /> */}
                    </Box>
                    <ChatModeProto
                      isAutoPlay={isAutoPlay}
                      handleSubmitMessage={handleSubmitMessage}
                      isCreatingMessage={isCreatingMessage}
                      messages={messageSorted}
                      currentLesson={currentLesson}
                    />
                  </>
                )}
                {mode === Mode.Vocab &&
                  <VocabMode
                    vocabs={vocabs}
                    isLoadingVocabs={isFetchingVocabs}
                    setError={setError}
                    onSaveVocab={handleSaveVocab}
                  />
                }
                {mode === Mode.Summary &&
                  <SummaryMode
                    summaries={summaries}
                    isLoadingSummaries={isFetchingSummary}
                    onSelectLevel={handleSelectLevel}
                  />
                }
              </>
            )}
          </Box>
        </Drawer>
      }

      <Opener setOpen={handleOpen} setHideExtention={handleHideExtension} />
    </Box >
  )
}

type Level = "all" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

function VocabMode({
  vocabs,
  onSaveVocab,
}) {
  const dispatch = useAppDispatch()
  const materialId = useAppSelector(state => state.materials.currentOpenedMaterial?.id)
  const savedVocabs = useAppSelector(state => state.note.vocabularies || [])
  const [levelsFilter, setLevelsFilter] = useState<Level[]>([])

  const filteredVocabs = useMemo(() => {
    if (levelsFilter.length === 0) {
      return vocabs
    }

    return vocabs.filter((vocab) => {
      if (!vocab.level) return true
      return levelsFilter.includes(vocab.level)
    })
  }, [vocabs, levelsFilter])

  useEffect(() => {
    if (vocabs.length > 0) {
      return
    }

    if (!materialId) {
      return
    }

    dispatch(fetchSavedVocab({ materialId: materialId }))

    const fetchVocabsInterval = setInterval(() => {
      dispatch(fetchVocabs({ materialId: materialId }))
    }, 5000);

    dispatch(createVocabs({ materialId: materialId }))

    return () => {
      clearInterval(fetchVocabsInterval)
    }

  }, [])

  const handleClickFilter = (level: string) => {
    if (level === "all") {
      setLevelsFilter([])
      return
    }

    if (levelsFilter.includes(level)) {
      setLevelsFilter(levelsFilter.filter((l) => l !== level))
    } else {
      setLevelsFilter([...levelsFilter, level])
    }
  }


  const levels = [
    "all", "A1", "A2", "B1", "B2", "C1", "C2"
  ]


  return (
    <Box mt={2}>
      <Stack
        direction="row"
        spacing={0.5}
        py={1}
        sx={{ position: "relative" }}
      >
        {levels.map((level: Level) => {
          return (
            <Tooltip
              title={description[level]}
              PopperProps={{
                disablePortal: true,
                popperOptions: {
                  positionFixed: true,
                  modifiers: {
                    preventOverflow: {
                      enabled: true,
                      boundariesElement: "window" // where "window" is the boundary
                    }
                  }
                }
              }}
            >
              <Chip
                key={level}
                label={level}
                onClick={() => {
                  handleClickFilter(level)
                }}
                color={levelsFilter.includes(level) || (levelsFilter.length === 0 && level === "all") ? "primary" : "default"}
              />
            </Tooltip>
          )
        })}
      </Stack>
      <ListVocab vocabs={filteredVocabs} savedVocabs={savedVocabs} isLoading={!vocabs || vocabs.length === 0} onSaveVocab={onSaveVocab} />
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
    handleMenuClose()
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
          <Typography variant="body2" sx={{ color: "#c4c4c4" }}>
            <Box onClick={handleMenuClose}>
              <IoCloseCircle size={18} color="#dddddd" />
            </Box>
          </Typography>

          <Box sx={{ paddingY: 1, borderTop: "1px solid #f4f4f4" }}>
            <Typography
              onClick={() => {
                mixpanel.track("NAV:openNote")
                sendToBackground({ name: "openNote" })
                handleMenuClose()
              }}
            >
              {chrome.i18n.getMessage("popup_button_open_note")}
            </Typography>
          </Box>
          <Box sx={{ paddingY: 1, borderTop: "1px solid #f4f4f4" }}>
            <Typography onClick={handleSignout} fontSize="h6">{chrome.i18n.getMessage("signout")}</Typography>
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
