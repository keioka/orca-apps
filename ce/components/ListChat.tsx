import {
  Stack,
  Box,
} from "@mui/material"
import { CardChat } from "./CardChat";

export function ListChat({ messages, isCreatingMessage, isAutoPlay, url }) {
  return (
    <Stack spacing={1} sx={{ marginTop: 2 }}>
      {
        messages && messages.map((message, index) => {
          return (
            <Box key={message.id} mb={2}>
              <CardChat {...message} isAutoPlay={isAutoPlay} url={url} isLastMessage={index === messages.length - 1} />
            </Box>
          )
        })
      }
      {
        isCreatingMessage && <CardChat key="ai_init" type="ai" loading />
      }
    </Stack >
  )
}