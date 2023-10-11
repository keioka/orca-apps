import { useEffect, useState } from "react"
import {
  Button,
  Input,
  Link,
  Stack,
  Typography,
  Box,
  Drawer,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Alert,
  Avatar,
  LinearProgress
} from "@mui/material"
import { sendToBackground } from "@plasmohq/messaging"
import { IoPlay } from "react-icons/io5"
import { BsFillCaretLeftFill } from "react-icons/bs"
import { BsFillCaretRightFill } from "react-icons/bs"

import { LoaderBounce } from "./LoaderBounce"
import { useSentence } from "../hooks/card"
// import Avator from "~assets/images/ai_avatar.png"
import { CardSmGMCheck } from "./CardSmGMCheck"
import { CardSmParaphrase } from "./CardSmParaphrase"
import { saveParaphrases, saveGrammarMistakes } from "~redux/features/save"
import { useAppDispatch, useAppSelector } from "~redux/hooks"
import { toggleSubscriptionForm } from "~redux/features/ui"
import type { ParaphraseItem, GMCheckItem } from "~types"
import styled from "@emotion/styled"

const TypoEn = styled(Typography)`
  font-size: 14px;
  font-weight: 600;
  color: #00232f;
  letter-spacing: 0px;
`

enum Tab {
  Paraphrase = "paraphrase",
  GMCheck = "gmcheck"
}

interface CardChatProps {
  content: string;
  type?: "ai" | "human";
  loading?: boolean;
  isAutoPlay?: boolean;
  url: string;
}

interface CardChatPureProps {
  type?: "ai" | "human";
  loading?: boolean;
  handleClickGMCheck: () => void;
  handleClickParaphrase: () => void;
  handleClickTranslate: (sentence: string) => void;
  handlePlayAudio: () => void;
  handleSaveGMCheck: (suggestions: string[]) => void;
  handleSaveParaphrase: (suggestionSentence: string) => void;
  translate: string | null;
  isLoadingGMCheck: boolean;
  isLoadingParaphrase: boolean;
  currentTab: Tab | null;
  paraphrase: Record<number, ParaphraseItem[]>;
  gmCheck: Record<number, GMCheckItem[]>;
  currentSentenceIndex: number;
  numSentences: number;
  messageSentences: string[];
  selectNextSentence: () => void;
  selectPreviousSentence: () => void;
}


export function CardChat({ content, type = "ai", loading, isAutoPlay, url }: CardChatProps) {
  const [error, setError] = useState(null)
  const { currentSentence, currentSentenceIndex, numSentences, messageSentences, selectNextSentence, selectPreviousSentence } = useSentence(content)
  const [currentTab, setCurrentTab] = useState<Tab>(null)

  const [isLoadingParaphrase, setIsLoadingParaphrase] = useState(false)
  const [isLoadingGMCheck, setIsLoadingGMCheck] = useState(false)
  const [isLoadingTranlate, setIsLoadingTranslate] = useState(false)

  const [paraphrase, setParaphrase] = useState({})
  const [gmCheck, setGMCheck] = useState({})

  const [translate, setTranslate] = useState(null)

  const dispatch = useAppDispatch()
  const { isValidSubscription } = useAppSelector((state) => state.payment)


  useEffect(() => {
    if (type === "human" || loading || !isAutoPlay) return
    handlePlayAudio()
  }, [])

  useEffect(() => {
    if (currentTab === Tab.Paraphrase && !paraphrase[currentSentenceIndex]) {
      handleClickParaphrase()
    }

    if (currentTab === Tab.GMCheck && !gmCheck[currentSentenceIndex]) {
      handleClickGMCheck()
    }
  }, [currentSentenceIndex])

  function handleToggleSubscriptionForm() {
    dispatch(toggleSubscriptionForm())
  }

  async function handleClickTranslate(sentence: string) {
    if (translate) return

    setIsLoadingTranslate(true)
    const resp = await sendToBackground({
      name: "translate",
      body: {
        text: content
      }
    })

    if (resp.error) {
      setError(resp.error)
      return
    }

    setTranslate(resp.translation)
    setIsLoadingTranslate(false)
  }

  async function handleClickParaphrase() {
    if (!isValidSubscription) {
      handleToggleSubscriptionForm()
      return
    }
    setIsLoadingParaphrase(true)
    setCurrentTab(Tab.Paraphrase)
    const resp = await sendToBackground({
      name: "paraphrase",
      body: {
        sentence: currentSentence
      }
    })

    if (resp.error) {
      setError(resp.error)
      return
    }

    setParaphrase({ ...paraphrase, [currentSentenceIndex]: resp.phrases })
    setIsLoadingParaphrase(false)
  }

  async function handleClickGMCheck() {
    if (!isValidSubscription) {
      handleToggleSubscriptionForm()
      return
    }
    setIsLoadingGMCheck(true)
    setCurrentTab(Tab.GMCheck)
    const resp = await sendToBackground({
      name: "gmCheck",
      body: {
        sentence: currentSentence
      }
    })

    if (resp.error) {
      setError(resp.error)
      return
    }


    setGMCheck({ ...gmCheck, [currentSentenceIndex]: resp.gmCheck })
    setIsLoadingGMCheck(false)
  }

  function handlePlayAudio() {
    try {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "en-US";

      console.log({ englishVoices })
      if (englishVoices.length) {
        utterance.voice = englishVoices.find(voice => voice.name === 'Google US English');
      }

      synth.speak(utterance);
    } catch (err) {
      console.error(err)
    }
  }

  function handleSaveParaphrase({ sentence }: { sentence: string }) {
    dispatch(
      saveParaphrases({
        url,
        data: {
          paraphrase: sentence,
          originalSentence: currentSentence
        },
      })
    )
  }

  function handleSaveGMCheck(gmCheck: GMCheckItem) {
    dispatch(
      saveGrammarMistakes({
        url,
        data: gmCheck,
        originalSentence: currentSentence
      })
    )
  }

  return (
    <CardChatPure
      type={type}
      loading={loading}
      handleClickGMCheck={handleClickGMCheck}
      handleClickParaphrase={handleClickParaphrase}
      handleClickTranslate={handleClickTranslate}
      handlePlayAudio={handlePlayAudio}
      handleSaveGMCheck={handleSaveGMCheck}
      handleSaveParaphrase={handleSaveParaphrase}
      translate={translate}
      isLoadingGMCheck={isLoadingGMCheck}
      isLoadingParaphrase={isLoadingParaphrase}
      currentTab={currentTab}
      paraphrase={paraphrase}
      gmCheck={gmCheck}
      currentSentenceIndex={currentSentenceIndex}
      numSentences={numSentences}
      messageSentences={messageSentences}
      selectNextSentence={selectNextSentence}
      selectPreviousSentence={selectPreviousSentence}
    />
  )
}

export function CardChatPure({
  type = "ai",
  loading,
  handleClickGMCheck,
  handleClickParaphrase,
  handleClickTranslate,
  handlePlayAudio,
  handleSaveGMCheck,
  handleSaveParaphrase,
  translate,
  isLoadingGMCheck,
  isLoadingParaphrase,
  currentTab,
  paraphrase,
  gmCheck,
  currentSentenceIndex,
  numSentences,
  messageSentences,
  selectNextSentence,
  selectPreviousSentence
}: CardChatPureProps) {
  const [error, setError] = useState(null)

  const isOpenPanel = type === "human" && currentTab !== null

  return (
    <Stack
      sx={{
        width: "100%",
        height: "auto",
      }}
      direction={type === "ai" ? "row" : "row-reverse"}
      spacing={1}
    >
      <Box
        sx={{
          display: "flex",
          height: "auto",
          alignItems: "flex-end",
        }}
        mb={1}
      >
        <Avatar src={type === "ai" ? "" : ""} sx={{ width: 24, height: 24 }} />
      </Box>
      <Card
        sx={(theme) => ({
          width: "100%",
          height: "auto",
          padding: 2,
          borderRadius: type === "ai" ? "16px 16px 16px 0px" : "16px 16px 0px 16px",
          boxShadow: "none",
          backgroundColor: type === "ai" ? theme.palette.customPalette.lightBlue : "#f4f4f4",
        })}
      >
        <CardContent sx={{ padding: 0, paddingTop: 1 }}>
          {!isOpenPanel && (
            <TypoEn component="span" sx={{ fontSize: 14 }}>{messageSentences.join(" ")}</TypoEn>
          )}
          {isOpenPanel && messageSentences.map((sentence, index) => {
            if (index === currentSentenceIndex) {
              return (
                <>
                  <TypoEn component="span" sx={{ fontSize: 14, background: "rgba(234,234,168,0.7)", fontWeight: 600 }}>
                    {sentence}
                  </TypoEn >
                  {" "}
                </>
              )
            }
            return (
              <>
                <TypoEn component="span" sx={{ fontSize: 14 }}>
                  {sentence}
                </TypoEn>
                {" "}
              </>
            )
          })}
          {loading && <LoaderBounce />}
        </CardContent>
        <CardActions sx={{ padding: 0, paddingTop: 2, width: "100%" }}>
          {type === "human" && (
            <Stack sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1}>
                <Button
                  sx={{
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "64px",
                    padding: "6px 12px",
                    backgroundColor: currentTab === Tab.GMCheck ? "#3c223c" : "rgba(0,0,0,0.1)",
                    "&:hover": {
                      backgroundColor: currentTab === Tab.GMCheck ? "#3c223c" : "rgba(0,0,0,0.1)",
                    }
                  }}
                  onClick={handleClickGMCheck}
                >
                  <Typography variant="caption" component="h6" sx={{ fontSize: 12, color: currentTab === Tab.GMCheck ? "#fff" : "#787c80", fontWeight: 700 }}>
                    {chrome.i18n.getMessage("chat_card_button_gm_check")}
                  </Typography>
                </Button>
                <Button
                  sx={{
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "64px",
                    padding: "6px 12px",
                    backgroundColor: currentTab === Tab.Paraphrase ? "#3c223c" : "rgba(0,0,0,0.1)",
                    "&:hover": {
                      backgroundColor: currentTab === Tab.Paraphrase ? "#3c223c" : "rgba(0,0,0,0.1)",
                    }
                  }}
                  onClick={handleClickParaphrase}
                >
                  <Typography variant="caption" component="h6" sx={{ fontSize: 12, color: currentTab === Tab.Paraphrase ? "#fff" : "#787c80", fontWeight: 700 }}>
                    {chrome.i18n.getMessage("chat_card_button_paraphrase")}
                  </Typography>
                </Button>
              </Stack>
              <Box>
                {isLoadingParaphrase &&
                  <Box sx={{ marginTop: 1 }}>
                    <LinearProgress />
                    <Typography>
                      {chrome.i18n.getMessage("chat_card_paraphrase_loading")}
                    </Typography>
                  </Box>
                }
                {isLoadingGMCheck &&
                  <Box sx={{ marginTop: 1 }}>
                    <LinearProgress />
                    <Typography>
                      {chrome.i18n.getMessage("chat_card_gmcheck_loading")}
                    </Typography>
                  </Box>
                }
                {
                  currentTab === Tab.Paraphrase &&
                  paraphrase[currentSentenceIndex] &&
                  paraphrase[currentSentenceIndex].map((item) => {
                    return (
                      <Box my={2}>
                        <CardSmParaphrase item={item} onSave={() => handleSaveParaphrase(item)} />
                      </Box>
                    )
                  })
                }
                {
                  currentTab === Tab.GMCheck &&
                  gmCheck[currentSentenceIndex] &&
                  gmCheck[currentSentenceIndex].map((item) => {
                    return (
                      <Box my={2}>
                        <CardSmGMCheck item={item} onSave={() => handleSaveGMCheck(item)} />
                      </Box>
                    )
                  })
                }
              </Box>
              {currentTab && <Stack direction="row" mt={1} sx={{ alignItems: "center", justifyContent: "center" }}>
                <Box onClick={selectPreviousSentence} sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginRight: 1 }}>
                  <BsFillCaretLeftFill color="#787c80" size={16} />
                </Box>
                <Typography color="787c80" sx={{ fontSize: 12, fontWeight: "600" }} > {currentSentenceIndex + 1} / {numSentences}</Typography>
                <Box onClick={selectNextSentence} sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 1 }}>
                  <BsFillCaretRightFill color="#787c80" size={16} />
                </Box>
              </Stack>}
            </Stack>
          )}

          {type === "ai" && (
            <Stack sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1}>
                <Button
                  sx={{
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "64px",
                    padding: "6px 12px",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.1)",
                    }
                  }}
                  onClick={handleClickTranslate}
                >
                  <Typography variant="caption" component="h6" sx={{ fontSize: 12, color: "#787c80", fontWeight: 700 }}>
                    {chrome.i18n.getMessage("translate")}
                  </Typography>
                </Button>
                <Button
                  onClick={handlePlayAudio}
                  sx={{
                    borderRadius: '50%', // Makes it circular
                    width: 36,       // Example width
                    height: 36,      // Example height
                    padding: 0,          // Removes internal padding
                    minWidth: 0,         // Overriding MUI's min width
                    background: "rgba(0,0,0,0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.1)",
                    }
                  }}
                >
                  <IoPlay color="#787c80" size={12} />
                </Button>
              </Stack>
              <Box mt={1}>
                <Typography sx={{ fontSize: 16 }}>
                  {translate && (translate)}
                </Typography>
              </Box>
            </Stack>
          )}

        </CardActions>
      </Card>
    </Stack >
  )
}