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

export function Material({ article, locale }) {
  return (
    <Link key={article.id} href={`/articles/${article.slug}`} passHref legacyBehavior>
      <a style={{ position: "relative", textDecoration: "none", color: "inherit" }}>
        <Stack>
          <Box sx={{ position: "absolute", top: 0, left: 0 }}>
            <Box sx={{ background: "#191c29", paddingY: 0.3, paddingX: 0.5, borderRadius: 0.25 }}>
              <Typography sx={{ fontSize: "1rem", color: "#fff" }}>{formatCategory[article.category]}</Typography>
            </Box>
          </Box>
          <img alt={article.title} src={article.heroImageUrl ? article.heroImageUrl : ""} style={{ width: "100%", maxHeight: "320px", objectFit: "cover" }} />
          <Typography sx={{ fontFamily: "Crimson Text", fontSize: "1.2rem" }} mt={0.5}>{article.localeTitle[locale] || article.title}</Typography>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Box sx={{ paddingY: 0.3, paddingX: 0.5, borderRadius: 0.25 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#00100B", textTransform: "uppercase" }}>{new Date(article.publishedDate).toLocaleDateString()}</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Typography sx={{ fontSize: "0.9rem", color: "gray", textTransform: "uppercase" }}>{article.wordCount} words</Typography>
            </Grid>
          </Grid>
        </Stack>
      </a>
    </Link>
  )
}