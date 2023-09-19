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

interface PreviewProps {
  title: string
  description: string
  imageUrl: string
  url: string
}

export function Preview(props: PreviewProps) {
  return (
    <Card
      sx={{
        width: "100%",
        height: "auto",
        boxShadow: "none",
        border: "1px solid #f2f2f2",
      }}
    >
      <Stack direction="row">
        <Box>
          <img src={props.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: 'cover', borderRadius: "4px 0px 0px 4px" }} />
        </Box>
        <Stack spacing={1} sx={{ marginBottom: 1 }} p={2}>
          <Typography variant="body2" component="h5" sx={{ fontSize: 12 }}>
            {props.title}
          </Typography>
          <Typography variant="body2" component="h6" sx={{ fontSize: 10 }}>
            {props.description}
          </Typography>
          <Typography variant="body2" component="h6" sx={{ fontSize: 10 }}>
            {props.url}
          </Typography>
        </Stack>
      </Stack>

    </Card>
  )
}