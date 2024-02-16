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

const synth = window.speechSynthesis;

export function CardParaphrase({
  paraphrase,
  shouldHideSave,
  shouldHideDiscard,
}: {
  paraphrase: ParaphraseItem,
  shouldHideSave?: boolean,
  shouldHideDiscard?: boolean
}) {

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
            {paraphrase.sentence.message.content}
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
            {paraphrase.content}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  )
}