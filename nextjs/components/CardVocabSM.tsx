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
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails
} from "@mui/material"
import styled from "@emotion/styled";
import ArrowForwardIosSharpIcon from 'react-icons/';
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { IoBookmark } from "react-icons/io5";
import { BiSolidRightArrow } from "react-icons/bi";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<BiSolidRightArrow size={14} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "#fff",
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#fafafa",
}));

function getPosColor(pos: string) {
  switch (pos) {
    case 'noun':
      return '#FF6347'; // Tomato
    case 'verb':
      return '#32CD32'; // Lime Green
    case 'adjective':
      return '#1E90FF'; // Dodger Blue
    case 'adverb':
      return '#FFD700'; // Gold
    case 'pronoun':
      return '#FF00FF'; // Magenta
    case 'preposition':
      return '#00CED1'; // Dark Turquoise
    case 'conjunction':
      return '#FF8C00'; // Dark Orange
    case 'interjection':
      return '#FF1493'; // Deep Pink
    case 'article':
      return '#32CD32'; // Lime Green
    case 'particle':
      return '#FF00FF'; // Magenta
    case 'abbreviation':
      return '#FF6347'; // Tomato
    case 'prefix':
      return '#FF8C00'; // Dark Orange
    case 'suffix':
      return '#696969'; // Dim Gray
    case 'phrase':
      return '#00CED1'; // Dark Turquoise
    case 'idiom':
      return '#FF6347'; // Tomato
    case 'expression':
      return '#FF8C00'; // Dark Orange
    case 'contraction':
      return '#FF00FF'; // Magenta
    default:
      return '#000000'; // Black (default color)
  }
}

function convertPosIcon(pos: string, lang: string) {
  switch (pos) {
    case 'noun':
      return '名詞'
    case 'verb':
      return '動詞'
    case 'adjective':
      return '形容詞'
    case 'adverb':
      return '副詞'
    case 'pronoun':
      return '代名詞'
    case 'preposition':
      return '前置詞'
    case 'conjunction':
      return '接続詞'
    case 'interjection':
      return '感動詞'
    case 'article':
      return '冠詞'
    case 'particle':
      return '助詞'
    case 'abbreviation':
      return '略語'
    case 'prefix':
      return '接頭辞'
    case 'suffix':
      return '接尾辞'
    case 'phrase':
      return '句'
    case 'idiom':
      return '熟語'
    case 'expression':
      return '表現'
    case 'contraction':
      return '短縮形'
    case 'abbreviation':
      return
  }
}

export function CardVocabSM({
  vocab,
  onSaveVocab,
  shouldHideSave,
  shouldHideDiscard,
}: { vocab: any, onSaveVocab: any, shouldHideSave?: boolean, shouldHideDiscard?: boolean }) {


  // function handlePlayAudio() {
  //   const voices = synth.getVoices();
  //   const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

  //   const utterance = new SpeechSynthesisUtterance(vocab.word);
  //   utterance.lang = "en-US";

  //   if (englishVoices.length) {
  //     utterance.voice = englishVoices.find(voice => voice.name === 'Google US English');
  //   }

  //   synth.speak(utterance);
  // }

  function handleClickSave() {
    onSaveVocab(vocab)
  }

  return (
    <Card sx={{ width: "100%", height: "auto", boxShadow: "none", border: "1px solid #eeeeee", fontSize: 16 }}>
      <Accordion>
        <AccordionSummary>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{
              width: "100%",
            }}
          >
            <Stack spacing={2} direction="row" alignItems="center">
              <Stack sx={{ borderRight: "1px solid #f0f0f0", paddingRight: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h6" component="h5">
                    {vocab.word}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: "#cbcbcb",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                    }}
                  // onClick={handlePlayAudio}
                  >
                    <HiOutlineSpeakerWave size={14} color="#fff" />
                  </Box>
                </Stack>
                <Typography variant="body2" component="span">
                  {vocab.pronounce}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="body2" component="h6">
                  {vocab.meaningInJapanese}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", background: getPosColor(vocab.pos), borderRadius: 1, py: 0, px: 1, width: 48 }}>
                  <Typography variant="caption" component="span" sx={{ color: "#fff", fontSize: 11, fontWeight: "bold", textAlign: "center" }}>
                    {convertPosIcon(vocab.pos, "en")}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            {!shouldHideSave &&
              <Button
                onClick={handleClickSave}
                variant="contained"
                sx={{
                  background: "#e2e2e2",
                  "&:hover": {
                    background: "#e2e2e2"
                  }
                }}
                startIcon={<IoBookmark color="#b6b6b6" />}
                size="small"
              >
                単語帳に保存
              </Button>
            }
          </Stack>
        </AccordionSummary>
        <AccordionDetails>

          <Stack spacing={1} sx={{ paddingTop: 1 }}>
            {/* <Typography variant="body2" component="h6">
            {vocab.meaningInJapanese}
          </Typography> */}
            <Typography component="h6">
              {vocab.meaning}
            </Typography>
          </Stack>
          <Stack spacing={1} sx={{ paddingTop: 1 }}>

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <Typography sx={{ lineHeight: 1 }}>
                Sentence
              </Typography>
              <Typography sx={{ textDecoration: "italic" }} >
                <i>{vocab.sentence}</i>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ lineHeight: 1 }}>
                Example
              </Typography>
              <Typography component="h6">
                {vocab.example}
              </Typography>
            </Stack>
          </Stack>

          <Box>
            {/* {
            vocab.tags && vocab.tags.map((tag) => (
              <Chip label={tag} sx={{ width: "auto", marginRight: 1 }} />
            ))
          } */}
          </Box>
          <CardActions sx={{ borderTop: "1px solid #f2f2f2", padding: 0, paddingTop: 1 }}>
            <Stack direction="row" spacing={1}>

              {/* {!shouldHideDiscard && <Button>{"Discard"}</Button>} */}
              {/* <Button variant="outlined" size="small">Source</Button> */}
            </Stack>
          </CardActions>
          {/* <Typography variant="body2" component="div">
    {vocab.audioFile}
  </Typography> */}
        </AccordionDetails>
      </Accordion>
    </Card >
  )
}