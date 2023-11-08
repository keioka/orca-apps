import { useState, useEffect } from "react";
import { callTextToSpeechAPI } from "utils/client";
import { Box, Chip, Card, CardActions, CardContent, Button, Stack, Grid, Typography, TextField, Tooltip } from "@mui/material";
// import Image from "next/image";
import { CardConvo } from "components/CardConvo";
import { ScreenLearningMode } from "components/ScreenLearningMode";
import { BiLinkExternal } from 'react-icons/bi'
import styled from "@emotion/styled";

const VocabContainer = styled(Box)`
  &::-webkit-scrollbar {
    display: none;
  }
`
const apiUrl = '/api/metatag';

const ja = {
  learningMode: "学習モード",
  chatMode: "チャットモード",
}

const locale = {
  talk: {
    en: "Talk",
    ja: "話す"
  },
  chatPlaceholder: {
    en: "Type your message here...",
    ja: "メッセージを入力してください"
  }
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
const sample = [{ content: "Extinction" }, { content: "Bu" }, { content: "Hello" }, { content: "Run out" }, { content: "Weird" }, { content: "Make sense" }]
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


const vocabs = [
  {
    vocab: "Artificial intelligence",
    meaning: "The theory and development of computer systems able to perform tasks that normally require human intelligence, such as visual perception, speech recognition, decision-making, and translation between languages.",
    ja: "人工知能",
    sentence: "Artificial intelligence could lead to the extinction of humanity, experts - including the heads of OpenAI and Google Deepmind - have warned."
  },
  {
    vocab: "extinction",
    meaning: "The state or process of a species, family, or larger group being or becoming extinct.",
    ja: "絶滅",
    sentence: "Artificial intelligence could lead to the extinction of humanity, experts - including the heads of OpenAI and Google Deepmind - have warned."
  },
  {
    vocab: "Mitigating",
    meaning: "Make less severe, serious, or painful.",
    ja: "緩和する",
    sentence: "\"Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war\" it reads."
  },
  {
    vocab: "overblown",
    meaning: "Exaggerated or inflated.",
    ja: "誇張された",
    sentence: "But others say the fears are overblown."
  },
  {
    vocab: "weaponised",
    meaning: "Adapt for use as a weapon.",
    ja: "兵器化された",
    sentence: "AIs could be weaponised - for example, drug-discovery tools could be used to build chemical weapons"
  },
  {
    vocab: "destabilise",
    meaning: "Upset the stability of (a region or system); cause unrest or instability.",
    ja: "不安定にする",
    sentence: "AI-generated misinformation could destabilise society and \"undermine collective decision-making\""
  },
  {
    vocab: "Enfeeblement",
    meaning: "To make weak or feeble; debilitate.",
    ja: "衰弱",
    sentence: "Enfeeblement, where humans become dependent on AI \"similar to the scenario portrayed in the film Wall-E\""
  },
  {
    vocab: "issued",
    meaning: "to officially give or announce something",
    ja: "発行する",
    sentence: "Dr Geoffrey Hinton, who issued an earlier warning about risks from super-intelligent AI..."
  },
  {
    vocab: "supported",
    meaning: "to agree with and give encouragement to someone or something because you want him, her, or it to succeed",
    ja: "支持する",
    sentence: "...has also supported the Centre for AI Safety's call."
  },
  {
    vocab: "signed",
    meaning: "to write your name, usually on a written or printed document, to show that you agree with its contents or have written or created it yourself",
    ja: "署名する",
    sentence: "Yoshua Bengio, professor of computer science at the university of Montreal, also signed."
  },
  {
    vocab: "described",
    meaning: "to say or write what someone or something is like",
    ja: "説明する",
    sentence: "Dr Hinton, Prof Bengio and NYU Professor Yann LeCun are often described as the 'godfathers of AI'..."
  },
  {
    vocab: "groundbreaking",
    meaning: "introducing new ideas or methods",
    ja: "画期的な",
    sentence: "...for their groundbreaking work in the field..."
  },
  {
    vocab: "overblown",
    meaning: "made to seem more important or better than it really is",
    ja: "大げさに言われた",
    sentence: "But Prof LeCun, who also works at Meta, has said these apocalyptic warnings are overblown..."
  },
  {
    vocab: "prophecies",
    meaning: "a statement that says what is going to happen in the future, especially one which is based on what you believe about a particular matter rather than existing facts",
    ja: "予言",
    sentence: "...the most common reaction by AI researchers to these prophecies of doom is face palming."
  },
  {
    vocab: "unrealistic",
    meaning: "not seeming real or true; not likely to happen or be successful in the future",
    ja: "非現実的な",
    sentence: "Many other experts similarly believe that fears of AI wiping out humanity are unrealistic..."
  },
  {
    vocab: "distraction",
    meaning: "something that prevents someone from giving their attention to something else",
    ja: "気を散らすもの",
    sentence: "...and a distraction from issues such as bias in systems that are already a problem."
  },
  {
    vocab: "Magnify",
    meaning: "Make (something) appear larger than it is, especially with a lens or microscope.",
    ja: "拡大する",
    sentence: "Advancements in AI will magnify the scale of automated decision-making that is biased, discriminatory, exclusionary or otherwise unfair while also being inscrutable and incontestable."
  },
  {
    vocab: "Inscrutable",
    meaning: "Impossible to understand or interpret.",
    ja: "不可解な",
    sentence: "Advancements in AI will magnify the scale of automated decision-making that is biased, discriminatory, exclusionary or otherwise unfair while also being inscrutable and incontestable."
  },
  {
    vocab: "Incontestable",
    meaning: "Not able to be disputed or denied.",
    ja: "否定できない",
    sentence: "Advancements in AI will magnify the scale of automated decision-making that is biased, discriminatory, exclusionary or otherwise unfair while also being inscrutable and incontestable."
  },
  {
    vocab: "Free ride",
    meaning: "Benefit from something without contributing towards it.",
    ja: "タダ乗りする",
    sentence: "Many AI tools essentially 'free ride' on the 'whole of human experience to date'."
  },
  {
    vocab: "Antagonistically",
    meaning: "In a manner showing active opposition or hostility.",
    ja: "敵対的に",
    sentence: "Future risks and present concerns 'shouldn't be viewed antagonistically'."
  },
  {
    vocab: "Media coverage",
    meaning: "The amount of time or space given to an event in newspapers and on television, radio, etc.",
    ja: "メディア報道",
    sentence: "Media coverage of the supposed \"existential\" threat from AI has snowballed since March 2023 when experts, including Tesla boss Elon Musk, signed an open letter urging a halt to the development of the next generation of AI technology."
  },
  {
    vocab: "snowballed",
    meaning: "Increase rapidly in intensity, size, or speed.",
    ja: "急速に増大する",
    sentence: "Media coverage of the supposed \"existential\" threat from AI has snowballed since March 2023 when experts, including Tesla boss Elon Musk, signed an open letter urging a halt to the development of the next generation of AI technology."
  },
  {
    vocab: "urging a halt",
    meaning: "Strongly suggesting that something should stop.",
    ja: "停止を促す",
    sentence: "Media coverage of the supposed \"existential\" threat from AI has snowballed since March 2023 when experts, including Tesla boss Elon Musk, signed an open letter urging a halt to the development of the next generation of AI technology."
  },
  {
    vocab: "outnumber",
    meaning: "Be more numerous than.",
    ja: "数で上回る",
    sentence: "That letter asked if we should \"develop non-human minds that might eventually outnumber, outsmart, obsolete and replace us\"."
  },
  {
    vocab: "outsmart",
    meaning: "Defeat or get the better of (someone) by being clever or cunning.",
    ja: "出し抜く",
    sentence: "That letter asked if we should \"develop non-human minds that might eventually outnumber, outsmart, obsolete and replace us\"."
  },
  {
    vocab: "obsolete",
    meaning: "No longer produced or used; out of date.",
    ja: "時代遅れの",
    sentence: "That letter asked if we should \"develop non-human minds that might eventually outnumber, outsmart, obsolete and replace us\"."
  },
  {
    vocab: "open up discussion",
    meaning: "Start a conversation or debate about a specific topic.",
    ja: "議論を開始する",
    sentence: "In contrast, the new campaign has a very short statement, designed to \"open up discussion\"."
  },
  {
    vocab: "regulated",
    meaning: "Control or maintain the rate or speed of (a machine or process) so that it operates properly.",
    ja: "規制される",
    sentence: "In a blog post OpenAI recently suggested superintelligence might be regulated in a similar way to nuclear energy"
  },
  {
    vocab: "reassured",
    meaning: "Say or do something to remove the doubts and fears of someone.",
    ja: "安心させる",
    sentence: "'BE REASSURED'"
  },
  {
    vocab: "paralysed",
    meaning: "unable to move or function",
    ja: "麻痺した",
    sentence: "You've seen that recently it was helping paralysed people to walk"
  },
  {
    vocab: "antibiotics",
    meaning: "drugs that kill bacteria and cure infections",
    ja: "抗生物質",
    sentence: "discovering new antibiotics"
  },
  {
    vocab: "guardrails",
    meaning: "a rail that prevents people from falling off or getting into dangerous areas",
    ja: "ガードレール",
    sentence: "discuss what are the guardrails that we need to put in place"
  },
  {
    vocab: "regulation",
    meaning: "a rule or directive made and maintained by an authority",
    ja: "規制",
    sentence: "what's the type of regulation that should be put in place to keep us safe"
  },
  {
    vocab: "existential risks",
    meaning: "threats to the existence of humanity",
    ja: "存在のリスク",
    sentence: "People will be concerned by the reports that AI poses existential risks"
  },
  {
    vocab: "reassured",
    meaning: "to restore confidence to",
    ja: "安心させる",
    sentence: "I want them to be reassured that the government is looking very carefully at this"
  },
  {
    vocab: "summit",
    meaning: "an important formal meeting between leaders of governments from two or more countries",
    ja: "サミット",
    sentence: "He had discussed the issue recently with other leaders, at the G7 summit of leading industrialised nations"
  },
  {
    vocab: "working group",
    meaning: "a group of people who investigate a particular problem and suggest ways of dealing with it",
    ja: "作業部会",
    sentence: "The G7 has recently created a working group on AI"
  }
]

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

  const url = "https://www.bbc.com/news/uk-65746524"

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await getMetadata(url)
        if (res) {
          setNewsImageUrl(res.image)
          setNewsTitle(res.title)
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchMetadata()
  }, [])

  useEffect(() => {
    if (finished && incoming.message !== "") {
      setMessages((prev) => [...prev, { role: "ai", message: incoming.message }]);
      setIncoming({ role: "ai", message: "" });
    }
  }, [incoming])

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
  }

  const scrollToBottom = () => {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }

  const handleSubmit = async (e) => {
    handleAsk(e);

    e.preventDefault();

    setFinished(false);
    setMessages((prev) => [...prev, { role: "human", message: input }]);

    const res = await fetch("/api/bot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
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
          setFinished(true)
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
      scrollToBottom()
    }

  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%" }}>
        <Grid container>
          <Grid item xs={4}>
            <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <img
                src={newsImageUrl}
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                }}
              />
              <a href={url} target="_blank">
                <Box sx={{ position: "absolute", bottom: 2, right: 2, padding: 1, background: "rgba(0,0,0,0.4)", borderRadius: 4 }}>
                  <BiLinkExternal fill="#fff" />
                </Box>
              </a>
            </Box>
            <Box>

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
                  {mode === MODE.LEARNING ? localeTexts.chatMode : localeTexts.learningMode}に切り替え
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
            <Stack spacing={3} sx={{ paddingBottom: 32 }}>
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
              <Typography variant="caption" sx={{ marginBottom: 1 }}>保存した単語</Typography>
              <VocabContainer mb={1} sx={{ width: "100%", overflowX: "scroll", flexWrap: "nowrap", display: "flex", scrollbarWidth: 0, "::-webkit-scrollbar": "none" }}>
                {vocabs.map((vocab, _) => {
                  return (
                    <Tooltip title={vocab.ja}
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
                      }}>
                      <Chip label={vocab.vocab} sx={{ marginRight: 1 }} />
                    </Tooltip>
                  )
                })}
              </VocabContainer>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    maxLength={200}
                    placeholder={locale.chatPlaceholder.ja}
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
                      {locale.talk.ja}
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