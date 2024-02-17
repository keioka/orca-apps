import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  AppBar,
} from "@mui/material"
import {
  useAppSelector
} from "../redux/hooks"
import { Note } from "~components/Note"
import { useEffect, useMemo } from "react"
import { useAppDispatch } from "~/redux/hooks"
import { fetchSavedVocab, fetchSavedParaphrases } from "~redux/features/note"
import { fetchLessons } from "~redux/features/lessons"
import { useFirebase } from "~firebase/hooks"
import { setSession, fetchCurrentUser } from "~redux/features/auth"
import { ButtonGoogleAuth } from "~components/ButtonGoogleAuth"

export function NoteScreen() {
  const dispatch = useAppDispatch()
  const lessons = useAppSelector(state => state.lesson.lessons)
  const { vocabularies, paraphrases } = useAppSelector(state => state.note)
  const currentUser = useAppSelector(state => { return state.auth.currentUser })
  const session = useAppSelector(state => { return state.auth.session })
  const { user, session: sessionFB, onLoginBackground, onLogout } = useFirebase()

  useEffect(() => {
    dispatch(setSession(sessionFB))
  }, [sessionFB])

  useEffect(() => {
    if (session) {
      dispatch(fetchCurrentUser())
    }
  }, [session])

  useEffect(() => {
    if (!session) return
    dispatch(fetchLessons())
    dispatch(fetchSavedVocab())
    dispatch(fetchSavedParaphrases({}))
  }, [session])

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
    if (!paraphrases) return map
    paraphrases.filter(paraphraseInfo => Boolean(paraphraseInfo)).forEach(paraphraseInfo => {
      const materialId = paraphraseInfo.paraphrase.sentence.message.lesson.material.id
      if (map.has(materialId)) {
        map.get(materialId).push(paraphraseInfo.paraphrase)
      } else {
        map.set(materialId, [paraphraseInfo.paraphrase])
      }
    })
    return map
  }, [paraphrases])

  const handleLogin = () => {
    onLoginBackground()
  }

  const notes = useMemo(() => {
    return [...lessons]
      .filter(lesson => lesson.material && lesson.material.url)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .map(lesson => {
        const note = {
          material: lesson.material,
          lessonStartedAt: lesson.createdAt,
          url: lesson.material.url,
          vocabulary: vocabMapByMaterialId.get(lesson.material.id) || [],
          paraphrases: paraphraseMapByMaterialId.get(lesson.material.id) || [],
          gmChecks: []
        }
        return note
      })
  }, [lessons, vocabularies])

  if (!session) {
    return (
      <Stack sx={{ background: "#f2f2f2", alignItems: "center", borderRadius: 2 }} p={2} mt={4}>
        <Typography variant="h6" component="h6">
          Please login to see your notes
        </Typography>
        <ButtonGoogleAuth onClick={handleLogin} />
      </Stack>
    )
  }

  return (
    <Box>
      <AppBar sx={{ width: "100%", background: "#fff", boxShadow: "none", borderBottom: "1px solid #e4e4e4" }}>
        <Stack direction="row" spacing={2} sx={{ padding: 2, justifyContent: "space-between" }}>
          <Typography variant="h5" component="h6">
            {chrome.i18n.getMessage("menu_note")}
          </Typography>
          <Button variant="contained" sx={{ color: "#fff" }} onClick={onLogout}>Logout</Button>
        </Stack>
      </AppBar>
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
