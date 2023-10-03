import { Box, Card, Stack, Typography } from "@mui/material";
import { Preview } from "~components/Preview";
import { CardGMCheck } from "~components/CardGMCheck";
import { CardParaphrase } from "~components/CardParaphrase";
import { CardVocab } from "~components/CardVocab";
import { useAppSelector } from "../redux/hooks";
import { useEffect, useState } from "react";
import { sendToBackground } from "@plasmohq/messaging";
import type { NoteData } from "~types";

const VOCAB_KEY = "vocabulary"
const PARAPHRASE_KEY = "paraphrase"
const GM_CHECK_KEY = "gmCheck"

interface NoteProps { note: NoteData, url: string }

export function Note({ note, url }: NoteProps) {
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    async function fetchPreviewData() {
      const { result: previewData, error } = await sendToBackground({
        name: "preview",
        body: {
          url,
        }
      })

      if (error) {
        console.error(error)
        return
      }

      setPreviewData(previewData)
    }

    fetchPreviewData()
  }, [])


  const vocabulary = note[VOCAB_KEY]
  const paraphrases = note[PARAPHRASE_KEY]
  const gmChecks = note[GM_CHECK_KEY]

  console.log({
    gmChecks,
    paraphrases,
    vocabulary
  })

  return (
    <Card
      sx={{
        backgroundColor: "#eeeeee",
        borderBottom: "1px solid #eeeeee",
        boxShadow: "none",
        padding: 3,
        marginBottom: 8
      }}
    >
      <Stack>
        <Typography variant="h6" component="h6">
          {chrome.i18n.getMessage("note_subtitle_article_label")}
        </Typography>
        <Box sx={{ background: "#fff", padding: 2, marginBottom: 4 }}>
          <Stack direction="row" spacing={1}>
            <Box sx={{ background: "#e4e4e4", width: "8px", borderRadius: 1 }} />
            <Preview {...previewData} />
          </Stack>
        </Box>
      </Stack>

      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" component="h6">
            {chrome.i18n.getMessage("note_subtitle_vocab_label")}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {vocabulary && vocabulary.filter(validateVocab).map((vocabInfo) => {
              return (
                <Box sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                  <CardVocab vocab={vocabInfo.data} onSaveVocab={() => { }} shouldHideDiscard shouldHideSave />
                </Box>
              )
            })}
          </Stack>
        </Stack>
        <Stack>
          <Typography variant="h6" component="h6">
            {chrome.i18n.getMessage("note_subtitle_paraphrase_label")}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {paraphrases && paraphrases.map((paraphraseInfo) => {
              return (
                <Box sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                  <CardParaphrase paraphrase={paraphraseInfo} />
                </Box>
              )
            })}
            {!paraphrases || paraphrases.length === 0 && (
              <Box p={2} sx={{ background: "#fff" }}>
                <Typography variant="body1" component="span">
                  {chrome.i18n.getMessage("note_subtitle_paraphrase_empty_label")}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
        <Stack>
          <Typography variant="h6" component="h6">
            {chrome.i18n.getMessage("note_subtitle_gmcheck_label")}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {
              gmChecks && gmChecks.map((gmCheckInfo) => {
                return (
                  <Box sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                    <CardGMCheck gmCheck={gmCheckInfo} />
                  </Box>
                )
              })
            }
            {!gmChecks || gmChecks.length === 0 && (
              <Box p={2} sx={{ background: "#fff" }}>
                <Typography variant="body1" component="span">
                  {chrome.i18n.getMessage("note_subtitle_gmcheck_empty_label")}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Stack>

    </Card>
  )
}

function validateVocab(vocabInfo) {
  return vocabInfo.data && vocabInfo.data.word && vocabInfo.data.pronounce && vocabInfo.data.meaning
}