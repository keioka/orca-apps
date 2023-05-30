import { useState, useEffect } from "react";
import { callTextToSpeechAPI } from "utils/client";
import { Box, Card, CardActions, CardContent, Button, Stack, Grid, Typography, TextField } from "@mui/material";
// import Image from "next/image";
import { CardConvo } from "components/CardConvo";

const apiUrl = 'https://og-link-preview.p.rapidapi.com';

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


export default function Chat() {
  const [incoming, setIncoming] = useState({ role: "ai", message: "" });
  const [newsTitle, setNewsTitle] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [newMessage, setNewMessage] = useState({ role: "ai", message: "" });
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [finished, setFinished] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "human",
      message: "hello mr robot 👋",
    },
    {
      role: "ai",
      message: "🤖 beep boop. hi. what do u want",
    },
  ]);

  useEffect(() => {
    async function fetchMetadata() {
      console.log(">>>>>>>>>>>")
      try {
        const res = await getMetadata("https://www.bbc.com/news/uk-65746524")
        console.log(res)
        if (res) {
          console.log({ res })
          console.log(res.cover)
          setNewsImageUrl(res.cover)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFinished(false);
    setMessages((prev) => [...prev, { role: "human", message: input }]);
    console.log(input)

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

    console.log(res)

    if (res.status !== 200) {
      console.error("Error fetching chat stream");
      setFinished(true);
      return;
    }
    setInput("");
    setIncoming({ role: "ai", message: "" });

    const stream = res.body;
    console.log(stream)
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
        console.log(decodedValue)
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

  console.log({ newsImageUrl, newsTitle })

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={newsImageUrl} width="100%" height="auto" style={{
                objectFit: "cover",
              }} />
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} py={2}>
              <Typography variant="body1" component="span">
                {newsTitle}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ maxWidth: "720px", minWidth: "320px", width: "100%", py: 3, boxSizing: "border-box" }}>
        <Stack spacing={3} sx={{ overflowY: "scroll", paddingBottom: 32 }}>
          {messages.map((message, index) => {
            return (
              <CardConvo key={index} message={message} />
            );
          })}
          {!finished && incoming.message && (
            <CardConvo key={index} message={incoming.message} />
          )}
        </Stack>


        <Box sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", padding: 3, paddingBottom: 8, background: "#fff", borderTop: "2px solid #f4f4f4", boxSizing: "border-box" }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                maxLength={200}
                className="w-full rounded-sm border
         p-4 text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none"
                placeholder={"Ask a question"}
              />
              <Box>
                {finished ? (
                  <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    size="large"
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      color: "#fff",
                      boxShadow: "none",
                    }}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button disabled>
                    Thinking
                  </Button>
                )}
              </Box>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}