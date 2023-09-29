import {
  Box,
  Card,
  Typography,
  Stack
} from "@mui/material"
import {
  useAppSelector
} from "../redux/hooks"
import { CardVocab } from "~components/CardVocab"
import { CardParaphrase } from "~components/CardParaphrase"
import { CardGMCheck } from "~components/CardGMCheck"
import { Preview } from "~components/Preview"
import { useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"

const VOCAB_KEY = "vocabulary"

function Note({ note, url }) {
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

  console.log({ previewData })

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
          Article
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
            Vocabularies
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {note[VOCAB_KEY].filter(validateVocab).map((vocabInfo) => {
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
            Rephrase
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {[
              { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
              { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
              { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
              { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
              { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
              { original: "This is an original sentence", suggestion: "This is a suggestion sentence" }
            ].map((paraphraseInfo) => {
              return (
                <Box sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                  <CardParaphrase paraphrase={paraphraseInfo} />
                </Box>
              )
            })}
          </Stack>
        </Stack>
        <Stack>
          <Typography variant="h6" component="h6">
            Grammar Mistake
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%" }}>
            {
              [
                { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
                { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
                { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
                { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
                { original: "This is an original sentence", suggestion: "This is a suggestion sentence" },
                { original: "This is an original sentence", suggestion: "This is a suggestion sentence" }
              ].map((gmCheckInfo) => {
                return (
                  <Box sx={{ width: 320, maxWidth: 320, minWidth: 320 }}>
                    <CardGMCheck gmCheck={gmCheckInfo} />
                  </Box>
                )
              })
            }
          </Stack>
        </Stack>
      </Stack>

    </Card>
  )
}
export function NoteScreen() {
  const data = useAppSelector(state => state.saveData)

  return (
    <Box>
      <Typography variant="h5" component="h6">
        Note
      </Typography>
      {Object.keys(data).map((url) => {
        const note = data[url]
        return (
          <Note note={note} url={url} />
        )
      })}
    </Box>
  )
}

function validateVocab(vocabInfo) {
  return vocabInfo.data && vocabInfo.data.word && vocabInfo.data.pronounce && vocabInfo.data.meaning
}