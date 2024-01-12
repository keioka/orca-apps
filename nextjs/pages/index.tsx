import { useRouter } from 'next/router';
import { Box, Typography, Grid, Stack, Button, Chip } from '@mui/material'
import { Header } from '../components/Header'
import { Material } from '../components/Material'
import styled from '@emotion/styled';
import Head from 'next/head'
import Link from 'next/link';
import { client } from '../utils/apis/contentful'

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

export default function ArticleIndex({ articles }) {
  const router = useRouter()
  const categories = articles.filter((article) => article.fields.category).map((article) => article.fields.category)
  console.log({ articles })
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
      <Box sx={{ minHeight: "100vh" }}>
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
          {categories && categories.map((category) => (
            <Box mr={1}>
              <Chip sx={{ fontFamily: "Crimson Text" }} label={`#${category}`} />
            </Box>
          ))}
        </Stack>
        <Grid container py={3} px={1} p={2} spacing={2}>
          {articles.map((article) => (
            <Grid item xs={12} sm={6} md={4}>
              <Material article={article} />
            </Grid>
          ))}
        </Grid>
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


