import {
  Box,
  Card,
  Typography,
  Stack
} from "@mui/material"
import {
  useAppSelector
} from "../redux/hooks"
import { Note } from "~components/Note"
import { useEffect, useMemo } from "react"
import { useAppDispatch } from "~/redux/hooks"
import { fetchSavedVocab, fetchSavedParaphrases } from "~redux/features/note"
import { fetchLessons } from "~redux/features/lessons"

export function NoteScreen() {
  const lessons = useAppSelector(state => state.lesson.lessons)
  const { vocabularies, paraphrases } = useAppSelector(state => state.note)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchSavedVocab())
    dispatch(fetchLessons())
    dispatch(fetchSavedParaphrases({}))
  }, [])

  const vocabMapByMaterialId = useMemo(() => {
    const map = new Map()
    vocabularies.forEach(vocab => {
      const materialId = vocab.vocabulary.materialId
      if (map.has(materialId)) {
        map.get(materialId).push(vocab)
      } else {
        map.set(materialId, [vocab])
      }
    })
    return map
  }, [vocabularies])

  const paraphraseMapByMaterialId = useMemo(() => {
    const map = new Map()
    paraphrases.forEach(paraphrase => {
      const materialId = paraphrase.paraphrase.sentence.message.lesson.material.id
      if (map.has(materialId)) {
        map.get(materialId).push(paraphrase)
      } else {
        map.set(materialId, [paraphrase])
      }
    })
    return map
  }, [paraphrases])

  console.log({ vocabMapByMaterialId, paraphraseMapByMaterialId })

  const notes = useMemo(() => {
    return lessons.map(lesson => {
      const note = {
        url: lesson.material.url,
        vocabulary: vocabMapByMaterialId.get(lesson.material.id) || [],
        paraphrases: paraphraseMapByMaterialId.get(lesson.material.id) || [],
        gmChecks: []
      }
      return note
    })
  }, [lessons, vocabularies])

  return (
    <Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h5" component="h6">
          {chrome.i18n.getMessage("menu_note")}
        </Typography>
      </Box>
      {/* {!data || Object.keys(data).length === 0 && (
        <Stack sx={{ background: "#f2f2f2", alignItems: "center", borderRadius: 2 }} p={2} mt={4}>
          <Typography variant="h6" component="h6">
            No data
          </Typography>
        </Stack>
      )} */}
      {notes.map((note) => {
        return (
          <Note key={note.url} note={note} />
        )
      })}
    </Box>
  )
}
