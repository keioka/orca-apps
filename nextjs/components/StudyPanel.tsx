import { useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { CardChat } from './CardChat'
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOriginalMaterial } from "@/redux/features/materials";
import { fetchOrCreateLessonByMaterialId, fetchSampleResponses, clearSampleResponses } from "@/redux/features/lessons";
import { fetchMessages, createAIMessage, addUserMessage } from "@/redux/features/messages";
import { InputChat } from '@/components/InputChat'

const messages = [
  {
    content: "What do you think of the article?",
    type: "ai"
  },
  {
    content: "Hello",
    type: "human"
  },
]

export function StudyPanel({
  article,
  currentUser,
  setShouldOpenModalAuth
}: {
  article: any,
  currentUser: any,
  setShouldOpenModalAuth: any
}) {
  const dispatch = useAppDispatch()
  const currentOpenedOriginalMaterial = useAppSelector((state) => state.material.currentOpenedOriginalMaterial)
  const currentLesson = useAppSelector((state) => state.lesson.lessons.find((lesson) => lesson.materialId === currentOpenedOriginalMaterial?.id))
  const isLoadingLesson = useAppSelector((state) => state.lesson.loading)
  const messages = useAppSelector((state) => currentLesson ? state.message.messageMap[currentLesson.id] || [] : [])
  const isCreatingMessage = useAppSelector((state) => state.message.creatingMessage)
  const sampleResponses = useAppSelector((state) => state.lesson.sampleResponses)
  const loadingSampleResponses = useAppSelector((state) => state.lesson.loadingSampleResponses)

  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isCreatingMessage && currentLesson && !currentLesson.initMessage && messages.length === 0) {
      dispatch(createAIMessage({ message: "Ask me a question about the news.", lessonId: currentLesson.id }))
    }
  }, [currentLesson, messages])

  useEffect(() => {
    if (article) {
      dispatch(fetchOriginalMaterial({ externalId: article.sys.id }))
    }
  }, [article])

  console.log({ currentOpenedOriginalMaterial })
  useEffect(() => {
    if (currentOpenedOriginalMaterial && currentUser) {
      dispatch(fetchOrCreateLessonByMaterialId(currentOpenedOriginalMaterial.id))
    }
  }, [currentOpenedOriginalMaterial, currentUser])

  useEffect(() => {
    if (currentLesson) {
      dispatch(fetchMessages(currentLesson.id))
    }
  }, [currentLesson])

  const handleTalk = () => {
    if (currentUser && currentLesson) {
      dispatch(addUserMessage({ lessonId: currentLesson.id, message }))
      dispatch(createAIMessage({ lessonId: currentLesson.id, message }))
      dispatch(clearSampleResponses())
      setMessage("")
    } else {
      setShouldOpenModalAuth(true)
    }
  }

  const handleFetchSamples = () => {
    if (currentLesson) {
      dispatch(fetchSampleResponses(currentLesson.id))
    }
  }

  if (!currentOpenedOriginalMaterial) {
    return null
  }

  return (
    <Box sx={{ padding: 1 }}>
      <Box mb={1} px={2}>
        <Typography variant="h6">AIと会話してみよう！</Typography>
      </Box>
      <Stack sx={{ background: "#f3f3f3", padding: 2 }} spacing={1}>
        {messages.map((message) => (
          <CardChat message={message} />
        ))}
        {loadingSampleResponses && <Box sx={{ background: "#fff" }} p={3}>AIの返答例を取得中...</Box>}
        {sampleResponses && sampleResponses.length > 0 && <Box sx={{ background: "#fff" }} p={3}>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>AIの返答例:</Typography>
          {sampleResponses.map((response) => (
            <Box sx={{ borderTop: "1px solid #e4e4e4", paddingTop: 2 }}>
              <Box mb={2} sx={{ fontSize: 16 }}>{response.sentence}</Box>
              <Box mb={2} sx={{ fontSize: 14, color: "#747474" }}>{response.jaSentence}</Box>
            </Box>
          ))}
        </Box>}

        <InputChat
          onSubmit={handleTalk}
          onClickFetchSamples={handleFetchSamples}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Stack>
    </Box>
  )
}