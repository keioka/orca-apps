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
  IconButton
} from "@mui/material"
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { ButtonRound } from "./ButtonRound";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from '@mui/icons-material/Close';
const synth = window.speechSynthesis;

export function CardVocabDetailed({
  isSaved,
  vocab,
  onSaveVocab,
  shouldHideSave,
  shouldHideDiscard,
  onClose
}: { vocab: any, onSaveVocab: any, shouldHideSave?: boolean, shouldHideDiscard?: boolean, onClose?: () => void }) {


  function handlePlayAudio() {
    const voices = synth.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

    const utterance = new SpeechSynthesisUtterance(vocab.word);
    utterance.lang = "en-US";

    if (englishVoices.length) {
      utterance.voice = englishVoices.find(voice => voice.name === 'Google US English');
    }

    synth.speak(utterance);
  }

  function handleClickSave() {
    console.log("handleClickSave")
    onSaveVocab(vocab)
  }

  function handleClose() {
    console.log("handleClose")
    onClose()
  }

  const meaningInLang = vocab.translation ? vocab.translation[0].content : vocab.meaning

  return (
    <Card id="card-vocab" sx={{ width: "100%", height: "auto", boxShadow: "none", border: "1px solid #eeeeee", position: "absolute", zIndex: "100000000" }} onClick={handleClose}>
      
      <Stack p={3} spacing={1} alignItems="flex-start" width="100%">
        <Box sx={{ display: "flex", justifyContent: "flex-end", position: "absolute", left: 0, top: 0 }}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          width="100%"
          sx={{
            paddingBottom: 1,
            borderBottom: "1px solid #f2f2f2"
          }}
        >
        
          <Stack spacing={0.5}>
            <Typography variant="h6" component="h5">
              {vocab.word}
            </Typography>
            <Typography variant="body2" component="span">
              {vocab.pronounce}
            </Typography>
            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", background: getPosColor(vocab.pos), borderRadius: 1, py: 0.5, px: 1, width: 96 }}>
                <Typography variant="caption" component="span" sx={{ color: "#fff", fontSize: 11, fontWeight: "bold", textAlign: "center" }}>
                  {convertPosIcon(vocab.pos, "en")}
                </Typography>
              </Box>
              <Typography variant="body2" component="span">
                {vocab.level && `Level: ${vocab.level}`}
              </Typography>
            </Stack>
          </Stack>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              backgroundColor: "#cbcbcb",
              width: 36,
              height: 36,
              borderRadius: "50%",
            }}
            onClick={handlePlayAudio}
          >
            <HiOutlineSpeakerWave size={18} color="#fff" />
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ paddingTop: 1 }}>
          <Typography variant="body1" component="h6">
            {meaningInLang}{vocab.translation && `（英：${vocab.meaning}）`}
          </Typography>
        </Stack>

        <Accordion sx={{ border: "none", boxShadow: "none", "&::before": { background: "none" } }} disableGutters>
          <AccordionSummary
            sx={{ border: "none", boxShadow: "none", padding: 0, flexDirection: "row-reverse" }}
            expandIcon={
              <ExpandMoreIcon />
            }
            aria-controls="panel1a-content"
            defaultChecked
          >
            <Typography variant="body2" component="div">
              例文
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ border: "none", boxShadow: "none", padding: 0 }}>
            <Stack spacing={1} sx={{ paddingTop: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="caption" sx={{ lineHeight: 1 }}>
                  {chrome.i18n.getMessage("card_vocab_sentence_label")}:
                </Typography>
                <Typography variant="body2" sx={{ textDecoration: "italic" }} >
                  <q cite={window.location.href}>
                    <i>{vocab.sentence}</i>
                  </q>
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="caption" sx={{ lineHeight: 1 }}>
                  {chrome.i18n.getMessage("card_vocab_example_label")}:
                </Typography>
                <Typography variant="body2" component="h6">
                  {vocab.example}
                </Typography>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Box>
          {
            vocab.tags && vocab.tags.map((tag) => (
              <Chip label={tag} sx={{ width: "auto", marginRight: 1 }} />
            ))
          }
        </Box>
        <CardActions sx={{ borderTop: "1px solid #f2f2f2", padding: 0, paddingTop: 1 }}>
          <Stack direction="row" spacing={1}>
            {!shouldHideSave && <ButtonRound isActive={isSaved} onClick={handleClickSave}>{chrome.i18n.getMessage("card_vocab_button_save")}</ButtonRound>}
            {/* {!shouldHideDiscard && <ButtonRound>{chrome.i18n.getMessage("card_vocab_button_discard")}</ButtonRound>} */}
            {/* <Button variant="outlined" size="small">Source</Button> */}
          </Stack>
        </CardActions>
        {/* <Typography variant="body2" component="div">
    {vocab.audioFile}
  </Typography> */}
      </Stack>
    </Card >
  )
}

function getPosColor(pos: string) {
  switch (pos) {
    case 'noun':
      return '#8B0000'; // Dark Red
    case 'verb':
      return '#006400'; // Dark Green
    case 'adjective':
      return '#00008B'; // Dark Blue
    case 'adverb':
      return '#8B8B00'; // Dark Yellow
    case 'pronoun':
      return '#8B008B'; // Dark Magenta
    case 'preposition':
      return '#008B8B'; // Dark Cyan
    case 'conjunction':
      return '#8B4513'; // Dark Orange
    case 'interjection':
      return '#4B0082'; // Indigo
    case 'article':
      return '#006400'; // Dark Green
    case 'particle':
      return '#8B008B'; // Dark Magenta
    case 'abbreviation':
      return '#8B0000'; // Dark Red
    case 'prefix':
      return '#8B4513'; // Dark Orange
    case 'suffix':
      return '#696969'; // Dim Gray
    case 'phrase':
      return '#008B8B'; // Dark Cyan
    case 'idiom':
      return '#8B0000'; // Dark Red
    case 'expression':
      return '#8B4513'; // Dark Orange
    case 'contraction':
      return '#8B008B'; // Dark Magenta
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
