import { useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { CardChat } from './CardChat'
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOriginalMaterial } from "@/redux/features/materials";
import { fetchOrCreateLessonByMaterialId } from "@/redux/features/lessons";
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
    } else {
      setShouldOpenModalAuth(true)
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
        <InputChat
          onSubmit={handleTalk}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Stack>
    </Box>
  )
}