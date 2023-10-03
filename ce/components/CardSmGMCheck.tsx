import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { RxCrossCircled } from "react-icons/rx"
import { RxCheckCircled } from "react-icons/rx"
import { BsFillBookmarkFill } from "react-icons/bs";

import type { GMCheckItem } from "~types"

import { ButtonSaveItem } from "./ButtonSaveItem"

interface CardSmGMCheckProps {
  item: GMCheckItem;
  onSave: () => void;
}

export function CardSmGMCheck({ item, onSave }: CardSmGMCheckProps) {
  return (
    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
      <Stack sx={{ width: "100%", border: "1px solid #e8e8e8", background: "#fff", borderRadius: 1, padding: 1, marginY: 1 }} spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ minWidth: 16, width: 16, alignItems: "center", justifyContent: "center" }}>
            <RxCrossCircled color="#ff0000" size={16} />
          </Box>
          <Typography sx={{ fontSize: 16 }}>
            {item.text}
          </Typography>
        </Stack>
        {item.suggestions && item.suggestions.map((suggestionItem) => {
          return (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Box sx={{ minWidth: 16, width: 16, alignItems: "center", justifyContent: "center" }}>
                <RxCheckCircled color="#00b600" />
              </Box>
              <Typography sx={{ fontSize: 16 }}>
                {suggestionItem.suggestion}
              </Typography>
            </Stack>
          )
        })}
      </Stack>
      <ButtonSaveItem onSave={onSave} />
    </Stack>
  )
}