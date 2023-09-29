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

export function ListChat({ messages, loadingAIResp, isAutoPlay }) {
  return (
    <Stack spacing={1} sx={{ marginTop: 2 }}>
      {
        messages.map((message) => {
          return (
            <Box mb={2} key={message.message}>
              <CardChat type={message.type} content={message.message} isAutoPlay={isAutoPlay} />
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