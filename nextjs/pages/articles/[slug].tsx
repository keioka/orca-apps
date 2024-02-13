import { useRouter } from 'next/router';
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Avatar, List, ListItem, ListItemText, Box, Typography, Grid, Stack, Pagination, TextField, Button } from '@mui/material'
import styled from '@emotion/styled';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown'
import Head from 'next/head'
import { client } from '../../utils/apis/contentful'
import { Entry } from 'contentful'
import { CardVocabSM } from '../../components/CardVocabSM'
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { MdOutlineGTranslate } from "react-icons/md";
import { TbVocabulary } from "react-icons/tb";
import { useSearchParams } from 'next/navigation'
import { Header } from '../../components/Header'
import { AudioPlayer } from '../../components/AudioPlayer'
import { fetchVocabs, fetchOriginalMaterial, fetchQuestions, createRating } from "@/redux/features/materials";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { ModalAuth } from '@/components/ModalAuth';
import { StudyPanel } from '@/components/StudyPanel';
import { saveVocab, fetchSavedVocab, fetchSavedParaphrases } from '@/redux/features/note';
import Markdown from 'react-markdown'
import { setPaymentRequiredAlert } from '@/redux/features/payment';
import mixpanel from 'mixpanel-browser';
import { addUserMessage } from "@/redux/features/messages";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '@/next-i18next.config.cjs'
import { useTranslation } from 'next-i18next'
import { useTour } from '@reactour/tour'
import { RatingSentiment } from '@/components/Rating'

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

const Bold = ({ children }) => <Typography sx={{ fontWeight: "600", display: "inline" }}>{children}</Typography>;

const Text = ({ children, ...props }) => <Typography {...props}>{children}</Typography>;

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

const TransP = ({ children }) => <Box py={1} sx={{ py: 1, fontFamily: "Crimson Text", fontSize: 18, color: "#242424", background: "#f6f6f6", padding: 2, boxSizing: "border-box", borderRadius: 1 }}>{children}</Box>;


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
      "@id": "https://orcatalk.news"
    },
    headline: title,
    image: [
      article.fields.heroImage[localeKeys.en].fields.file.url
    ],
    description: article.fields.metaDescription,
    articleBody: article.fields.content,
    datePublished: article.fields.publishDate,
    dateModified: article.fields.publishDate,
    author: author ? [{
      "@type": "Person",
      name: author.fields.name,
      url: `https://orcatalk.news/profile/${author.fields.name}`,
      jobTitle: author.fields.title,
    }] : null,
    publisher: {
      name: "Orca News",
      url: "https://orcatalk.news",
    }
  }

  if (hasProofreader) {
    data["author"].push({
      "@type": "Person",
      name: proofreader.fields.name,
      url: `https://orcatalk.news/profile/${proofreader.fields.name}`,
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


const localeKeys = {
  en: 'en-US',
  ja: 'ja-JP',
}

function getEnUS(obj) {
  if (Array.isArray(obj)) {
    return obj.map(getEnUS);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj['en-US']) {
      return obj['en-US'];
    }
    const newObj = {};
    for (const key in obj) {
      newObj[key] = getEnUS(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function getJaJp(obj) {
  if (Array.isArray(obj)) {
    return obj.map(getJaJp);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj['ja']) {
      return obj['ja'];
    }
    const newObj = {};
    for (const key in obj) {
      if (key === 'en-US') {
        return ""
      }
      newObj[key] = getJaJp(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function mapVocab(vocabsFromDB, vocab, paragraphNumber) {
  let vocabDB
  if (vocab.id) {
    vocabDB = vocabsFromDB.find((v) => v.externalId === vocab.id)
  } else {
    vocabDB = vocabsFromDB.find((v) => v.word === vocab.word && v.paragraphNumber === paragraphNumber)
  }

  if (vocabDB) {
    return {
      ...vocab,
      dbId: vocabDB.id,
    }
  }

  return vocab
}

export default function Article({ article, relatedArticles, body, notFound, slug }: { article: Entry, relatedArticles: Entry[], body: any, notFound: boolean }) {
  const [shouldOpenModalAuth, setShouldOpenModalAuth] = useState(false)
  const [alert, setAlert] = useState("")
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const currentUser = useAppSelector((state) => state.auth.currentUser)
  const currentOpenedOriginalMaterial = useAppSelector((state) => state.material.currentOpenedOriginalMaterial)
  const vocabsFromDB = useAppSelector((state) => currentOpenedOriginalMaterial ? state.material.vocabs[currentOpenedOriginalMaterial.id] || [] : [])
  const questions = useAppSelector((state) => currentOpenedOriginalMaterial ? state.material.questions[currentOpenedOriginalMaterial.id] || [] : [])
  // TODO: Need to refactor this for performance
  const savedVocabs = useAppSelector((state) => state.note.vocabularies)
  const isValidSubscription = useAppSelector((state) => state.payment.isValidSubscription)
  const isFetchingMaterials = useAppSelector((state) => state.material.isFetchingMaterials)
  const isFailedToFetchOriginalMaterialsByExternalId = useAppSelector((state) => state.material.isFailedToFetchOriginalMaterialsByExternalId[article.sys.id])
  const currentLesson = useAppSelector((state) => state.lesson.lessons.find((lesson) => lesson.materialId === currentOpenedOriginalMaterial?.id))
  const isRatingSent = useAppSelector((state) => currentOpenedOriginalMaterial ? state.material.ratingSent[currentOpenedOriginalMaterial?.id] : false)

  const { t, i18n } = useTranslation();
  const { setIsOpen } = useTour()

  const mode = searchParams.get('mode')

  useEffect(() => {
    if (currentUser) {
      if (shouldOpenModalAuth) {
        setShouldOpenModalAuth(false)
      }
      if (savedVocabs.length === 0) {
        dispatch(fetchSavedVocab())
      }
    }
  }, [currentUser])

  useEffect(() => {
    setIsOpen(true)
  }, [])

  useEffect(() => {
    if (article && !isFetchingMaterials && !currentOpenedOriginalMaterial && !isFailedToFetchOriginalMaterialsByExternalId) {
      dispatch(fetchOriginalMaterial({ externalId: article.sys.id }))
    }
  }, [article, isFetchingMaterials, currentOpenedOriginalMaterial])

  useEffect(() => {
    if (currentOpenedOriginalMaterial && vocabsFromDB.length === 0) {
      dispatch(fetchVocabs({ materialId: currentOpenedOriginalMaterial?.id }))
    }
    if (currentOpenedOriginalMaterial && currentOpenedOriginalMaterial?.id) {
      dispatch(fetchQuestions({ materialId: currentOpenedOriginalMaterial?.id }))
    }
  }, [currentOpenedOriginalMaterial])

  useEffect(() => {
    mixpanel.track("Article Viewed", {})
  }, [])

  const questionsByParagraphNumber = useMemo(() => {
    if (!questions) {
      return {}
    }

    if (questions.length === 0) {
      return {}
    }

    const questionsByParagraphNumber = questions.reduce((acc, question) => {
      const { paragraphNumber } = question
      if (!acc[paragraphNumber]) {
        acc[paragraphNumber] = []
      }
      acc[paragraphNumber].push(question)
      return acc
    }, {})
    return questionsByParagraphNumber

  }, [questions])

  if (notFound) {
    return <div>not found</div>
  }

  if (!article) {
    return null
  }

  const handleSelectQuestion = (question: string) => {
    if (!currentUser || !currentLesson) {
      console.error("no user or lesson")
      return
    }
    dispatch(addUserMessage({ message: question, lessonId: currentLesson.id, type: "ai" }))
    if (window && window.scroll) {
      window.scroll({
        // scroll to very bottom
        top: document.body.scrollHeight + 1000,
        behavior: "smooth"
      })
    }
  }

  const handleCloseModalAuth = () => {
    setShouldOpenModalAuth(false)
    setAlert("")
  }

  const handleSaveVocab = (vocab) => {
    mixpanel.track("Save Vocab Start");
    if (currentUser) {
      if (isValidSubscription) {
        mixpanel.track("Save Vocab Success");
        dispatch(saveVocab({ vocabId: vocab.dbId }))
      } else {
        mixpanel.track("Save Vocab Paywall");
        dispatch(setPaymentRequiredAlert("単語を保存するにはプレミアム会員になる必要があります"))
      }
    } else {
      mixpanel.track("Save Vocab AuthWall");
      setShouldOpenModalAuth(true)
      setAlert("単語を保存するにはログインしてください")
    }
  }

  const handleSubmitRatingForm = useCallback((values: { interesting: number, difficulty: number }) => {
    if (currentOpenedOriginalMaterial) {
      dispatch(createRating({ type: "interesting", rating: values.interesting, materialId: currentOpenedOriginalMaterial.id }))
      dispatch(createRating({ type: "difficulty", rating: values.difficulty, materialId: currentOpenedOriginalMaterial.id }))
    }
  }, [currentOpenedOriginalMaterial])

  const isEmbedMode = mode === 'embed'

  const cleanedArticle = getEnUS(article)
  const jaArticle = getJaJp(article)

  const heroImageInfo = cleanedArticle.fields.heroImage.fields

  const imageUrl = `https:${heroImageInfo.file[localeKeys.en].url}`
  const { width, height } = heroImageInfo.file[localeKeys.en].details.image
  const imageAlt = heroImageInfo.description[localeKeys.en]

  const {
    title,
    category,
    description,
    wordCount,
    metaKeywords,
    metaDescription,
    author,
    proofreader,
    p1,
    p1AudioLink,
    p1Vocab,
    p2,
    p2AudioLink,
    p2Vocab,
    p3,
    p3AudioLink,
    p3Vocab,
    p4,
    p4AudioLink,
    p4Vocab,
    p5,
    p5AudioLink,
    p5Vocab,
    publishedDate,
    reference
  } = cleanedArticle.fields
  const { sys: { createdAt, id } } = cleanedArticle

  const {
    title: jaTitle,
    p1: jaP1,
    p2: jaP2,
    p3: jaP3,
    p4: jaP4,
    p5: jaP5,
    p6: jaP6,
  } = jaArticle.fields

  const hasProofreader = proofreader && proofreader.fields
  const publishedAt = publishedDate ? new Date(publishedDate).toLocaleDateString() : new Date(createdAt).toLocaleDateString()

  const p1VocabWithDB = useMemo(() => p1Vocab.map((vocab) => mapVocab(vocabsFromDB, vocab, 1)), [p1Vocab, vocabsFromDB])
  const p2VocabWithDB = useMemo(() => p2Vocab.map((vocab) => mapVocab(vocabsFromDB, vocab, 2)), [p2Vocab, vocabsFromDB])
  const p3VocabWithDB = useMemo(() => p3Vocab.map((vocab) => mapVocab(vocabsFromDB, vocab, 3)), [p3Vocab, vocabsFromDB])
  const p4VocabWithDB = useMemo(() => p4Vocab.map((vocab) => mapVocab(vocabsFromDB, vocab, 4)), [p4Vocab, vocabsFromDB])
  const p5VocabWithDB = useMemo(() => p5Vocab.map((vocab) => mapVocab(vocabsFromDB, vocab, 5)), [p5Vocab, vocabsFromDB])

  const paragraphs = [
    {
      en: p1,
      ja: jaP1,
      audioFileLink: p1AudioLink,
      vocab: p1VocabWithDB
    }, {
      en: p2,
      ja: jaP2,
      audioFileLink: p2AudioLink,
      vocab: p2VocabWithDB
    }, {
      en: p3,
      ja: jaP3,
      audioFileLink: p3AudioLink,
      vocab: p3VocabWithDB
    }, {
      en: p4,
      ja: jaP4,
      audioFileLink: p4AudioLink,
      vocab: p4VocabWithDB
    }, {
      en: p5,
      ja: jaP5,
      audioFileLink: p5AudioLink,
      vocab: p5VocabWithDB
    }
  ]

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
        {/* <meta property="og:image:type" content={contentType} /> */}
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
            })
          }
          key="product-jsonld"
        />
      </Head>
      <Header />
      <ModalAuth isOpen={shouldOpenModalAuth} onClose={handleCloseModalAuth} alert={alert} />
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
            <Box sx={{ background: "#191c29", color: "#fff", maxWidth: "840px", width: "100%" }} p={2} mt={-0.5}>
              <H1>{title}</H1>
              {i18n.language === 'ja' && <H1>{jaTitle}</H1>}
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
              <Typography sx={{ fontSize: 14, textAlign: "center" }}>
                Published Date
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
                {publishedAt}
              </Typography>
            </Box>
            <Box sx={{ flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center", paddingX: 2, paddingY: 2 }}>
              <Typography sx={{ fontSize: 14, textAlign: "center" }}>
                Word Count
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
                {wordCount}
              </Typography>
            </Box>
            {/* <Box sx={{ flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center", paddingX: 2 }}>
              <Typography sx={{ fontSize: 14 }}>
                Level
              </Typography>
              <Box py={0.1} px={1} sx={{ background: "#fac6c6", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
                  Advanced
                </Typography>
              </Box>
            </Box> */}
            <Box sx={{ flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center", paddingX: 2, paddingY: 2 }}>
              <Typography sx={{ fontSize: 14, textAlign: "center" }}>
                Category
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
                {formatCategory[category] || "General"}
              </Typography>
            </Box>
          </Box>

        </BlogHeader>
        {/* <Box my={3}>
          <AudioPlayer />
        </Box> */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: "840px", position: "relative" }}>
            {body && documentToReactComponents(body, options)}
            {paragraphs.map((paragraph, index) => {
              return (
                <Paragraph
                  key={"paragraph_" + index}
                  index={index}
                  content={paragraph}
                  totalLength={paragraphs.length}
                  onSaveVocab={handleSaveVocab}
                  savedVocabs={savedVocabs}
                  questions={questionsByParagraphNumber[index + 1]}
                  currentUser={currentUser}
                  setShouldOpenModalAuth={setShouldOpenModalAuth}
                  setAlertModalAuth={setAlert}
                  handleSelectQuestion={handleSelectQuestion}
                  locale={i18n.language}
                />
              )
            })}
            <Box
              px={4}
              sx={{
                "& > ol > li": {
                  listStyle: "decimal",
                  marginBottom: 3,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "#696969"
                }
              }}>
              <Markdown>
                {reference}
              </Markdown>
            </Box>
            {currentOpenedOriginalMaterial &&
              <Box mb={8} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box sx={{ width: "90%" }}>
                  <RatingForm onSubmit={handleSubmitRatingForm} isRatingSent={isRatingSent} />
                </Box>
              </Box>
            }
            <StudyPanel
              article={article}
              currentUser={currentUser}
              setShouldOpenModalAuth={setShouldOpenModalAuth}
              setAlertModalAuth={setAlert}
            />
          </Box>
        </Box>
      </BlogLayout>
    </>
  )
}


function RatingForm({ onSubmit, isRatingSent }) {

  const { t, i18n } = useTranslation("common");

  const ratingInteresting = {
    1: t("notInteresting"),
    2: t("aLittleInteresting"),
    3: t("interesting"),
    4: t("veryInteresting"),
    5: t("extremelyInteresting")
  }

  const ratingDifficulties = {
    1: t("extremelyDifficult"),
    2: t("veryDifficult"),
    3: t("difficult"),
    4: t("aLittleDifficult"),
    5: t("notDifficult")
  }

  const [valueInteresting, setValueInteresting] = useState(null)
  const [valueDifficulties, setValueDifficulties] = useState(null)

  const handleChangeInteresting = (event) => {
    setValueInteresting(event.target.value);
  }

  const handleChangeDifficulties = (event) => {
    setValueDifficulties(event.target.value);
  }

  const handleSubmit = () => {
    onSubmit({ interesting: valueInteresting, difficulty: valueDifficulties })
  }

  return (
    <Box sx={{ border: "1px solid #d4d4d4", padding: 2, borderRadius: 4 }}>
      <Typography sx={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
        {t("rateThisArticle")}
      </Typography>
      {isRatingSent &&
        <Typography sx={{ fontSize: 14, textAlign: "center" }}>
          Thank you for your feedback!
        </Typography>
      }

      {!isRatingSent &&
        <>
          <Stack direction="row" spacing={2} sx={{ marginTop: 2, width: "100%", boxSizing: "border-box", justifyContent: "center", alignItems: "center" }}>
            <Typography sx={{ fontSize: 14, textAlign: "center" }}>
              {t("wasThisInteresting")}
            </Typography>
            <RatingSentiment value={valueInteresting} labels={ratingInteresting} onChange={handleChangeInteresting} />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ marginTop: 2, width: "100%", boxSizing: "border-box", justifyContent: "center", alignItems: "center" }}>
            <Typography sx={{ fontSize: 14, textAlign: "center" }}>
              {t("wasThisDifficult")}
            </Typography>
            <RatingSentiment value={valueDifficulties} labels={ratingDifficulties} onChange={handleChangeDifficulties} />
          </Stack>
          <Button
            variant="outlined"
            sx={{ width: "100%", marginTop: 2, padding: 1, fontSize: 14, fontWeight: "bold" }}
            onClick={handleSubmit}
            disabled={isRatingSent}
          >
            {t("submit")}
          </Button>
        </>
      }
    </Box>
  )
}

function Paragraph({
  content,
  isEmbedMode,
  index,
  totalLength,
  onSaveVocab,
  savedVocabs,
  questions,
  currentUser,
  setShouldOpenModalAuth,
  setAlertModalAuth,
  handleSelectQuestion,
  locale,
}: {
  paragraph: any,
  isEmbedMode: boolean,
  index: number,
  totalLength: number,
  setShouldOpenModalAuth: (boolean) => void,
}) {
  const [shouldShowVocab, setShouldShowVocab] = useState(false)
  const [shouldShowTrans, setShouldShowTrans] = useState(false)
  const [shouldShowPlaySound, setShouldShowPlaySound] = useState(false)
  const [vocabPageIndex, setVocabPageIndex] = useState(0)
  const { t, i18n } = useTranslation("common");

  const vocabs = useMemo(() => content.vocab.sort((a, b) => {
    if (a.word < b.word) {
      return -1
    }
    if (a.word > b.word) {
      return 1
    }
    return 0
  }), [content.vocab])

  const validVocab = useMemo(() => vocabs.filter((vocab) => vocab.dbId), [vocabs])

  const itemsPerPage = 5
  const vocabsOnPage = validVocab.slice(vocabPageIndex * itemsPerPage, (vocabPageIndex + 1) * itemsPerPage)
  const totalPages = Math.ceil(validVocab.length / itemsPerPage)

  const handleChange = (_, page) => {
    setVocabPageIndex(page - 1)
  }

  const handleOnClickAnswer = (question: string) => {
    if (!currentUser) {
      setShouldOpenModalAuth(true)
      setAlertModalAuth("AIと会話練習するにはログインしてください")
    } else {
      handleSelectQuestion(question)
    }
  }

  return (
    <Box pb={8}>
      <Stack direction="row" sx={{ alignItems: "center" }} justifyContent="space-between">
        <Box style={{ backgroundColor: "#f2f3f4", padding: 8, borderTopRightRadius: 8, justifyContent: "center", alignItems: "center", width: 64, marginRight: 18 }}>
          <Typography sx={{ fontSize: 16, textAlign: "center", fontWeight: "bold", color: "#242424" }}>{index + 1} / {totalLength}</Typography>
          <Typography sx={{ fontSize: 12, textAlign: "center", color: "#242424" }}>Paragraph</Typography>
        </Box>
        <Stack direction="row">
          <Stack
            sx={{
              alignItems: "center",
              marginRight: 2,
              cursor: "pointer",
            }}
            onClick={() => { setShouldShowPlaySound(!shouldShowPlaySound) }}
            data-tour="step1"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: shouldShowPlaySound ? "#FFD744" : "#f2f3f4",
                width: 36,
                height: 36,
                borderRadius: "50%",
              }}
            >
              <HiOutlineSpeakerWave size={18} color={shouldShowPlaySound ? "#fff" : "#242424"} />
            </Box>
            <Text sx={{ fontSize: 12, marginTop: 0.5 }}>{t("paragraph.pronunciation")}</Text>
          </Stack>
          {i18n.language !== 'en' && <Stack
            sx={{
              alignItems: "center",
              marginRight: 2,
              cursor: "pointer",
            }}
            onClick={() => { setShouldShowTrans(!shouldShowTrans) }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: shouldShowTrans ? "#FFD744" : "#f2f3f4",
                width: 36,
                height: 36,
                borderRadius: "50%",
              }}
            >
              <MdOutlineGTranslate size={18} color={shouldShowTrans ? "#fff" : "#242424"} />
            </Box>
            <Text sx={{ fontSize: 12, marginTop: 0.5 }}>{t("paragraph.translation")}</Text>
          </Stack>}
          <Stack
            sx={{
              alignItems: "center",
              marginRight: 2,
              cursor: "pointer",
            }}
            onClick={() => { setShouldShowVocab(!shouldShowVocab) }}
            data-tour="step2"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: shouldShowVocab ? "#FFD744" : "#f2f3f4",
                width: 36,
                height: 36,
                borderRadius: "50%",
              }}
            >
              <TbVocabulary size={18} color={shouldShowVocab ? "#fff" : "#242424"} />
            </Box>
            <Text sx={{ fontSize: 12, marginTop: 0.5 }}>{t("paragraph.vocabList")}</Text>
          </Stack>
        </Stack>
      </Stack>
      {shouldShowPlaySound && <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          paddingX: 2,
          paddingY: 2,
          boxSizing: "border-box",
          // marginRight: 2,
          // cursor: "pointer",
        }}
      >
        {/* <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "#cbcbcb",
                width: 36,
                height: 36,
                borderRadius: "50%",
              }}
              onClick={() => { content.audioFileLink && new Audio(content.audioFileLink as string).play() }}
            >
              <HiOutlineSpeakerWave size={18} color="#fff" />
            </Box> */}
        <AudioPlayer file={content.audioFileLink} autoPlay />
        {/* <Text sx={{ fontSize: 12, marginTop: 0.5 }}>発音</Text> */}
      </Stack>}
      {!isEmbedMode && shouldShowVocab && vocabsOnPage &&
        <Box mt={1} p={1}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
            <Pagination count={totalPages} onChange={handleChange} />
          </Box>
          {vocabsOnPage.map((vocab) => {
            const isSaved = savedVocabs && savedVocabs.find((v) => v.vocabularyId === vocab.dbId)
            return (
              <Box key={`${vocab.word}_${vocab.id}`} sx={{ marginBottom: 1 }}>
                <CardVocabSM
                  vocab={vocab}
                  onSaveVocab={() => onSaveVocab(vocab)}
                  isSaved={isSaved}
                />
              </Box>
            )
          })}
        </Box>
      }

      <Typography sx={{ fontFamily: "Crimson Text", fontSize: 18, color: "#242424", padding: 2 }}>
        {content.en}
      </Typography>
      {shouldShowTrans &&
        <TransP>
          <Typography>
            {content.ja}
          </Typography>
        </TransP>
      }
      {questions && questions.length > 0 &&
        <Box sx={{ background: "#fff", padding: 2 }}>
          <Stack spacing={1} sx={{ background: "#f4f4f4", borderRadius: 8, paddingY: 3, paddingX: 1, overflow: "hidden" }}>
            <Typography sx={{ fontSize: 14, color: "#242424", paddingX: 2 }}>
              {t("paragraph.questions")}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ overflowX: "scroll", width: "100%", paddingX: 2 }}>
              {questions.map((question) => {
                return (
                  <Box sx={{ width: "100%", minWidth: 320, display: "flex", borderRadius: 8 }}>
                    <Stack sx={{ width: "90%", background: "#fff", padding: 2, borderRadius: 4 }} spacing={3}>
                      <Typography>{question.content}</Typography>
                      {locale === 'ja' && <Typography>{question.translation[0].content}</Typography>}
                      <Button variant="contained" sx={{ color: "#fff" }} onClick={() => handleOnClickAnswer(question.content)}>{t("paragraph.buttonAnswer")}</Button>
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          </Stack>
        </Box>
      }
    </Box>
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


export async function getServerSideProps({ params, locale = 'en' }) {
  const { slug } = params;
  const res = await client.withAllLocales.getEntries({
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
  // let relatedArticles = []

  const id = article.sys.id

  // if (subcategories && subcategories.length > 0) {
  //   const relatedArticlesRes = await Promise.all(subcategories.map((subcategory) => client.getEntries({
  //     content_type: "blogPost",
  //     limit: 3,
  //     'fields.subcategory': subcategory,
  //     'sys.id[ne]': id,
  //   })))

  //   relatedArticles = relatedArticlesRes.map((res) => res.items).flat().filter((item) => item.sys.id !== id)
  // }

  const i18Props = (
    await serverSideTranslations(
      locale,
      [
        'common',
      ],
      nextI18NextConfig,
      [
        'en',
        'ja'
      ]
    )
  )

  return {
    props: {
      slug,
      article,
      body,
      ...i18Props
    },
  };
}

