import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Grid, Stack, Button, Chip } from '@mui/material'
import { Header } from '../components/Header'
import { Material } from '../components/Material'
import styled from '@emotion/styled';
import Head from 'next/head'
import Link from 'next/link';
import { client } from '../utils/apis/contentful'
import { uniq } from 'lodash';
import { MaterialRow } from '../components/MaterialRow'

const BlogLayout = styled(Box)`
  overflow: auto;
  padding: 0 2rem;
`
const BlogHeader = styled(Box)`
  padding: 2rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
`


export const config = {
  amp: 'hybrid',
};



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

const formatCategoryJA = {
  ai: "AI",
  business: "ビジネス",
  eu_stock: "EU株",
  fintech: "フィンテック",
  israel_hamas: "イスラエルーハマス",
  jp_economy: "日本経済",
  jp_news: "日本関連全般",
  jp_stock: "日本株",
  marketing: "マーケティング",
  metaverse: "メタバース",
  russia_ukraine: "ウクライナ戦争",
  science: "科学",
  sdgs: "SDGs",
  startup: "スタートアップ",
  tech: "テクノロジー",
  us_stock: "米国株",
  web3: "Web3",
  world_economy: "世界株",
  world_news: "世界ニュース"
};


function getArticlesByCategory(articles) {
  return articles.reduce((acc, article) => {
    if (!acc[article.fields.category]) {
      acc[article.fields.category] = []
    }
    acc[article.fields.category].push(article)
    return acc
  }, {})
}

function getArticlesByPublishedDate(articles) {
  return articles.reduce((acc, article) => {
    if (!acc[article.fields.publishedDate]) {
      acc[article.fields.publishedDate] = []
    }
    acc[article.fields.publishedDate].push(article)
    return acc
  }, {})
}

function getArticlesArrByDate(articlesByPublishedDate) {
  return articlesByPublishedDate &&
    Object.keys(articlesByPublishedDate)
      .sort(
        (a, b) => {
          if (a > b) {
            return -1
          } else {
            return 1
          }
        })
      .map((publishedDate) => {
        return articlesByPublishedDate[publishedDate]
      })
}

const categoryJaOrder = [
  "jp_news",
  "jp_economy",
  "jp_stock",
  "world_news",
  "world_economy",
  "us_stock",
  "eu_stock",
  "russia_ukraine",
  "business",
  "marketing",
  "tech",
  "fintech",
  "web3",
  "metaverse",
  "sdgs",
  "science",
]

export default function ArticleIndex({ articles }) {
  const router = useRouter()

  const articlesSorted = useMemo(() =>
    articles.filter((article) => article.fields.publishedDate).sort(
      (a, b) => {
        if (a.fields.publishedDate > b.fields.publishedDate) {
          return -1
        } else {
          return 1
        }
      }),
    [articles]
  )

  const articlesByPublishedDate = useMemo(() =>
    getArticlesByPublishedDate(articlesSorted),
    [articlesSorted]
  )

  const latestArtciles = useMemo(() =>
    getArticlesArrByDate(articlesByPublishedDate)[0],
    [articlesByPublishedDate]
  )

  const restArticles = useMemo(() =>
    getArticlesArrByDate(articlesByPublishedDate).slice(1).flat(),
    [articlesByPublishedDate]
  )

  const articlesByCategory = useMemo(() =>
    getArticlesByCategory(restArticles),
    [articlesSorted]
  )

  return (
    <>
      <Head>
        <title>Orca  | News for ESL students</title>
        <meta name="title" content="Orca | Mens skincare, haircare" />
        <meta name="description" content="Orca is community/website for men to find right mens skincare, haircare, and personal care products." />
        <meta property="og:title" content=" | Mens skincare, haircare" />
        <meta property="og:locale" content="en_GB (or other locality code)" />
        <meta property="og:description" content="Orca is community/website for men to find right mens skincare, haircare, and personal care products." />
        <meta property="og:image" content="Image URL representing Orca" />
        <meta property="og:image:width" content="Image Width" />
        <meta property="og:image:height" content="Image Height" />
        <meta property="og:image:alt" content="Image alternative text, if the image is missing" />
        <meta property="og:image:type" content="image/png (or other i.e. image/jpeg, image/gif)" />
        <meta property="og:url" content="https://www.oudweb.com" />
        <meta property="og:site_name" content="Orca" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="Website URL" />
        <meta name="twitter:title" content="Title for page" />
        <meta name="twitter:creator" content="Your Twitter Handle" />
        <meta name="twitter:description" content="Orca is community/website for men to find right mens skincare, haircare, and personal care products." />
        <meta name="twitter:image" content="Image of page" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://www.oudweb.com" />
        {/* <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addProductJsonLd()}
          key="product-jsonld"
        /> */}
      </Head>
      <Box sx={{ minHeight: "100vh" }} px={{ xs: 1, md: 24 }}>
        <Header />
        {/* 
        <Grid container spacing={1} p={2}>
          <Grid item xs={12} sm={8}>
            <SurveyBanner />
          </Grid>
          <Grid item xs={12} sm={4}>
            <AboutBanner />
          </Grid>
        </Grid> */}



        {/* <Box p={2}>
          <Typography variant="h1" sx={{ fontFamily: "Crimson Text", fontSize: "2rem" }}>Articles</Typography>
        </Box> */}
        <Stack direction="row" sx={{ width: "100%", paddingLeft: 2, paddingRight: 2, overflow: "scroll", boxSizing: "border-box" }}>
          <Box mr={1}>
            <Chip sx={{ fontFamily: 'var(--font-outfit)', fontSize: 14, padding: 2, lineHeight: 24 }} label="最新" />
          </Box>
          {categoryJaOrder && categoryJaOrder.map((category) => (
            <Box mr={1}>
              <Chip
                sx={{ fontFamily: 'var(--font-outfit)', fontSize: 14, padding: 2, lineHeight: 24 }}
                label={`${formatCategoryJA[category]}`}
                onClick={() => router.push(`#${category}`)}
              />
            </Box>
          ))}
        </Stack>
        <Typography
          variant="h1"
          sx={{ fontFamily: "Crimson Text", fontSize: "1.2rem", paddingX: 2, paddingTop: 3 }}
        >
          最新ニュース
        </Typography>
        <Grid container py={3} p={2} spacing={{ xs: 3, sm: 2 }}>
          {latestArtciles.map((article) => (
            <Grid key={article.id} item xs={12} sm={6} md={4}>
              <Material article={article} />
            </Grid>
          ))}
        </Grid>
        {Object.keys(articlesByCategory).map((category) => (
          <Box id={`${category}`} key={category}>
            <Box sx={{ background: "#191c29", width: "auto", display: "flex", alignItems: "center", padding: 1, borderRadius: 1 }}>
              <Typography variant="h1" sx={{ fontFamily: "Crimson Text", fontSize: "1rem", color: "#fff" }}>{formatCategoryJA[category]}</Typography>
            </Box>
            <Grid container py={2} p={2} spacing={2}>
              {articlesByCategory[category] && articlesByCategory[category].map((article) => (
                <Grid key={article.id} item xs={12} sm={6} md={4}>
                  <MaterialRow article={article} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

      </Box>
    </>
  )
}

function SurveyBanner() {
  return (
    <Box sx={{ borderRadius: 1, position: "relative" }}>
      <img src="static/img/banner2.jpg" width="100%" height="320px" style={{ borderRadius: 8, objectFit: "cover", objectPosition: "center" }} />
      <Box sx={{ position: "absolute", top: "10%", paddingX: 4 }}>
        <Stack spacing={2} >
          <Stack>
            <Typography sx={{ color: "#fff", fontFamily: "Crimson Text", fontSize: "2.4rem" }}>Find out your skin type</Typography>
            <Typography sx={{ fontSize: "1.2rem", color: "#fff", textTransform: "uppercase" }}>Take Skincare Questionnaire</Typography>
          </Stack>
          <Box>
            <Link href="/quiz/skincare" passHref legacyBehavior>
              <Button sx={{ background: "#fff", textTransform: "uppercase", color: "#00100B" }}>Start</Button>
            </Link>
          </Box>
        </Stack>
      </Box>
    </Box>

  )
}

function AboutBanner() {
  return (
    <Box sx={{ borderRadius: 1, position: "relative" }}>
      <Link href="/profile" passHref legacyBehavior>
        <a>
          <img src="static/img/bannerAbout.jpg" width="100%" height="320px" style={{ borderRadius: 8, objectFit: "cover", objectPosition: "center" }} />
        </a>
      </Link>
    </Box>
  )
}

export async function getServerSideProps({ params }) {
  const res = await client.getEntries({
    content_type: "newsArticle",
    limit: 200,
  })

  const articles = res.items

  if (!articles) {
    return {
      notFound: true,
    }
  }

  const filteredArticles = articles.filter((article) => article.fields.slug !== "style-guide")
  return {
    props: {
      articles: filteredArticles
    },
  };
}


