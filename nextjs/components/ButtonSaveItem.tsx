import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { BsFillBookmarkFill } from "react-icons/bs";

export function ButtonSaveItem({ onSave, isSaved }: { onSave: () => void, isSaved: boolean }) {
  return (
    <Stack sx={{ alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      <BsFillBookmarkFill size={18} color={isSaved ? "yellow" : "rgba(0,0,0,0.2)"} onClick={onSave} />
      <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.2)" }}>
        Save
      </Typography>
    </Stack>
  )
}