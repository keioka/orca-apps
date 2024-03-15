import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  TextField,
  Chip
} from "@mui/material"
import { Card, CardContent, CardMedia } from "@mui/material";
import moment from "moment";
import type { PlasmoCSConfig } from "plasmo"
import {
  BrowserRouter,
} from "react-router-dom";
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import "../font.css"
import { sendToBackground } from "@plasmohq/messaging";
import { getLinkPreview, getPreviewFromContent } from "link-preview-js";

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
}

interface Article {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
}

interface SearchResponse {
  label: string;
  query: string;
  type: string;
  articles: Article[];
}

interface SearchResultData {
  label: string;
  query: string;
  type: string;
  articles: Article[];
}

function Main() {
  const [data, setData] = useState<SearchResponse[]>([])
  useEffect(() => {
    const init = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const searchParamsData = searchParams.get("data")

        const { data, error }: { data: SearchResponse[] } = await sendToBackground({
          name: "jwtDecode",
          body: {
            data: searchParamsData
          }
        })

        if (error) {
          console.error(error)
          return
        }

        setData(data)
      } catch (e) {
        console.error(e)
      }
    }

    init()
  }, [])

  return (
    <Box sx={{ p: 12 }}>
      <Typography variant="h4">{new Date().toLocaleDateString()}</Typography>
      <Typography variant="h3">新着記事一覧</Typography>
      {data.map((d, i) => (
        <Box key={i} sx={{ mt: 12 }}>
          <Typography variant="h4">{d.label}</Typography>
          <Grid container spacing={2}>
            {d.articles.map((article, j) => {
              console.log({ article })
              return (
                <Grid item xs={12} key={j} >
                  <Card onClick={() => window.open(article.link, "_target")} sx={{ cursor: "pointer" }}>
                    <CardContent>
                      <Typography gutterBottom variant="caption" component="div">
                        Translated by DeepL
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div">
                        {article.titleLocale.text}
                      </Typography>
                      <Typography gutterBottom variant="h6" component="div" sx={{ color: "#c4c4c4" }}>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {moment(article.isoDate).format("YYYY/MM/DD HH:mm")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {article.contentSnippet}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  )
}

function App() {
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App