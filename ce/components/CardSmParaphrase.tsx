import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import type { ParaphraseItem } from "~types";
import { ButtonSaveItem } from "./ButtonSaveItem";

export function CardSmParaphrase({ item, onSave, isSaved }: { item: ParaphraseItem, onSave: () => void, isSaved: boolean }) {
  return (
    <Stack sx={{ width: "100%" }}>
      <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
        <Box sx={{ width: "100%", border: "1px solid #e8e8e8", background: "#fff", borderRadius: 1 }} p={1}>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            {item.content}
          </Typography>
        </Box>
        <ButtonSaveItem onSave={onSave} isSaved={isSaved} />
      </Stack>

      <Typography sx={{ fontSize: 12, fontWeight: "500", marginTop: 0 }}>
        {item.type.toUpperCase()}
      </Typography>
    </Stack>
  )
}