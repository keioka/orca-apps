import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Grid, Stack, Button, List, ListItem } from '@mui/material'
import { Header } from '../components/Header'
import { Material } from '../components/Material'
import styled from '@emotion/styled';
import Head from 'next/head'
import Link from 'next/link';
import { client } from '../utils/apis/contentful'
import { uniq } from 'lodash';
import { MaterialRow } from '../components/MaterialRow'
import { Chip } from '../components/Chip'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import nextI18NextConfig from '@/next-i18next.config.cjs'

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

  // "eu_stock",
  // "russia_ukraine",
  "business",
  // "marketing",
  "tech",
  "science",
  // "fintech",
  "web3",
  "metaverse",
  // "sdgs",
]


const categoryEnOrder = [

  // "jp_stock",
  "world_news",
  "world_economy",
  "us_stock",

  // "eu_stock",
  // "russia_ukraine",
  "business",
  // "marketing",
  "tech",
  "science",
  // "fintech",
  "web3",
  "metaverse",
  "jp_news",
  "jp_economy",
  // "sdgs",
]

export default function ArticleIndex({ articles }) {
  const { t, i18n } = useTranslation("common");
  // Assuming locale is determined correctly elsewhere, using 'ja' as a placeholder
  const locale = i18n.language
  const router = useRouter()
  const articlesSorted = useMemo(() => articles.filter(article => article.publishedDate).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)), [articles]);

  const articlesByPublishedDate = useMemo(() => getArticlesByPublishedDate(articlesSorted), [articlesSorted]);

  const latestArticles = useMemo(() => {
    if (!articles.length === 0) {
      return []
    }
    return getArticlesArrByDate(articlesByPublishedDate)[0]
  }, [articlesByPublishedDate])

  const restArticles = useMemo(() => getArticlesArrByDate(articlesByPublishedDate).slice(1).flat(), [articlesByPublishedDate]);

  const articlesByCategory = useMemo(() => getArticlesByCategory(restArticles), [restArticles]);

  const order = useMemo(() => {
    return locale === 'ja' ? categoryJaOrder : categoryEnOrder
  }, [locale])

  return (
    <>
      <Head>
        <title>{t("articleIndex.title")}</title>
        <meta name="title" content={t("articleIndex.meta.title")} />
        <meta name="description" content={t("articleIndex.meta.description")} />
        {/* Remaining meta tags */}
      </Head>
      <Box sx={{ minHeight: "100vh" }}>
        <Box px={{ xs: 1, md: 24 }}>
          <Header />
        </Box>
        <Stack sx={{ background: "linear-gradient(135deg, #191c29, #2c3e50)", py: 2, spacing: 2 }} px={{ xs: 3, md: 26 }}>
          <Typography sx={{ color: "#fff" }}>
            {t("description.title")}
          </Typography>
          <Stack spacing={1}>
            <List sx={{ paddingLeft: 2 }}>
              <ListItem
                sx={{
                  color: "#fff",
                  listStyleType: "disc",
                  display: "list-item",
                  pl: 0
                }}
              >
                {t("description.p1")}
              </ListItem>
              <ListItem
                sx={{
                  color: "#fff",
                  listStyleType: "disc",
                  display: "list-item",
                  pl: 0
                }}
              >
                {t("description.p2")}
              </ListItem>
              <ListItem
                sx={{
                  color: "#fff",
                  listStyleType: "disc",
                  display: "list-item",
                  pl: 0
                }}
              >
                {t("description.p3")}
              </ListItem>
            </List>
          </Stack>
        </Stack>
        <Box sx={{ minHeight: "100vh" }} px={{ xs: 1, md: 24 }}>
          <Stack direction="row" sx={{ overflowX: "scroll", "&::-webkit-scrollbar": "none" }} spacing={1} p={2}>
            <Chip label={t("articleIndex.latest")} />
            {/* Assuming categoryJaOrder is defined and contains categories in the desired order */}
            {order.map((category) => (
              <Chip key={category} label={t(`categories.${category}`)} onClick={() => router.push(`#${category}`)} />
            ))}
          </Stack>
          <Typography variant="h1" sx={{ fontFamily: "Crimson Text", fontSize: "1.2rem", paddingX: 2, paddingTop: 3 }}>
            {t("articleIndex.latestNews")}
          </Typography>
          <Grid container py={3} p={2} spacing={{ xs: 3, sm: 2 }}>
            {latestArticles.map((article) => (
              <Grid key={article.id} item xs={12} sm={6} md={4}>
                <Material article={article} locale={locale} />
              </Grid>
            ))}
          </Grid >
          {
            order.map((category) => (
              <SectionPastArticles key={category} articlesByCategory={articlesByCategory} category={category} locale={locale} t={t} />
            ))
          }
        </Box>
      </Box>
    </>
  );
}

function SectionPastArticles({ articlesByCategory, category, locale }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation("common");
  const articles = articlesByCategory[category]

  if (!articles || articles.length === 0) {
    return null
  }

  const articlesToShow = isExpanded ? articles : articles.slice(0, 6)

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  }


  return (
    <Box id={`${category}`} key={category}>
      <Box sx={{ background: "#191c29", width: "auto", display: "flex", alignItems: "center", padding: 1, borderRadius: 1 }}>
        <Typography variant="h1" sx={{ fontFamily: "Crimson Text", fontSize: "1rem", color: "#fff" }}>{t(`categories.${category}`)}</Typography>
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
          {isExpanded ? t("close") : t("seeMore")}
        </Button>
      </Box>
    </Box>
  )
}

export async function getServerSideProps({ params, locale = 'en' }) {

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

  const filteredArticles = articles.filter((article) => article.fields.title != null && article.fields.slug !== "style-guide")

  const articlesMapped = filteredArticles.map((article) => {
    return extractArticleInfo(article)
  })

  const i18Props = (
    await serverSideTranslations(
      locale,
      [
        'common',
      ],
      nextI18NextConfig,
      ['en', 'ja']
    )
  )


  return {
    props: {
      articles: articlesMapped,
      ...i18Props
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