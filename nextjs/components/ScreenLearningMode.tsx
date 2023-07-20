import {
  useState
} from 'react'

import {
  Tabs,
  Tab,
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Grid,
} from '@mui/material';

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

const locale = {
  summary: {
    en: "Summary",
    ja: "要約"
  },
  sentence: {
    en: "Sentence",
    ja: "文章"
  },
  vocabulary: {
    en: "Vocabulary",
    ja: "単語リスト"
  },
  example: {
    en: "Example",
    ja: "例"
  },
  save: {
    en: "Save",
    ja: "保存"
  }
}

export function ScreenLearningMode() {
  const [value, setValue] = useState('one');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="transparent"
        aria-label="secondary tabs example"
        sx={{
          width: '100%',
          py: 2,
          justifyContent: 'center',
          '& .MuiTabs-flexContainer': {
            justifyContent: 'center',
          }
        }}
      >
        <Tab value="one" label={locale.summary.ja} />
        {/* <Tab value="two" label=sentence /> */}
        <Tab value="three" label={locale.vocabulary.ja} />
      </Tabs>
      <Box sx={{ height: "100vh", boxSizing: "border-box" }} p={2}>
        {/* {value === 'zero' &&
          <iframe src="https://www.instagram.com" width="100%" height="100%" id="main-frame" allow="fullscreen" />
        } */}

        {value === 'one' &&

          <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
            <Typography variant="body2" component="span">
              "Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war" it reads.

              But others say the fears are overblown.

              Sam Altman, chief executive of ChatGPT-maker OpenAI, Demis Hassabis, chief executive of Google DeepMind and Dario Amodei of Anthropic have all supported the statement.
            </Typography>
          </Card>

        }

        {value === 'two' &&
          <Stack spacing={1}>
            <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
              <Typography variant="body2" component="span">
                "Your community club is ready to provide services at its multiple branches and via its online portals."
              </Typography>
            </Card>

            <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
              <Typography variant="body2" component="span">
                "Your community club is ready to provide services at its multiple branches and via its online portals."
              </Typography>
            </Card>
          </Stack>
        }

        {value === 'three' &&
          <Stack spacing={1}>
            {vocabs.map((vocab) => {
              return (
                <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item xs={10} spacing={1}>
                      <Stack spacing={1}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: "bold" }}>
                          {vocab.vocab}
                        </Typography>
                        <Typography variant="body2" component="span">
                          {vocab.ja}
                        </Typography>
                        <Typography variant="body2" component="span">
                          例：{vocab.sentence}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={2}>
                      <Button variant="outlined" size="small" >{locale.save.ja}</Button>
                    </Grid>
                  </Grid>
                </Card>
              )
            })}
          </Stack>
        }
      </Box>
    </>
  )
}