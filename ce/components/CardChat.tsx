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
import { CardSmParaphrase } from "./CardSmParaphrase"
import { sendToBackground } from "@plasmohq/messaging"
import { useSentence } from "../hooks/card"
import { IoPlay } from "react-icons/io5"
import { LoaderBounce } from "./LoaderBounce"
import Avator from "~assets/images/ai_avatar.png"
import { BsFillCaretLeftFill } from "react-icons/bs"
import { BsFillCaretRightFill } from "react-icons/bs"
import { RxCrossCircled } from "react-icons/rx"
import { RxCheckCircled } from "react-icons/rx"

enum Tab {
  Paraphrase = "paraphrase",
  GMCheck = "gmcheck"
}

const synth = window.speechSynthesis;

export function CardChat({ content, type = "ai", loading, isAutoPlay }) {
  const [error, setError] = useState(null)
  const { currentSentence, currentSentenceIndex, numSentences, messageSentences, selectNextSentence, selectPreviousSentence } = useSentence(content)
  const [currentTab, setCurrentTab] = useState<Tab>(null)

  const [isLoadingParaphrase, setIsLoadingParaphrase] = useState(false)
  const [isLoadingGMCheck, setIsLoadingGMCheck] = useState(false)
  const [isLoadingTranlate, setIsLoadingTranslate] = useState(false)

  const [paraphrase, setParaphrase] = useState({})
  const [gmCheck, setGMCheck] = useState({})

  const [translate, setTranslate] = useState(null)

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
    setIsLoadingParaphrase(true)
    setCurrentTab(Tab.Paraphrase)
    const resp = await sendToBackground({
      name: "paraphrase",
      body: {
        sentence: currentSentence
      }
    })

    console.log("orca", { resp })

    if (resp.error) {
      setError(resp.error)
      return
    }

    setParaphrase({ ...paraphrase, [currentSentenceIndex]: resp.phrases })
    setIsLoadingParaphrase(false)
  }

  async function handleClickGMCheck() {
    setIsLoadingGMCheck(true)
    setCurrentTab(Tab.GMCheck)
    const resp = await sendToBackground({
      name: "gmCheck",
      body: {
        sentence: currentSentence
      }
    })

    console.log({ resp })

    if (resp.error) {
      setError(resp.error)
      return
    }


    setGMCheck({ ...gmCheck, [currentSentenceIndex]: resp.gmCheck })
    setIsLoadingGMCheck(false)
  }

  function handlePlayAudio() {
    const voices = synth.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
    console.log(englishVoices)

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "en-US";

    if (englishVoices.length) {
      utterance.voice = englishVoices.find(voice => voice.name === 'Google US English');
    }

    synth.speak(utterance);
  }

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
        <Avatar src={type === "ai" ? Avator : ""} sx={{ width: 24, height: 24 }} />
      </Box>
      <Card
        sx={{
          width: "100%",
          height: "auto",
          padding: 2,
          borderRadius: type === "ai" ? "16px 16px 16px 0px" : "16px 16px 0px 16px",
          boxShadow: "none",
          backgroundColor: type === "ai" ? "#f0f8ff" : "#f4f4f4",
        }}
      >
        <CardContent sx={{ padding: 0, paddingTop: 1 }}>
          {!isOpenPanel && (
            <Typography component="span" sx={{ fontSize: 16 }}>{messageSentences.join(" ")}</Typography>
          )}
          {isOpenPanel && messageSentences.map((sentence, index) => {
            if (index === currentSentenceIndex) {
              return (
                <>
                  <Typography component="span" sx={{ fontSize: 16, background: "rgba(234,234,168,0.7)" }}>
                    {sentence}
                  </Typography>
                  {" "}
                </>
              )
            }
            return (
              <>
                <Typography component="span" sx={{ fontSize: 16 }}>
                  {sentence}
                </Typography>
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
                  currentTab === Tab.Paraphrase && paraphrase[currentSentenceIndex] && paraphrase[currentSentenceIndex].map((item) => {
                    return (
                      <Box my={2}>
                        <CardSmParaphrase item={item} />
                      </Box>
                    )
                  })
                }
                {
                  currentTab === Tab.GMCheck && gmCheck[currentSentenceIndex] && gmCheck[currentSentenceIndex].map((item) => {
                    return (
                      <Stack sx={{ border: "1px solid #e8e8e8", background: "#fff", borderRadius: 1, padding: 1, marginY: 1 }} spacing={1}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <RxCrossCircled color="#ff0000" />
                          <Typography>
                            {item.text}
                          </Typography>
                        </Stack>
                        {item.suggestions && item.suggestions.map((suggestionItem) => {
                          return (
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              <RxCheckCircled color="#00b600" />
                              <Typography>
                                {suggestionItem.suggestion}
                              </Typography>
                            </Stack>
                          )
                        })}
                      </Stack>
                    )
                  })
                }
              </Box>
              <Stack direction="row" mt={1} sx={{ alignItems: "center", justifyContent: "center" }}>
                <Box onClick={selectPreviousSentence} sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginRight: 1 }}>
                  <BsFillCaretLeftFill color="#787c80" />
                </Box>
                <Typography color="787c80">{currentSentenceIndex + 1} / {numSentences}</Typography>
                <Box onClick={selectNextSentence} sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 1 }}>
                  <BsFillCaretRightFill color="#787c80" />
                </Box>
              </Stack>
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
                    {chrome.i18n.getMessage("chat_card_button_translate")}
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