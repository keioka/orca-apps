import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { BsFillBookmarkFill } from "react-icons/bs";

export function ButtonSaveItem({ onSave }) {
  return (
    <Stack sx={{ alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      <BsFillBookmarkFill size={18} color="rgba(0,0,0,0.2)" onClick={onSave} />
      <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.2)" }}>
        Save
      </Typography>
    </Stack>
  )
}