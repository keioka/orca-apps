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
  Avatar
} from "@mui/material"
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { ButtonRound } from "./ButtonRound";

const synth = window.speechSynthesis;

export function CardVocab({
  vocab,
  onSaveVocab,
  shouldHideSave,
  shouldHideDiscard,
}: { vocab: any, onSaveVocab: any, shouldHideSave?: boolean, shouldHideDiscard?: boolean }) {


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
    onSaveVocab(vocab)
  }

  return (
    <Card sx={{ width: "100%", height: "auto", boxShadow: "none", border: "1px solid #eeeeee" }}>
      <Stack p={3} spacing={1}>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            paddingBottom: 1,
            borderBottom: "1px solid #f2f2f2"
          }}
        >
          <Stack spacing={0.5} >
            <Typography variant="h6" component="h5">
              {vocab.word}
            </Typography>
            <Typography variant="body2" component="span">
              {vocab.pronounce}
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              backgroundColor: "#dddddd",
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
          <Typography variant="body2" component="h6">
            {vocab.transJaByContext}（英：{vocab.meaning}）
          </Typography>
        </Stack>
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

        <Box>
          {
            vocab.tags && vocab.tags.map((tag) => (
              <Chip label={tag} sx={{ width: "auto", marginRight: 1 }} />
            ))
          }
        </Box>
        <CardActions sx={{ borderTop: "1px solid #f2f2f2", padding: 0, paddingTop: 1 }}>
          <Stack direction="row" spacing={1}>
            {!shouldHideSave && <ButtonRound onClick={handleClickSave}>{chrome.i18n.getMessage("card_vocab_button_save")}</ButtonRound>}
            {!shouldHideDiscard && <ButtonRound>{chrome.i18n.getMessage("card_vocab_button_discard")}</ButtonRound>}
            {/* <Button variant="outlined" size="small">Source</Button> */}
          </Stack>
        </CardActions>
        {/* <Typography variant="body2" component="div">
    {vocab.audioFile}
  </Typography> */}
      </Stack>
    </Card>
  )
}