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

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
}

interface SearchResult {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
}

const searchKeywords = [
  {
    query: 'Japan',
    label: '日本全般'
  },
  {
    query: 'Israel–Hamas war',
    label: 'イスラエル・ハマス紛争',
  },
  {
    query: 'Russo-Ukrainian War',
    label: 'ウクライナ戦争',
  },
  {
    query: 'US stock',
    label: '米国株',
  },
  {
    query: 'Japan fund scandal',
    label: '自民政治資金問題',
  },
  {
    query: 'japan wage',
    label: '賃上げ2024',
  },
  {
    query: 'us election 2024',
    label: '米国大統領選2024',
  }
]

function Main() {
  const [result, setResult] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [geoResult, setGeoResult] = useState<SearchResult[]>([]);
  const [keyword, setKeyword] = useState<string>("");

  // useEffect(() => {
  //   handleSearchByGeo()
  // }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }

  const handleSearch = async (keywordPassed?: string) => {
    console.log({ keywordPassed })
    setIsSearching(true)
    let searchKeyword = keyword
    if (typeof keywordPassed === "string") {
      searchKeyword = keywordPassed
    }

    if (searchKeyword == null) {
      setIsSearching(false)
      return
    }

    try {
      console.log("searchKeyword", searchKeyword)
      const response = await axios.get(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/news?keyword=${searchKeyword}`);
      const data = response.data
      setResult(data.sort((a, b) => { return a.isoDate > b.isoDate ? -1 : 1 }));
    } catch (error) {
      console.error(error);
    }

    setIsSearching(false)

  }


  const handleSearchByGeo = async () => {
    try {
      const response = await axios.get(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/geoNews?geo=Japan`);
      const data = response.data
      setGeoResult(data.sort((a, b) => { return a.isoDate > b.isoDate ? -1 : 1 }));
    } catch (error) {
      console.error(error);
    }
  }

  console.log(result)
  return (
    <Box sx={{ p: 12 }}>
      <Stack spacing={4}>
        <Typography variant="h4">
          Search
        </Typography>
        <Stack spacing={2} direction="row">
          <TextField
            id="outlined-basic"
            label="キーワード検索"
            variant="outlined"
            sx={{
              width: "100%",
            }}
            InputProps={{
              sx: {
                fontSize: 24
              }
            }}
            onChange={handleChange}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>

        </Stack>
        <Typography>人気のキーワードから検索</Typography>
        <Stack direction="row" sx={{ overflow: "scroll" }}>
          {searchKeywords && searchKeywords.map((item, index) => (
            <Box sx={{ marginRight: 1 }}>
              <Chip label={item.label} onClick={() => handleSearch(item.query)} />
            </Box>
          ))}
        </Stack>
        {/* <Typography>Japan</Typography>

        <Stack direction="row" sx={{ overflow: "scroll", paddingY: 1 }}>
          {geoResult && geoResult.map((item, index) => (
            <Card sx={{ minWidth: 320, marginRight: 2 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="body1">{item.title}</Typography>
                  <Typography variant="body2">{moment(item.isoDate).format("MM/DD/YYYY - HH:mm")}</Typography>
                  <Button variant="contained" color="primary" onClick={() => { }}>Read More</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack> */}
        <Typography>検索結果</Typography>
        {isSearching && <Typography>Searching...</Typography>}
        <Grid container spacing={2}>
          {!isSearching && result && result.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="body1">{item.titleLocale.text}</Typography>
                    <Typography variant="body1" sx={{ color: "#b4b4b4" }}>{item.title}</Typography>
                    <Typography variant="body2">{moment(item.isoDate).format("MM/DD/YYYY HH:mm")}</Typography>
                    <Button variant="contained" color="primary" onClick={() => window.open(item.link, "_blank")}>Read More</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box >
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