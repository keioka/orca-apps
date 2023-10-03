import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import type { ParaphraseItem } from "~types";
import { ButtonSaveItem } from "./ButtonSaveItem";

export function CardSmParaphrase({ item, onSave }: { item: ParaphraseItem, onSave: () => void }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
      <Box sx={{ width: "100%", border: "1px solid #e8e8e8", background: "#fff", borderRadius: 1, padding: 1, marginY: 1 }}>
        <Typography sx={{ fontSize: 16 }}>
          {item.sentence}
        </Typography>
      </Box>
      <ButtonSaveItem onSave={onSave} />
    </Stack>
  )
}