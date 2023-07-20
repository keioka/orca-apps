import { useState, useRef, useMemo, useEffect } from "react";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Stack,
  Grid,
  Typography,
  Tabs,
  Tab,
  Box,
  Modal
} from "@mui/material";
import { SyncLoader, BarLoader } from 'react-spinners';
import { BsArrowRightCircleFill, BsArrowLeftCircleFill } from 'react-icons/bs'

const locale = {
  detail: {
    en: "Detail",
    ja: "詳細"
  },
  rephrase: {
    en: "Rephrase",
    ja: "言い換え表現"
  },
  grammar: {
    en: "Grammar",
    ja: "文法チェック"
  },
  mistake: {
    en: "Mistake",
    ja: "間違い"
  },
  reason: {
    en: "Reason",
    ja: "理由"
  },
  fix: {
    en: "Fix",
    ja: "修正提案"
  }
}

import axios from "axios";

const blacklist = [
  "Possible Wrong Punctuation"
]

let loading = false;
async function paraphrase({ text }: { text: string }) {
  if (loading) {
    return
  }
  loading = true
  // Proxied through our own API so the provider key never reaches the browser.
  const res = await fetch("/api/paraphrase", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    method: "POST"
  });
  loading = false
  return await res.json()
}

// Proxied through our own API so the provider key never reaches the browser.
async function grammarCheck({ text, language = 'en' }) {
  const res = await axios.post('/api/gmCheck', {
    sentence: text,
    provider: 'prowritingaid',
    language
  })

  return res.data
}

function getSentences(paragraph: string) {
  if (!paragraph) return []
  var regex = /(?<=[.!?]|[.!?]["'\])])(?:\s+(?=[A-Z0-9"\(]))|(?:\s+(?=(?:https?:\/\/|www\.)\S+[.!?]["'\])]))/g;
  const sentences = paragraph.split(regex);
  return sentences || [paragraph];
}

export function CardConvo({ message, loading }) {
  const [value, setValue] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [paraphrases, setParaphrases] = useState({})
  const [gmChecks, setGMChecks] = useState({})
  const [loadingParaphrase, setLoadingParaphrase] = useState(false)
  const [loadingGMChecks, setLoadingGMChecks] = useState(false)
  const isOpenPanel = value !== null;

  const messageSentences = useMemo(() => {
    if (!message.message) return []
    return getSentences(message.message)
  }, [message.message])

  const currentSentence = useMemo(() => {
    return messageSentences[currentSentenceIndex]
  }, [messageSentences, currentSentenceIndex])

  const numSentences = useMemo(() => {
    return messageSentences.length
  }, [messageSentences])

  const currentParaphrases = useMemo(() => {
    return paraphrases[currentSentence]
  }, [currentSentence, paraphrases])

  const currentGMChecks = useMemo(() => {
    return gmChecks[currentSentence]
  }, [currentSentence, gmChecks])


  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  async function checkParaphrase({ text }: { text: string }) {
    if (paraphrases && paraphrases[text]) {
      return
    }
    setLoadingParaphrase(true)
    const res = await paraphrase({ text })
    const suggestions = res.suggestions

    const newParaphrases = {
      ...paraphrases,
      [text]: suggestions
    }

    setParaphrases(newParaphrases)
    setLoadingParaphrase(false)
  }

  async function checkGMCheck({ text }: { text: string }) {
    if (gmChecks && gmChecks[text]) {
      return
    }
    setLoadingGMChecks(true)
    const res = await grammarCheck({ text })
    if (!res.gmCheck) {
      console.error(res)
      return
    }

    const newGMChecks = {
      ...gmChecks,
      [text]: res.gmCheck
    }

    setGMChecks(newGMChecks)
    setLoadingGMChecks(false)
  }

  const handleClickParaphrase = async () => {
    const currentSentence = messageSentences[currentSentenceIndex]
    checkParaphrase({ text: currentSentence })
  }

  const handleClickNextParaphrase = () => {
    const nextIndex = currentSentenceIndex + 1
    setCurrentSentenceIndex(nextIndex)
    const nextSentence = messageSentences[nextIndex]
    checkParaphrase({ text: nextSentence })
  }

  const handleClickPrevParaphrase = () => {
    const prevIndex = currentSentenceIndex - 1
    setCurrentSentenceIndex(prevIndex)
    const prevSentence = messageSentences[prevIndex]
    checkParaphrase({ text: prevSentence })
  }

  const handleClickGMCheck = async () => {
    const currentSentence = messageSentences[currentSentenceIndex]
    checkGMCheck({ text: currentSentence })
  }

  const handleClickNextGMCheck = () => {
    const prevIndex = currentSentenceIndex + 1
    setCurrentSentenceIndex(prevIndex)
    const prevSentence = messageSentences[prevIndex]
    checkGMCheck({ text: prevSentence })
  }

  const handleClickPrevGMCheck = () => {
    const prevIndex = currentSentenceIndex - 1
    setCurrentSentenceIndex(prevIndex)
    const prevSentence = messageSentences[prevIndex]
    checkGMCheck({ text: prevSentence })
  }

  return (
    <Box
      p={2}
      sx={{
        margin: 1,
        alignSelf: message.role === "ai" ? "flex-start" : "flex-end",
      }}>
      <Typography variant="body2" sx={{ color: "#9ac9c4" }}>{message.role === "ai" ? "AI Tutor" : "You"}</Typography>
      <Card
        sx={{
          borderRadius: 2,
          maxWidth: "480px",
          minWidth: "320px",
          // width: "fit-content",
          width: "100%",
          backgroundColor: message.role === "ai" ? "#E0F1EF" : "#fff",
          border: message.role === "ai" ? "none" : "1px solid #f1f1f1",
        }}>
        <CardContent
          sx={{
            paddingTop: 3,
            paddingBottom: 3,
            borderBottom: "1px solid #f4f4f4",
          }}
        >
          {loading && <SyncLoader color="#9FD1D5" margin={3} size={12} speedMultiplier={0.6} />}
          {messageSentences.map((sentence, index) => {
            return (
              <Typography
                key={index}
                component={"span"}
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  marginBottom: 1,
                  backgroundColor: isOpenPanel && index === currentSentenceIndex ? "#f8f4e0" : "transparent",
                  color: "#48504F"
                }}
              >
                {sentence}{" "}
              </Typography>
            )
          })}
        </CardContent>
        {
          message.role === "human" &&
          <CardActions sx={{ paddingY: 1 }}>
            <Stack sx={{ width: "100%" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                sx={{
                  paddingX: 1,
                  minHeight: "24px !important",
                  display: "flex",
                  justifyContent: "center !important",
                }}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "transparent",
                  }
                }}
              >
                <Tab label={locale.grammar.ja} sx={{ fontSize: 12 }} value="grammar" onClick={handleClickGMCheck} />
                <Tab label={locale.rephrase.ja} sx={{ fontSize: 12 }} value="rephrase" onClick={handleClickParaphrase} />
              </Tabs>
              {value !== null &&
                <Box
                  px={1}
                  mt={1}
                  sx={{
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                >
                  {value === "grammar" && <GrammarPanel
                    currentSentence={currentSentence}
                    numSentences={numSentences}
                    currentGMChecks={currentGMChecks}
                    currentSentenceIndex={currentSentenceIndex}
                    handleClickNextGMCheck={handleClickNextGMCheck}
                    handleClickPrevGMCheck={handleClickPrevGMCheck}
                    loading={loadingGMChecks}
                  />}
                  {value === "rephrase" && <ParaphrasePanel
                    currentSentence={currentSentence}
                    numSentences={numSentences}
                    currentSentenceIndex={currentSentenceIndex}
                    currentParaphrases={currentParaphrases}
                    handleClickNextParaphrase={handleClickNextParaphrase}
                    handleClickPrevParaphrase={handleClickPrevParaphrase}
                    loadingParaphrase={loadingParaphrase}
                  />}
                </Box>
              }
            </Stack>
          </CardActions>
        }
      </Card >
    </Box>
  )
}

function GrammarPanel({
  currentSentence,
  numSentences,
  currentGMChecks = [],
  currentSentenceIndex,
  handleClickNextGMCheck,
  handleClickPrevGMCheck,
  loading,
}: {
  currentSentence: string,
  numSentences: number,
  currentSentenceIndex: number,
  setCurrentSentenceIndex: (index: number) => void,
  currentGMChecks?: string[],
  loadingParaphrase: boolean,
  handleClickNextGMCheck: () => void,
  handleClickPrevGMCheck: () => void,
  loading: boolean,
}) {
  return (
    <Box sx={{ width: "100%" }}>
      {loading && <BarLoader loading width="100%" height={12} color="#f4f4f4" />}
      {currentGMChecks && currentGMChecks.length === 0 && !loading &&
        <Typography sx={{ fontSize: 14 }}>
          Perfect! No grammar errors found.
        </Typography>
      }
      {
        currentGMChecks.map((gmCheck, index) => {
          return (
            <Box sx={{ boxSizing: "border-box", background: "#f4f4f4", marginBottom: 1, padding: 2, borderRadius: 2 }}>
              <Typography variant="caption">{locale.mistake.ja} {index + 1}</Typography>
              <Typography sx={{ fontSize: 14 }}>
                {currentSentence.substring(0, gmCheck.offset)}
                <Typography sx={{ background: "#ffcbcb", fontSize: 14 }} component="span">{currentSentence.substring(gmCheck.offset, gmCheck.offset + gmCheck.length)}</Typography>
                {" "}
                {currentSentence.substring(gmCheck.offset + gmCheck.length + 1)}
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="caption">
                  {locale.reason.ja} :
                </Typography>
                <Typography sx={{ fontSize: 14 }}>
                  {gmCheck.type}
                </Typography>
              </Box>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="caption">
                  {locale.fix.ja}:
                </Typography>
                {
                  gmCheck.suggestions.map((suggestion, index) => {
                    return (
                      <Typography key={index} sx={{ fontSize: 14, background: "#b7ddb7", diplay: "inline-block", width: "fit-content" }}>
                        {suggestion.suggestion}
                      </Typography>
                    )
                  })
                }
              </Box>

            </Box>
          )
        })
      }
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginTop: 1 }}>
        <Button
          disabled={currentSentenceIndex === 0}
          onClick={handleClickPrevGMCheck}
          size="small"
        >
          <BsArrowLeftCircleFill style={{ transform: "scale(1.3)" }} />
        </Button>
        <Typography variant="body2">{currentSentenceIndex + 1} / {numSentences}</Typography>
        <Button
          disabled={currentSentenceIndex === numSentences - 1}
          onClick={handleClickNextGMCheck}
          size="small"
        >
          <BsArrowRightCircleFill style={{ transform: "scale(1.3)" }} />
        </Button>
      </Box>
    </Box >
  )
}

function ParaphrasePanel({
  numSentences,
  currentParaphrases = [],
  currentSentenceIndex,
  handleClickNextParaphrase,
  handleClickPrevParaphrase,
  loadingParaphrase,
}: {
  numSentences: number,
  currentSentenceIndex: number,
  setCurrentSentenceIndex: (index: number) => void,
  currentParaphrases: string[],
  loadingParaphrase: boolean,
  handleClickNextParaphrase: () => void,
  handleClickPrevParaphrase: () => void,
}) {
  return (
    <Box sx={{ width: "100%" }}>
      {loadingParaphrase && <BarLoader loading width="100%" height={12} color="#f4f4f4" />}
      {
        currentParaphrases.slice(0, 3).map((paraphrase, index) => {
          return (
            <Grid
              container
              sx={{
                width: "100%",
                alignItems: "center",
                borderBottom: "1px solid #f4f4f4",
                background: "#f4f4f4",
                boxSizing: "border-box",
                marginBottom: 0.5,
                paddingX: 1.5,
                paddingY: 1,
                borderRadius: 2
              }}>
              <Grid item xs={9}>
                <Typography sx={{ fontSize: 14 }}>
                  {paraphrase.text}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Button size="small" variant="contained" sx={{ background: "#fff", fontSize: 12, width: "100%" }}>Detail</Button>
              </Grid>
            </Grid>
          )
        })
      }
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginTop: 1 }}>
        <Button
          disabled={currentSentenceIndex === 0}
          onClick={handleClickPrevParaphrase}
          size="small"
        >
          <BsArrowLeftCircleFill style={{ transform: "scale(1.3)" }} />
        </Button>
        <Typography variant="body2">{currentSentenceIndex + 1} / {numSentences}</Typography>
        <Button
          disabled={currentSentenceIndex === numSentences - 1}
          onClick={handleClickNextParaphrase}
          size="small"
        >
          <BsArrowRightCircleFill style={{ transform: "scale(1.3)" }} />
        </Button>
      </Box>
    </Box>
  )
}