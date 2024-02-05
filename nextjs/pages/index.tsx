import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Grid, Stack, Button } from '@mui/material'
import { Header } from '../components/Header'
import { Material } from '../components/Material'
import styled from '@emotion/styled';
import Head from 'next/head'
import Link from 'next/link';
import { client } from '../utils/apis/contentful'
import { uniq } from 'lodash';
import { MaterialRow } from '../components/MaterialRow'
import { Chip } from '../components/Chip'

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
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {})
}

function getArticlesByPublishedDate(articles) {
  return articles.reduce((acc, article) => {
    if (!acc[article.publishedDate]) {
      acc[article.publishedDate] = []
    }
    acc[article.publishedDate].push(article)
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

export default function ArticleIndex({ articles }: { articles: Article[] }) {
  const router = useRouter()
  const locale = 'ja'

  const articlesSorted = useMemo(() =>
    articles.filter((article) => article.publishedDate).sort(
      (a, b) => {
        if (a.publishedDate > b.publishedDate) {
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
        <meta property="og:url" content="https://orcatalk.news" />
        <meta property="og:site_name" content="Orca" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="Website URL" />
        <meta name="twitter:title" content="Title for page" />
        <meta name="twitter:creator" content="Your Twitter Handle" />
        <meta name="twitter:description" content="Orca is community/website for men to find right mens skincare, haircare, and personal care products." />
        <meta name="twitter:image" content="Image of page" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://orcatalk.news" />
        {/* <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addProductJsonLd()}
          key="product-jsonld"
        /> */}
      </Head>
      <Box sx={{ minHeight: "100vh" }} px={{ xs: 1, md: 24 }}>
        <Header />
        {/* <Box sx={{ width: "100%", background: "#e4e4e4", height: 240, borderRadius: 4, boxSizing: "border-box" }} mb={3} p={2}>
          <Typography variant="body1">Orcaのプレミアム機能</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} md={4}>
              <Typography>AIとの会話無制限</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>単語帳保存機能や復習クイズ機能（予定）</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1">AIによる返答サンプル機能</Typography>
            </Grid>
          </Grid>
        </Box> */}
        <Stack
          direction="row"
          sx={{
            width: "100%",
            paddingLeft: 2,
            paddingRight: 2,
            overflowX: "scroll",
            boxSizing: "border-box",
            "-ms-overflow-style": "none",
            "&::-webkit-scrollbar": "none"
          }}>
          <Box mr={1}>
            <Chip
              label="最新"
            />
          </Box>
          {categoryJaOrder && categoryJaOrder.map((category) => (
            <Box mr={1}>
              <Chip
                label={`${formatCategoryJA[category]}`}
                onClick={() => router.push(`#${category}`)}
              />
            </Box>
          ))}
        </Stack>
        <Typography
          variant="h1"
          sx={{
            fontFamily: "Crimson Text",
            fontSize: "1.2rem",
            paddingX: 2,
            paddingTop: 3
          }}
        >
          最新ニュース
        </Typography>
        <Grid container py={3} p={2} spacing={{ xs: 3, sm: 2 }}>
          {latestArtciles.map((article) => {
            return (
              <Grid key={article.id} item xs={12} sm={6} md={4}>
                <Material article={article} locale={locale} />
              </Grid>
            )
          })}
        </Grid>
        {Object.keys(articlesByCategory).map((category) => (
          <SectionPastArticles articlesByCategory={articlesByCategory} category={category} locale={locale} />
        ))}
      </Box>
    </>
  )
}

function SectionPastArticles({ articlesByCategory, category, locale }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const articles = articlesByCategory[category]

  const articlesToShow = isExpanded ? articles : articles.slice(0, 6)

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  }

  return (
    <Box id={`${category}`} key={category}>
      <Box sx={{ background: "#191c29", width: "auto", display: "flex", alignItems: "center", padding: 1, borderRadius: 1 }}>
        <Typography variant="h1" sx={{ fontFamily: "Crimson Text", fontSize: "1rem", color: "#fff" }}>{formatCategoryJA[category]}</Typography>
      </Box>
      <Grid container py={2} p={2} spacing={2}>
        {articlesToShow && articlesToShow.map((article) => (
          <Grid key={article.id} item xs={12} sm={6} md={4}>
            <MaterialRow article={article} locale={locale} />
          </Grid>
        ))}
      </Grid>
      <Box
        p={2}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          boxSizing: "border-box",
        }}>
        <Button
          variant='contained'
          onClick={handleExpandClick}
          sx={{
            width: "50%",
            background: "#d6d6d6",
            '&:hover': {
              background: "#c6c6c6",
            }
          }}
        >
          {isExpanded ? "閉じる" : "もっと見る"}
        </Button>
      </Box>
    </Box>
  )
}

export async function getServerSideProps({ params }) {

  const resLocale = await client.withAllLocales.getEntries({
    content_type: "newsArticle",
    limit: 100,
  })

  const articles = resLocale.items

  if (!articles) {
    return {
      notFound: true,
    }
  }

  const filteredArticles = articles.filter((article) => article.slug !== "style-guide")

  const articlesMapped = filteredArticles.map((article) => {
    return extractArticleInfo(article)
  })

  return {
    props: {
      articles: articlesMapped,
    },
  };
}


function extractArticleInfo(data) {
  try {
    const { id } = data.sys;
    const heroImageUrl = data.fields.heroImage && data.fields.heroImage["en-US"] && data.fields.heroImage["en-US"].fields.file && data.fields.heroImage["en-US"].fields.file["en-US"] ? data.fields.heroImage["en-US"].fields.file["en-US"].url : null;
    return {
      id,
      title: data.fields.title && data.fields.title["en-US"] ? data.fields.title["en-US"] : null,
      category: data.fields.category && data.fields.category["en-US"] ? data.fields.category["en-US"] : null,
      slug: data.fields.slug && data.fields.slug["en-US"] ? data.fields.slug["en-US"] : null,
      wordCount: data.fields.wordCount && data.fields.wordCount["en-US"] ? data.fields.wordCount["en-US"] : null,
      publishedDate: data.fields.publishedDate && data.fields.publishedDate["en-US"] ? data.fields.publishedDate["en-US"] : null,
      heroImageUrl,
      localeTitle: data.fields.title,
    };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to extract article info");
  }
}


interface Article {
  id: string;
  title: string;
  category: string;
  slug: string;
  heroImage: {
    url: string;
    title: string;
    width: number;
    height: number;
  };
  locale: string;
}