import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react'
import { Avatar, List, ListItem, ListItemText, Box, Typography, Grid, Stack, Tab, Breadcrumbs, ButtonGroup, Button } from '@mui/material'
import styled from '@emotion/styled';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown'
import Head from 'next/head'
import Image from 'next/image';
import { client } from '../../utils/apis/contentful'
import { Entry } from 'contentful'
import Link from 'next/link';
import { renderToStaticMarkup } from 'react-dom/server'
// import { BlogPost } from 'src/components/BlogPost'
import { CardVocab } from '../../components/CardVocab'

export const config = {
  amp: 'hybrid',
};

const Bold = ({ children }) => <Typography sx={{ fontWeight: "600", display: "inline" }}>{children}</Typography>;

const Text = ({ children }) => <Typography>{children}</Typography>;

const H1 = ({ children }) => <Typography component="h1" sx={{
  fontFamily: "Crimson Text",
  fontSize: "1.4rem",
}}>{children}</Typography>;

const H2 = ({ children }) => <Typography component="h2"
  sx={{
    fontFamily: "Crimson Text",
    fontSize: "1.3rem",
    lineHeight: "1.3",
    paddingTop: "1.2rem"
  }}
>{children}</Typography>;

const H3 = ({ children }) => <Typography component="h3" sx={{
  fontFamily: "Crimson Text",
  fontSize: "1.2rem",
  paddingTop: "0.5rem"
}}>{children}</Typography>;

const H4 = ({ children }) => <Typography component="h4"
  sx={{
    fontFamily: "Crimson Text",
    fontSize: "1.1rem",
  }}
>
  {children}
</Typography>;

const H5 = ({ children }) => <Typography
  component="h5"
  sx={{
    fontFamily: "Crimson Text",
    fontSize: "1rem",
  }}>{children}</Typography>;

const H6 = ({ children }) => <Typography component="h6" sx={{
  fontFamily: "Crimson Text",
  fontSize: "1rem",
}}>{children}</Typography>;

const P = ({ children }) => <Typography py={1} sx={{ fontSize: "0.9rem" }}>{children}</Typography>;

const TransP = ({ children }) => <Box py={1} sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", background: "#f6f6f6", padding: 3, boxSizing: "border-box", borderRadius: 1 }}>{children}</Box>;


function renderContent(content) {
  const { content: children } = content
  if (!children) {
    return null
  }

  children.forEach(item => {
    renderContent(item);
  });
}

function renderMedia(file) {
  const mimeType = file.contentType
  const mimeGroup = mimeType.split('/')[0]
  switch (mimeGroup) {
    case 'image':
      return <img
        key={file.alt}
        width="100%"
        alt={file.alt}
        src={file.url}
      />

    default:
      return <span style={{ backgroundColor: 'red', color: 'white' }}> {mimeType} embedded asset </span>
  }
}

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <Bold>{text}</Bold>,
    [MARKS.ITALIC]: (text) => <Typography variant="body2" sx={{ fontStyle: "italic" }}>{text}</Typography>,
    [MARKS.UNDERLINE]: (text) => <Typography variant="body2" sx={{ textDecoration: "underline" }}>{text}</Typography>,
  },
  renderNode: {
    [INLINES.HYPERLINK]: (node, children) => {
      return <a href={node.data.uri} style={{ color: "#007988" }}>{children}</a>
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
      const file = node.data.target.fields.file
      const jsx = renderMedia(file)
      return jsx
    },
    [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
      const file = node.data.target.fields.file
      const jsx = renderMedia(file)
      return jsx
    },
    [BLOCKS.PARAGRAPH]: (node, children) => <P>{children}</P>,
    [BLOCKS.QUOTE]: (node, children) => <Typography sx={{ fontStyle: "italic" }}>{children}</Typography>,
    // [BLOCKS.EMBEDDED_ASSET]: (node, children) => <Text>{children}</Text>,
    [BLOCKS.HEADING_1]: (node, children) => {
      return <H1>{children}</H1>
    },
    [BLOCKS.HEADING_2]: (node, children) => {
      return <H2>{children}</H2>
    },
    [BLOCKS.HEADING_3]: (node, children) => {
      return <H3>{children}</H3>
    },
    [BLOCKS.HEADING_4]: (node, children) => {
      return <H4>{children}</H4>
    },
    [BLOCKS.HEADING_5]: (node, children) => {
      return <H5>{children}</H5>
    },
    [BLOCKS.HEADING_6]: (node, children) => {
      return <H6>{children}</H6>
    },
    [BLOCKS.UL_LIST]: (node, children) => {
      return (
        <ul
          style={{
            listStyle: "disc",
            paddingLeft: "1.7rem",
          }}
        >
          {children}
        </ul>
      )
    },
    [BLOCKS.OL_LIST]: (node, children) => {
      return <ul
        style={{
          listStyle: "intial",
          paddingLeft: "2rem",
        }}
      >
        {children}
      </ul>
    }
  },
};

const BlogLayout = styled(Box)`
  overflow: auto;
`
const BlogHeader = styled(Box)`
  margin-bottom: 1.5rem;
`

function addArticleJsonLd({
  title,
  proofreader,
  author,
  article,
}: {
  title: string,
  proofreader?: Entry,
  author: Entry,
  article: Entry,
}) {

  const hasProofreader = proofreader && proofreader.fields

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://oudweb.com"
    },
    headline: title,
    image: [
      article.fields.heroImage.fields.file.url
    ],
    description: article.fields.metaDescription,
    articleBody: article.fields.content,
    datePublished: article.fields.publishDate,
    dateModified: article.fields.publishDate,
    author: author ? [{
      "@type": "Person",
      name: author.fields.name,
      url: `https://oudweb.com/profile/${author.fields.name}`,
      jobTitle: author.fields.title,
    }] : null,
    publisher: {
      name: "Oud",
      url: "https://oudweb.com",
    }
  }

  if (hasProofreader) {
    data["author"].push({
      "@type": "Person",
      name: proofreader.fields.name,
      url: `https://oudweb.com/profile/${proofreader.fields.name}`,
      jobTitle: author.fields.title,
      knowsAbout: "Dermatology",
      hasCredential: "Dermatologist",
      honorificPrefix: "Dr",
    })
  }

  return {
    __html: JSON.stringify(data),
  };
}

export default function Article({ article, relatedArticles, body, notFound, slug }: { article: Entry, relatedArticles: Entry[], body: any, notFound: boolean }) {

  if (notFound) {
    return <div>ho</div>
  }

  if (!article) {
    return null
  }

  const title = article.fields.title
  const heroImageInfo = article.fields.heroImage.fields

  const imageUrl = `https:${heroImageInfo.file.url}`
  const { width, height } = heroImageInfo.file.details.image
  const imageAlt = heroImageInfo.description
  const {
    description,
    metaKeywords,
    metaDescription,
    author,
    proofreader,
    p1,
    p2,
    p3,
    p4,
    p5
  } = article.fields
  const contentType = heroImageInfo.file.contentType
  const hasProofreader = proofreader && proofreader.fields

  console.log({ body })
  // renderContent(body)
  console.log(article?.fields)
  return (
    <>
      <Head>
        <title>{title} | Orca</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${metaKeywords}, mens skincare, haircare`} />
        {author && author.fields && <meta name="author" content={author.fields.name} />}
        <meta property="og:title" content={title} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content={width} />
        <meta property="og:image:height" content={height} />
        <meta property="og:image:alt" content={imageAlt} />
        <meta property="og:image:type" content={contentType} />
        <meta property="og:url" content={`https://www.oudweb.com/articles/${slug}`} />
        <meta property="og:site_name" content="oud" />
        <meta name="twitter:card" content={imageUrl} />
        <meta name="twitter:site" content={`https://www.oudweb.com/articles/${slug}`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:creator" content="oudweb.com" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`https://www.oudweb.com/articles/${slug}`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={
            addArticleJsonLd({
              title,
              proofreader,
              author,
              article,
            })}
          key="product-jsonld"
        />
      </Head>
      <BlogLayout
        component="article"
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BlogHeader component="header" sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img
            alt={String(title)}
            src={imageUrl}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "320px",
              maxWidth: "840px",
              objectFit: "cover",
            }}
          />
          <Box sx={{ width: "100%", display: "flex", maxWidth: "840px", justifyContent: "center" }} component="section" itemProp="articleBody">
            <Box sx={{ background: "#00100B", color: "#fff", maxWidth: "840px", width: "100%" }} p={2} mt={-0.5}>
              <H1>{title}</H1>
              <H1>月曜の取引開始早々、株価は下げに転じたが、その後は方向感に欠ける展開となっている。</H1>
              {/* <Typography variant="h6">{article?.fields.content}</Typography> */}
              {/* <Box display="flex" flexDirection="row" alignItems="center" gap={1} mt={1} mb={2}>
                <Avatar alt={""} src={""} />
                <Stack>
                  <Typography sx={{ fontSize: 14 }}>{"Sample Johnson"}</Typography>
                  <Typography sx={{ fontSize: 12 }}>{"Freelance web writer"}</Typography>
                </Stack>
              </Box> */}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
            <Box sx={{ flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center", paddingX: 2, paddingY: 2 }}>
              <Typography sx={{ fontSize: 14 }}>
                Word Count
              </Typography>
              <Typography sx={{ fontSize: 19 }}>
                250
              </Typography>
            </Box>
            <Box sx={{ flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center", paddingX: 2 }}>
              <Typography sx={{ fontSize: 14 }}>
                Level
              </Typography>
              <Box py={0.1} px={1} sx={{ background: "#fac6c6", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 19 }}>
                  Advanced
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center", paddingX: 2 }}>
              <Typography sx={{ fontSize: 14 }}>
                Word Count
              </Typography>
              <Typography sx={{ fontSize: 19 }}>
                1000
              </Typography>
            </Box>
          </Box>
        </BlogHeader>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Box p={3} sx={{ width: "100%", maxWidth: "840px", position: "relative" }}>
            {body && documentToReactComponents(body, options)}
            <Box pb={3} sx={{ borderBottom: "1px solid #f2f2f2" }}>
              <Typography sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", padding: 3 }}>
                {p1}
              </Typography>
              <TransP>
                <Typography>
                  米国株と労働統計： 火曜日の米国株は午後の取引で下落した。この変化は、米労働統計局による新規雇用統計の発表後に起こった。ハイテク株は当初上昇したものの、最終的には横ばいとなった。ナスダックは特にその影響を受けた。
                </Typography>
              </TransP>
            </Box>
            <Box pb={3} sx={{ borderBottom: "1px solid #f2f2f2" }}>
              <Typography sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", padding: 3 }}>
                {p2}
              </Typography>
              <TransP>
                <Typography>
                  ダウ・ジョーンズとアップルの評価： 株式市場の上昇は複雑なシナリオを提示した。主要株価指数はメガキャップの上昇に支えられたが、小型株は後退した。ダウ平均は火曜日の取引で0.2％下落した。大きなハイライトは、アップルが3兆ドルの評価額を突破したことだ。
                </Typography>
              </TransP>
            </Box>
            <Box pb={3} sx={{ borderBottom: "1px solid #f2f2f2" }}>
              <Typography sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", padding: 3 }}>
                {p3}
              </Typography>
              <TransP>
                <Typography>
                  ナスダックとハイテク株: アップルの時価総額が再び3兆ドルを突破。さらに、国債の上昇も再開し、10年債利回りはデータが最後に入手可能になって以来の最低水準まで低下した。
                </Typography>
              </TransP>
            </Box>
            <Box pb={3} sx={{ borderBottom: "1px solid #f2f2f2" }}>
              <Typography sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", padding: 3 }}>
                {p4}
              </Typography>
              <TransP>
                <Typography>
                  米国株式先物と金利: 火曜日の米国株式先物は下落し、2日連続の赤字となった。この動きは、投資家が新たな雇用統計を待ち、金利の行方を思案しているためだ。こうした動きを主導したのはハイテク株だった。
                </Typography>
              </TransP>
            </Box>
            <Box my={3}>
              <Typography sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", padding: 3 }}>
                {p5}
              </Typography>
              <TransP>
                <Typography>
                  世界株式とムーディーズの格下げ：ムーディーズによる中国の格付け引き下げを受けて、世界的に株式市場はまちまちの結果となった。この格下げは2017年以来初めてで、中国の地方・地域政府と国有企業の資金調達トラブルに対する懸念を反映している。
                </Typography>
              </TransP>
            </Box>

            {/* <Box sx={{ background: "#f4f4f4", borderRadius: 2 }} p={4} mt={8}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={12}>
                  {author &&
                    <Link href={`/profile/${author.fields.id}`}>
                      <a style={{ textDecoration: "none", color: "inherit" }}>
                        <Stack>
                          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <Avatar alt={author.fields.name} src={author.fields.image.fields.file.url} sx={{ width: 48, height: 48 }} />
                            <Stack spacing={-0.5}>
                              <Text variant="h6">{author.fields.name}</Text>
                              <Typography variant="caption">{author.fields.title}</Typography>
                            </Stack>
                          </Stack>

                          <Typography variant="body2">{author.fields.shortBio}</Typography>
                        </Stack>
                      </a>
                    </Link>
                  }
                </Grid>
                <Grid item xs={12} md={12}>
                  {
                    hasProofreader &&
                    <Link href={`/profile/${proofreader.fields.id}`}>
                      <a style={{ textDecoration: "none", color: "inherit" }}>
                        <Stack>
                          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <Avatar alt={proofreader.fields.name} src={proofreader.fields.image.fields.file.url} sx={{ width: 48, height: 48 }} />
                            <Stack spacing={-0.5}>
                              <Text variant="h6">{proofreader.fields.name}</Text>
                              <Typography variant="caption">{proofreader.fields.title}</Typography>
                            </Stack>
                          </Stack>

                          <Typography variant="body2">{proofreader.fields.shortBio}</Typography>
                        </Stack>
                      </a>
                    </Link>
                  }
                </Grid>
              </Grid>
            </Box> */}
            {/* {relatedArticles && relatedArticles.length > 0 &&
              <Box mt={16}>
                <Typography variant="h6">Related articles</Typography>
                <Grid container spacing={1} mt={2}>
                  {relatedArticles && relatedArticles.map((article) => (
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ width: "100%" }}>
                        <BlogPost
                          article={article}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            } */}
            <Box sx={{ marginBottom: 1 }}>
              <CardVocab
                vocab={{
                  word: "state-owned enterprises",
                  meaning: "国有企業",
                  sentence: "This downgrade, the first since 2017, reflects concerns over financing troubles in local and regional governments and state-owned enterprises in China​​.",
                  example: "state-owned enterprises in China are facing financing troubles",
                }}
              />
            </Box>
            <Box sx={{ marginBottom: 1 }}>
              <CardVocab
                vocab={{
                  word: "US Stock Futures",
                  meaning: "米国株式先物",
                  sentence: "US Stock Futures and Interest Rates",
                  example: "US Stock Futures are down",
                }}
              />
            </Box>

          </Box>
        </Box>
      </BlogLayout>
    </>

  )
}

// export async function getStaticPaths() {
//   const res = await client.getEntries()
//   const { items: blogPosts } = res

//   const paths = blogPosts.filter((blog) => blog.fields && blog.fields.slug).map((blog) => {
//     return { params: { slug: blog.fields.slug } };
//   });

//   // Using fallback: "blocking" here enables preview mode for unpublished blog slugs
//   // on production
//   return {
//     paths,
//     fallback: "blocking",
//   };
// }


// export async function getStaticProps({ params }) {
//   const { slug } = params;
//   const res = await client.getEntries({
//     content_type: "blogPost",
//     limit: 1,
//     'fields.slug': slug,
//   })

//   const article = res.items[0]

//   if (!article) {
//     return {
//       notFound: true,
//     }
//   }

//   const body = await richTextFromMarkdown(article.fields.body)
//   return {
//     props: {
//       slug,
//       article,
//       body,
//     },
//   };
// }


export async function getServerSideProps({ params }) {
  const { slug } = params;
  const res = await client.getEntries({
    content_type: "newsArticle",
    limit: 1,
    'fields.slug': slug,
  })

  const article = res.items[0]

  if (!article) {
    return {
      notFound: true,
    }
  }

  const body = await richTextFromMarkdown(article.fields.body, (node) => {
    if (node.type === "image") {
      return {
        nodeType: "embedded-asset-block",
        content: [],
        data: {
          target: {
            fields: {
              file: {
                contentType: node.type,
                alt: node.alt,
                url: node.url,
              }
            }
          }
        }
      }
    }
  })

  const subcategories = article.fields.subcategory
  let relatedArticles = []

  const id = article.sys.id

  if (subcategories && subcategories.length > 0) {
    const relatedArticlesRes = await Promise.all(subcategories.map((subcategory) => client.getEntries({
      content_type: "blogPost",
      limit: 3,
      'fields.subcategory': subcategory,
      'sys.id[ne]': id,
    })))

    relatedArticles = relatedArticlesRes.map((res) => res.items).flat().filter((item) => item.sys.id !== id)
  }

  return {
    props: {
      slug,
      article,
      relatedArticles,
      body,
    },
  };
}

