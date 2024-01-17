import Link from 'next/link'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Avatar, List, ListItem, ListItemText, Box, Typography, Grid, Stack, Button, Tab, Breadcrumbs } from '@mui/material'
// https://images.unsplash.com/photo-1627499949691-154d1fc004c2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80



const formatCategory = {
  ai: "AI",
  business: "Business",
  eu_stock: "🇪🇺 EU Stock",
  fintech: "Fintech",
  israel_hamas: "Israel-Hamas",
  jp_economy: "🇯🇵Japan | Economy",
  jp_news: "🇯🇵Japan | News",
  jp_stock: "🇯🇵Japan | Stock",
  marketing: "Marketing",
  metaverse: "Metaverse",
  russia_ukraine: "Russia-Ukraine",
  science: "Science",
  sdgs: "SDGs (Sustainable Development Goals)",
  startup: "Startup",
  tech: "Tech",
  us_stock: "🇺🇸US Stock",
  web3: "Web3",
  world_economy: "🌍World Economy",
  world_news: "🌍World News"
};

export function MaterialRow({ article }) {
  return (
    <Link key={article.sys.id} href={`/articles/${article.fields.slug}`} passHref legacyBehavior>
      <a style={{ position: "relative", textDecoration: "none", color: "inherit" }}>
        <Stack>
          <Box sx={{ paddingY: 0.3, paddingX: 0.5, borderRadius: 0.25 }}>
            <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase" }}>{formatCategory[article.fields.category]}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Box sx={{ width: "128px", height: "64px", flexGrow: 0 }}>
              <img alt={article.fields.title} src={article.fields.heroImage ? article.fields.heroImage.fields.file.url : ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Typography sx={{ fontFamily: "Crimson Text", fontSize: "1rem" }} >{article.fields.title}</Typography>
            </Box>

          </Stack>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Box sx={{ paddingY: 0.3, paddingX: 0.5, borderRadius: 0.25 }}>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.7rem", color: "#00100B", textTransform: "uppercase" }}>{new Date(article.fields.publishedDate).toLocaleDateString()}</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.7rem", color: "gray", textTransform: "uppercase" }}>{article.fields.wordCount} words</Typography>
            </Grid>
          </Grid>
        </Stack>
      </a>
    </Link>
  )
}