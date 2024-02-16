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
import { CardVocab } from "./CardVocab";
import { Player, Controls } from '@lottiefiles/react-lottie-player';
const sampleVocabs = [
  {
    word: "hello",
    pronounce: "həˈloʊ",
    meaning: "xin chào",
    example: "Hello, how are you?",
    sentence: "Xin chào, bạn khỏe không?",
  }
]
export function ListVocab({ direction, vocabs = sampleVocabs, savedVocabs, isLoading, onSaveVocab }: { direction?: "row" | "column", vocabs: any, isLoading: boolean }) {
  if (isLoading) {
    return (
      <Player
        autoplay
        loop
        src="https://lottie.host/f5d3cdb1-d14c-4e57-9287-df6f93f302af/1yKt5SJGbU.json"
        style={{ height: '300px', width: '300px' }}
      />
    )
  }

  if (!vocabs) {
    return null
  }
  return (
    <Stack direction={direction} spacing={2} pb={2}>
      {
        vocabs.map((vocab) => {
          const isSaved = savedVocabs?.find((v) => v.vocabularyId === vocab.id)
          console.log("isSaved", isSaved)
          return (
            <CardVocab vocab={vocab} onSaveVocab={onSaveVocab} isSaved={isSaved} />
          )
        })
      }
    </Stack>
  )
}
