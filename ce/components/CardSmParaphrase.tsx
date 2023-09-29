import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { BsFillBookmarkFill } from "react-icons/bs";

export function CardSmParaphrase({ item }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
      <Box sx={{ width: "100%", border: "1px solid #e8e8e8", background: "#fff", borderRadius: 1, padding: 1, marginY: 1 }}>
        <Typography variant="caption" component="h6">
          {item.sentence}
        </Typography>
      </Box>
      <BsFillBookmarkFill size={18} color="#eeeeee" />
    </Stack>
  )
}