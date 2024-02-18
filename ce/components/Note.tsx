import { Box, Card, Stack, Typography } from "@mui/material";
import { Preview } from "~components/Preview";
import { CardGMCheck } from "~components/CardGMCheck";
import { CardParaphrase } from "~components/CardParaphrase";
import { CardVocab } from "~components/CardVocab";
import { useAppSelector } from "../redux/hooks";
import { useEffect, useState } from "react";
import { sendToBackground } from "@plasmohq/messaging";
import type { NoteData, VocabularyInfo, ParaphraseInfo, GMCheckInfo } from "~types";
import materials from "~redux/features/materials";
import moment from "moment";

const VOCAB_KEY = "vocabulary"
const PARAPHRASE_KEY = "paraphrases"
const GM_CHECK_KEY = "grammarMistakes"

interface NoteProps { note: NoteData }

export function Note({ note }: NoteProps): JSX.Element {
  const vocabulary: VocabularyInfo[] | undefined = note[VOCAB_KEY]
  const paraphrases: ParaphraseInfo[] | undefined = note[PARAPHRASE_KEY]
  const gmChecks: GMCheckInfo[] | undefined = note[GM_CHECK_KEY]

  return (
    <Card
      sx={{
        backgroundColor: "#f3f3f3",
        boxShadow: "none",
        padding: 3,
        marginBottom: 8
      }}
    >
      <Stack>
        <Typography variant="h6" component="h6">
          {chrome.i18n.getMessage("note_subtitle_lesson_start_at")}: {moment(note.lessonStartedAt).format("YYYY/MM/DD HH:mm:ss")}
        </Typography>

        <Typography variant="h6" component="h6">
          {chrome.i18n.getMessage("note_subtitle_article_label")}
        </Typography>
        <Box sx={{ background: "#fff", padding: 2, marginBottom: 4 }}>
          <Stack direction="row" spacing={1}>
            <Box sx={{ background: "#e4e4e4", width: "8px", borderRadius: 1 }} />
            <Preview
              title={note.material.title}
              description={note.material.description}
              imageUrl={note.material.imageUrl}
              url={note.material.url}
            />
          </Stack>
        </Box>
      </Stack>

      <Stack spacing={2}>
        <Stack>
          <Typography variant="h6" component="h6">
            {chrome.i18n.getMessage("note_subtitle_vocab_label")}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {vocabulary && vocabulary.map((vocabInfo) => {
              return (
                <Box key={`note_vocabulary_${vocabInfo.id}`} sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                  <CardVocab vocab={vocabInfo.vocabulary} onSaveVocab={() => { }} shouldHideDiscard shouldHideSave />
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
            {paraphrases && paraphrases.map((paraphrase) => {
              return (
                <Box key={`note_paraphrase_${paraphrase.id}`} sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                  <CardParaphrase paraphrase={paraphrase} />
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
                  <Box key={`note_gmChecks_${gmCheckInfo.id}`} sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                    <CardGMCheck gmCheck={gmCheckInfo.data} />
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

interface PreviewData {
  // Define the properties of the PreviewData object here
}
