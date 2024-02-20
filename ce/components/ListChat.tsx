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
import { CardChat } from "./CardChat";

export function ListChat({ messages, loadingAIResp, isAutoPlay, url }) {
  return (
    <Stack spacing={1} sx={{ marginTop: 2 }}>
      {
        messages && messages.map((message) => {
          return (
            <Box key={message.id} mb={2} key={message.message}>
              <CardChat {...message} isAutoPlay={isAutoPlay} url={url} />
            </Box>
          )
        })
      }
      {
        loadingAIResp && <CardChat type="ai" loading />
      }
    </Stack >
  )
}