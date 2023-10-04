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
import { RxCrossCircled } from "react-icons/rx"
import { RxCheckCircled } from "react-icons/rx"
import type { GMCheckItem } from "~types";

interface CardGMCheckProps {
  gmCheck: GMCheckItem,
  shouldHideSave?: boolean,
  shouldHideDiscard?: boolean
}

export function CardGMCheck({
  gmCheck,
  shouldHideSave,
  shouldHideDiscard,
}: CardGMCheckProps) {

  console.log({ gmCheck })
  return (
    <Card sx={{ width: "100%", height: "auto", boxShadow: "none", border: "1px solid #eeeeee" }}>
      <Stack p={3} spacing={0.5}>
        <Stack>
          <Typography variant="caption" color="#b4b4b4">
            Original
          </Typography>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <RxCrossCircled size={18} color="#ff0000" />
            <Typography
              variant="h6"
              component="h6"
              sx={{
                fontSize: 18,
              }}
            >
              {gmCheck.text}
            </Typography>
          </Stack>
        </Stack>
        <TbArrowBigDownLinesFilled size={18} color="#a4a4a4" />
        <Stack>
          <Typography variant="caption" color="#b4b4b4">
            Suggestion
          </Typography>
          {gmCheck.suggestions && gmCheck.suggestions.map((suggestion) => {
            return (
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                <RxCheckCircled size={18} color="#00b600" />
                <Typography
                  variant="h6"
                  component="h6"
                  sx={{
                    fontSize: 18,
                  }}
                >
                  {suggestion.suggestion}
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      </Stack>
    </Card>
  )
}