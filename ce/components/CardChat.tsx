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
  CardActions,
  Chip,
  Grid,
  Alert,
  Avatar,
  LinearProgress
} from "@mui/material"
import { sendToBackground } from "@plasmohq/messaging"
import { useSentence } from "../hooks/card"
import { IoPlay } from "react-icons/io5"
import { LoaderBounce } from "./LoaderBounce"
enum Tab {
  Paraphrase = "paraphrase",
  GMCheck = "gmcheck"
}

const synth = window.speechSynthesis;

export function CardChat({ content, type = "ai", loading }) {
  const [error, setError] = useState(null)
  const { currentSentence, currentSentenceIndex } = useSentence(content)
  const [currentTab, setCurrentTab] = useState<Tab.Paraphrase>(null)

  const [isLoadingParaphrase, setIsLoadingParaphrase] = useState(false)
  const [isLoadingGMCheck, setIsLoadingGMCheck] = useState(false)
  const [isLoadingTranlate, setIsLoadingTranslate] = useState(false)

  const [paraphrase, setParaphrase] = useState({})
  const [translate, setTranslate] = useState(null)

  console.log("orca", { currentSentence, currentSentenceIndex })

  useEffect(() => {
    if (type === "human" || loading) return
    handlePlayAudio()
  }, [])

  async function handleClickTranslate(sentence: string) {
    if (translate) return

    setIsLoadingTranslate(true)
    const resp = await sendToBackground({
      name: "translate",
      body: {
        text: content
      }
    })

    console.log("orca", { resp })

    if (resp.error) {
      setError(resp.error)
      return
    }

    setTranslate(resp.translation)
    setIsLoadingTranslate(false)
  }

  async function handleClickParaphrase(sentence: string) {
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

  function handleClickGMCheck() { }

  function handlePlayAudio() {
    const voices = synth.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

    console.log("orca", {
      englishVoices
    })

    const utterance = new SpeechSynthesisUtterance(
      content
    );

    utterance.lang = "en-US";
    console.log({ utterance })
    if (englishVoices.length) {
      utterance.voice = englishVoices[41];
    }

    synth.speak(utterance);
  }

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
        <Avatar src="" sx={{ width: 24, height: 24 }} />
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
        <Typography>
          {content}
          {loading && <LoaderBounce />}
        </Typography>

        <CardActions sx={{ padding: 0, paddingTop: 2, width: "100%" }}>
          {type === "human" && (
            <Stack sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1}>
                <Button sx={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "64px",
                  padding: "6px 12px",
                  backgroundColor: currentTab === Tab.GMCheck ? "#2aa2e3" : "rgba(0,0,0,0.3)",
                  "&:hover": {
                    backgroundColor: currentTab === Tab.GMCheck ? "#2aa2e3" : "rgba(0,0,0,0.3)",
                  }
                }}>
                  <Typography variant="caption" component="h6" sx={{ fontSize: 10, color: "#fff" }}>
                    Grammar Check
                  </Typography>
                </Button>
                <Button
                  sx={{
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "64px",
                    padding: "6px 12px",
                    backgroundColor: currentTab === Tab.Paraphrase ? "#2aa2e3" : "rgba(0,0,0,0.3)",
                    "&:hover": {
                      backgroundColor: currentTab === Tab.Paraphrase ? "#2aa2e3" : "rgba(0,0,0,0.3)",
                    }
                  }}
                  onClick={handleClickParaphrase}
                >
                  <Typography variant="caption" component="h6" sx={{ fontSize: 10, color: "#fff" }}>
                    Paraphrase
                  </Typography>
                </Button>
              </Stack>
              <Box mt={1}>
                {isLoadingParaphrase && <LinearProgress />}
                {
                  paraphrase[currentSentenceIndex] && paraphrase[currentSentenceIndex].map((item) => {
                    return (
                      <Box sx={{ border: "1px solid #e8e8e8", background: "#fff", borderRadius: 1, padding: 1, marginY: 0.5 }}>
                        <Typography variant="caption" component="h6">
                          {item.sentence}
                        </Typography>
                      </Box>
                    )
                  })
                }
              </Box>
            </Stack>
          )}

          {type === "ai" && (
            <Stack sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1}>
                <Button
                  sx={{
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "64px",
                    padding: "6px 12px",
                    backgroundColor: currentTab === Tab.GMCheck ? "#2aa2e3" : "rgba(0,0,0,0.3)",
                    "&:hover": {
                      backgroundColor: currentTab === Tab.GMCheck ? "#2aa2e3" : "rgba(0,0,0,0.3)",
                    }
                  }}
                  onClick={handleClickTranslate}
                >
                  <Typography variant="caption" component="h6" sx={{ fontSize: 10, color: "#fff" }}>
                    Translate
                  </Typography>
                </Button>
                <Button onClick={handlePlayAudio}>
                  <IoPlay />
                  <Typography variant="caption" component="h6" sx={{ fontSize: 10, color: "#fff" }}>
                    Replay
                  </Typography>
                </Button>
              </Stack>
              <Box mt={1}>
                {translate && (translate)}
              </Box>
            </Stack>
          )}

        </CardActions>
      </Card>
    </Stack>
  )
}