import { useState, useEffect } from "react";
import { callTextToSpeechAPI } from "utils/client";
import { Box, Card, CardActions, CardContent, Button, Stack, Grid, Typography, TextField } from "@mui/material";
// import Image from "next/image";
import { CardConvo } from "components/CardConvo";
import { CardLoading } from "components/CardLoading";
import { ScreenLearningMode } from "components/ScreenLearningMode";

const apiUrl = '/api/metatag';


const ja = {
  learningMode: "学習モード",
  chatMode: "チャットモード",
}

async function getMetadata(url: string) {
  try {
    const response = await fetch(`${apiUrl}?${new URLSearchParams({ url })}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'REDACTED_RAPIDAPI_KEY',
          'X-RapidAPI-Host': 'og-link-preview.p.rapidapi.com'
        }
      });
    const result = await response.json();
    return result
  } catch (error) {
    console.error(error);
  }
}
const promiseQueue: Promise<void>[] = [];

async function enqueuePromise(promise: Promise<HTMLAudioElement>, cb: (audio: HTMLAudioElement) => void): Promise<void> {
  // Create a new promise that resolves after the previously enqueued promises have resolved
  const currentPromise = promiseQueue.length > 0 ? promiseQueue[promiseQueue.length - 1] : Promise.resolve();

  const queuedPromise = currentPromise.then(async () => {
    const audio = await promise; // Wait for the promise to resolve
    cb(audio);
  });

  promiseQueue.push(queuedPromise);
  await queuedPromise; // Wait for the enqueued promise to resolve
}

enum MODE {
  CHAT,
  LEARNING
}

async function query(data) {
  const response = await fetch(
    "https://flowise-j57m.onrender.com/api/v1/prediction/6e944969-9443-423a-9397-cac4563f1683",
    {
      headers: {
        Authorization: "Bearer REDACTED_FLOWISE_API_KEY",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(data)
    }
  );
  const result = await response.json();
  return result;
}

export default function Chat() {
  const [incoming, setIncoming] = useState({ role: "ai", message: "" });
  const [newsTitle, setNewsTitle] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [mode, setMode] = useState<MODE>(MODE.CHAT);
  const [newMessage, setNewMessage] = useState({ role: "ai", message: "" });
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [finished, setFinished] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      message: "What do you think about the article?",
    },
  ]);

  const localeTexts = ja

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await getMetadata("https://www.bbc.com/news/uk-65746524")
        if (res) {
          setNewsImageUrl(res.image)
          setNewsTitle(res.title)
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchMetadata()
    setNewMessage(incoming);
  }, [incoming])

  useEffect(() => {
    if (newMessage.message) {
      setMessages((prevMsgs) => [...prevMsgs, newMessage]);
    }
  }, [finished])

  const handleAsk = async (e) => {

    const res = await query({
      "question": input,
      "overrideConfig": {
        "temperature": 1,
        "maxTokens": 1,
        "topP": 1,
        "frequencyPenalty": 1,
      }
    })

    console.log("handleAsk", { res })
  }

  const handleSubmit = async (e) => {
    handleAsk(e);

    e.preventDefault();

    setFinished(false);
    setMessages((prev) => [...prev, { role: "human", message: input }]);

    const res = await fetch("/api/chatStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: input,
        history: messages,
      }),
    });

    if (res.status !== 200) {
      console.error("Error fetching chat stream");
      setFinished(true);
      return;
    }
    setInput("");
    setIncoming({ role: "ai", message: "" });

    const stream = res.body;
    const reader = stream.getReader();

    const audioQueue: Promise<HTMLAudioElement>[] = []

    try {
      let sentence = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (sentence !== "") {
            await enqueuePromise(callTextToSpeechAPI(sentence), (audio) => { audio.play() });
          }
          break;
        }

        const decodedValue = new TextDecoder().decode(value);
        sentence += decodedValue;

        setIncoming(({ role, message }) => ({ role, message: message + decodedValue }));

        if (sentence !== "" && (sentence.includes(',') || sentence.includes('.') || sentence.includes('!') || sentence.includes('?'))) {
          // audioQueue.push(callTextToSpeechAPI(sentence))
          await enqueuePromise(callTextToSpeechAPI(sentence), (audio) => { audio.play() });
          sentence = ''; // Reset the sentence variable
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      reader.releaseLock();
      setIncoming({ role: "ai", message: "" });
      setFinished(true)
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%" }}>
        <Grid container>
          <Grid item xs={4}>
            <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
              <img
                src={newsImageUrl}
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box px={2} py={1.5}>
              <Stack spacing={1}>
                <Typography variant="body2" component="span">
                  {newsTitle}
                </Typography>
                <Typography variant="body2" component="span">
                  {/* {newsTitle} */}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  lang="ja"
                  onClick={() => setMode(mode === MODE.LEARNING ? MODE.CHAT : MODE.LEARNING)}
                >
                  {mode === MODE.LEARNING ? localeTexts.learningMode : localeTexts.chatMode}
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ maxWidth: "720px", minWidth: "320px", width: "100%", boxSizing: "border-box", background: "#FAFAFA", minHeight: "100vh" }}>
        {
          mode === MODE.LEARNING && <>
            <ScreenLearningMode />
          </>
        }
        {
          mode === MODE.CHAT && <>
            <Stack spacing={3} sx={{ overflowY: "scroll", paddingBottom: 32 }}>
              {messages.map((message, index) => {
                return (
                  <CardConvo key={index} message={message} loading={false} />
                );
              })}
              {!finished &&
                <CardConvo loading={!incoming.message} message={{ message: incoming.message, role: "ai" }} />
              }
            </Stack>


            <Box sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: 3, paddingBottom: 8, background: "#fff", borderTop: "2px solid #f4f4f4", boxSizing: "border-box" }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    maxLength={200}
                    placeholder={"Ask a question"}
                    inputProps={{
                      style: {
                        fontSize: 12,
                      }
                    }}
                  />
                  <Box>
                    <Button
                      variant="contained"
                      type="submit"
                      color="primary"
                      size="large"
                      disabled={!finished}
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        color: "#fff",
                        boxShadow: "none",
                      }}
                    >
                      Talk
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Box>
          </>}
      </Box>
    </Box>
  );
}