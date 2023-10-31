import {
  Box,
  Card,
  Typography,
  Stack
} from "@mui/material"
import {
  useAppSelector
} from "../redux/hooks"
import { Note } from "~components/Note"

export function NoteScreen() {
  const data = useAppSelector(state => state.saveData)

  return (
    <Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h5" component="h6">
          {chrome.i18n.getMessage("menu_note")}
        </Typography>
      </Box>
      {!data || Object.keys(data).length === 0 && (
        <Stack sx={{ background: "#f2f2f2", alignItems: "center", borderRadius: 2 }} p={2} mt={4}>
          <Typography variant="h6" component="h6">
            No data
          </Typography>
        </Stack>
      )}
      {Object.keys(data).map((url) => {
        const note = data[url]
        return (
          <Note note={note} url={url} />
        )
      })}
    </Box>
  )
}
