import Link from 'next/link'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Avatar, List, ListItem, ListItemText, Box, Typography, Grid, Stack, Button, Tab, Breadcrumbs } from '@mui/material'
// https://images.unsplash.com/photo-1627499949691-154d1fc004c2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80

export function Material({ article }) {
  return (
    <Link key={article.sys.id} href={`/articles/${article.fields.slug}`} passHref legacyBehavior>
      <a style={{ textDecoration: "none", color: "inherit" }}>
        <Stack>
          <img alt={article.fields.title} src={article.fields.heroImage ? article.fields.heroImage.fields.file.url : ""} style={{ width: "100%", height: "320px", objectFit: "cover" }} />
          <Typography sx={{ fontFamily: "Crimson Text", fontSize: "1.2rem" }} mt={0.5}>{article.fields.title}</Typography>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Box sx={{ background: "#e1c790", paddingY: 0.3, paddingX: 0.5, borderRadius: 0.25 }}>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.7rem", color: "#00100B", textTransform: "uppercase" }}>Read</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.7rem", color: "gray", textTransform: "uppercase" }}>2 min to read</Typography>
            </Grid>
          </Grid>
        </Stack>
      </a>
    </Link>
  )
}