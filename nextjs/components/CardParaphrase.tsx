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
import { ButtonRound } from "./ButtonRound";
import { TbArrowBigDownLinesFilled } from "react-icons/tb";
import type { ParaphraseItem } from "~types"

export function CardParaphrase({
  paraphrase,
  shouldHideSave,
  shouldHideDiscard,
}: {
  paraphrase: ParaphraseItem,
  shouldHideSave?: boolean,
  shouldHideDiscard?: boolean
}) {

  const material = paraphrase.paraphrase.sentence.message.lesson.material
  const materialTitle = material.title
  const materialImageUrl = material.imageUrl

  return (
    <Card sx={{ width: "100%", height: "auto", boxShadow: "none", border: "1px solid #eeeeee" }}>
      <Stack p={3} spacing={0.5}>
        <Stack>
          <Typography variant="caption" color="#b4b4b4">
            Original
          </Typography>
          <Typography
            variant="h6"
            component="h6"
            sx={{
              fontSize: 18,
            }}
          >
            {paraphrase.paraphrase.sentence.message.content}
          </Typography>
        </Stack>
        <TbArrowBigDownLinesFilled size={18} color="#a4a4a4" />
        <Stack>
          <Typography variant="caption" color="#b4b4b4">
            Suggestion
          </Typography>
          <Typography
            variant="h6"
            component="h6"
            sx={{
              fontSize: 18,
            }}
          >
            {paraphrase.paraphrase.content}
          </Typography>
        </Stack>
        <Stack>
          <Typography variant="caption" color="#b4b4b4">
            Source
          </Typography>
          <Stack direction="row" spacing={1}>
            <img src={materialImageUrl} style={{ width: "64px", height: "64px", objectFit: "cover" }} />
            <Typography
              variant="h6"
              component="h6"
              sx={{
                fontSize: 18,
              }}
            >
              {materialTitle}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}