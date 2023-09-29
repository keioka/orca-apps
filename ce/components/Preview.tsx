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
    <a href={props.url} style={{ textDecoration: "none" }}>
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
            <img src={props.imageUrl} alt="" style={{ width: "100%", maxWidth: 340, height: "100%", objectFit: 'cover', borderRadius: "4px 0px 0px 4px" }} />
          </Box>
          <Stack spacing={1} sx={{ marginBottom: 1 }} p={2}>
            <Typography
              variant="h6"
              component="h6"
              sx={{
                fontSize: 18,
              }}
            >
              {props.title}
            </Typography>
            <Typography variant="body2" component="h6" sx={{ fontSize: 14, color: "#a4a4a4" }}>
              {props.description}
            </Typography>
            <Typography variant="body2" component="h6" sx={{ fontSize: 12, textDecoration: "none" }}>
              <a href={props.url} style={{ textDecoration: "none", color: "blue" }}>{props.url}</a>
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </a>
  )
}