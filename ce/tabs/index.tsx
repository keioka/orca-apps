import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Drawer,
  Stack,
  TextField
} from "@mui/material"
import type { PlasmoCSConfig } from "plasmo"
import { ExpandableMenu } from "~components/ExpandableMenu"
import Parser from 'rss-parser';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import { ListVocab } from "~components/ListVocab";
import { SlFeed } from "react-icons/sl"
import { BsGraphUpArrow } from "react-icons/bs"
import vcRSS from "~data/rss/vc.json"
import businessRSS from "~data/rss/business.json"
import { CardCategory } from "~components/CardCategory"
import { CardNewsFeed } from "~components/CardNewsFeed"
import businessImage from "data-base64:~assets/images/business.jpg"
import vcImage from "data-base64:~assets/images/vc.jpg"
import financeImage from "data-base64:~assets/images/finance.jpg"
import worldNewsImage from "data-base64:~assets/images/world_news.jpg"
import scienceImage from "data-base64:~assets/images/science.jpg"

import { BsSearch } from "react-icons/bs"
import { NoteScreen } from "../tabScreens/NoteScreen"
import { Provider } from "react-redux";
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { persistor, store } from '../redux/store';
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';
import { PiNotebookDuotone } from "react-icons/pi"
import { useAppDispatch, useAppSelector } from "~redux/hooks";
import { fetchPublishers } from "~redux/features/publisher"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
  css: ["../font.css"]
}

const WIDTH_SIDEBAR = 280
const ROOT_PATH = "/tabs/index.html"

const feeds = [
  {
    category: "Business",
    items: businessRSS
  },
  {
    category: "Tech",
    items: [
      {
        name: "TechCrunch",
        url: "https://techcrunch.com/feed"
      },
      {
        name: "Google AI Blog",
        url: "http://googleresearch.blogspot.com/atom.xml"
      },
      {
        name: "CNET",
        url: "https://cnet.com/rss/all"
      },
      {
        name: "Digital Trends",
        url: "https://digitaltrends.com/feed"
      },
      {
        name: "Engadget",
        url: "https://engadget.com/rss.xml"
      },
      {
        name: "The Verge",
        url: "https://theverge.com/rss/index.xml"
      },
    ]
  },
  {
    category: "Marketing",
    items: [
      {
        name: "Semrush Blog",
        url: "https://www.semrush.com/blog/feed/"
      }
    ]
  },
  {
    category: "Machine Learning",
    items: [
      {
        name: "Machine Learning Blog | ML@CMU | Carnegie Mellon University",
        url: "https://blog.ml.cmu.edu/feed/"
      },
      {
        name: "DeepMind",
        url: "https://deepmind.com/blog/feed/basic/"
      },
      {
        name: "Jay Alammar",
        url: "https://jalammar.github.io/feed.xml"
      }
      // ... (and more from this category)
    ]
  },
  {
    category: "Venture Capital",
    items: vcRSS
  }
]


function fetchFavicon(url) {
  // Try fetching favicon.ico from the root domain first
  try {
    const domain = new URL(url).origin;
    const size = 24
    // const faviconUrl = `${domain}/favicon.ico`;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    return faviconUrl
  } catch (err) {
    return ""
  }
}

function Main() {
  return (
    <Routes>
      <Route path={`${ROOT_PATH}`} element={<Layout />}>
        <Route index element={<NoteScreen />} />
        <Route path="search" element={<Search />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="note" element={<NoteScreen />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  )
}


function Menu({ path, state, icon, title }) {
  const navigate = useNavigate();

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: "pointer" }}>
      {icon}
      <Typography
        sx={{
          fontSize: 14,
        }}
        onClick={() => {
          navigate(path, { state: state });
        }}
      >
        {title}
      </Typography>
    </Stack>
  )
}

function Layout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 8
      }}
    >
      <Drawer
        anchor="left"
        open
        variant="persistent"
        PaperProps={{
          sx: {
            width: WIDTH_SIDEBAR,
            overflowY: "scroll",
          }
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.main,
            padding: 2,
            width: "100%",
            height: 32,
          })}
        >

        </Box>
        <Box sx={{ paddingX: 2, marginTop: 2 }}>
          <Typography variant="caption">{chrome.i18n.getMessage("menu_caption_dashboard")}</Typography>
        </Box>
        <Box sx={{ display: "flex", height: 32, alignItems: "center", paddingLeft: "20px" }}>
          <Menu
            icon={<PiNotebookDuotone size={24} />}
            path={`${ROOT_PATH}/note`}
            title={chrome.i18n.getMessage("menu_note")}
          />
        </Box>
        {/* <Box sx={{ display: "flex", height: 32, alignItems: "center" }}>
          <Menu
            icon={<BsGraphUpArrow size={12} />}
            path={`${ROOT_PATH}/dashboard`}
            title="Progress"
          />
        </Box> */}

        {/* *
         * RSS Feed
         */}

        <Box>
          <Box sx={{ paddingX: 2, marginTop: 2 }}>
            <Typography variant="caption">RSS Feed</Typography>
          </Box>
          <Box sx={{ display: "flex", height: 32, alignItems: "center", paddingLeft: "20px" }}>
            <Menu
              icon={<BsSearch size={12} />}
              path={`${ROOT_PATH}/search`}
              title="Search"
            />
          </Box>
          {/* <Box sx={{ display: "flex", height: 32, alignItems: "center", paddingLeft: "20px" }}>
            <Menu
              icon={<SlFeed size={12} />}
              path={`${ROOT_PATH}/feed`}
              title="For you"
            />
          </Box> */}

          {
            feeds.map((feed) => (
              <ExpandableMenu title={feed.category}>
                <Stack spacing={1}>
                  {
                    feed.items.map((item) => (
                      <Menu
                        icon={<img src={fetchFavicon(item.url)} style={{ width: 16, height: 16 }} />}
                        path={`${ROOT_PATH}/feed`}
                        state={{ item: item }}
                        title={item.name}
                      />
                      // <Stack direction="row" spacing={1} alignItems="center">
                      //   <img src={fetchFavicon(item.url)} style={{ width: 16, height: 16 }} />
                      //   <Typography
                      //     sx={{
                      //       fontSize: 14,
                      //     }}
                      //     onClick={() => {
                      //       navigate(`${ROOT_PATH}/feed`, { state: { item: item } });
                      //     }}
                      //   >
                      //     {item.name}
                      //   </Typography>

                      // </Stack>
                    ))
                  }
                </Stack>
              </ExpandableMenu>
            ))
          }
        </Box>
      </Drawer >
      <Box
        sx={{
          paddingLeft: `${WIDTH_SIDEBAR}px`
        }}
      >
        <Outlet />
      </Box>
    </Box >
  );
}

enum Category {
  BUSINESS = "business",
  TECH = "tech",
  MARKETING = "marketing",
  MACHINE_LEARNING = "machine_learning",
  VENTURE_CAPITAL = "venture_capital",
  SCIENCE = "science",
  WORLD_NEWS = "world_news"
}

function Search() {
  const dispatch = useAppDispatch();
  const publishers = useAppSelector((state) => state.publisher.publishers);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.BUSINESS)

  useEffect(() => {
    dispatch(fetchPublishers())
  }, []);

  const publishersFiltered = useMemo(() => {
    if (!publishers) {
      return []
    }

    return publishers
      .filter((publisher) => publisher.category === selectedCategory)
      .map((publisher) => {
        return {
          category: publisher.category,
          name: publisher.name,
          imageUrl: fetchFavicon(publisher.rssUrl),
          rssUrl: publisher.rssUrl
        }
      })
  }, [publishers, selectedCategory])

  function handleSelectCategory(category: Category) {
    setSelectedCategory(category)
  }

  console.log({ publishersFiltered })

  return (
    <Stack spacing={6}>
      <Stack sx={{ background: "#f4f4f4", justifyContent: "center", alignItems: "center", padding: 2, borderRadius: 1 }} spacing={1}>
        <Typography>Type RSS Feed URL</Typography>
        <TextField sx={{ background: "#fff", width: "90%" }} size="small" placeholder="https://" />
      </Stack>

      <Box>
        <Typography variant="h6">By Category</Typography>
        <Stack direction="row" spacing={1} sx={{ overflowX: "scroll", padding: 1 }}>
          <CardCategory imgUrl={businessImage} title={"business"} isSelected={selectedCategory === Category.BUSINESS} onClick={() => handleSelectCategory(Category.BUSINESS)} />
          <CardCategory imgUrl={worldNewsImage} title={"World News"} isSelected={selectedCategory === Category.WORLD_NEWS} onClick={() => handleSelectCategory(Category.WORLD_NEWS)} />
          <CardCategory imgUrl={vcImage} title={"VC"} isSelected={selectedCategory === Category.VENTURE_CAPITAL} onClick={() => handleSelectCategory(Category.VENTURE_CAPITAL)} />
          <CardCategory imgUrl={scienceImage} title={"Science"} isSelected={selectedCategory === Category.SCIENCE} onClick={() => handleSelectCategory(Category.SCIENCE)} />
        </Stack>
      </Box>
      <Stack spacing={1}>
        {publishersFiltered.map((publisher) => (
          <CardNewsFeed feed={publisher} />
        ))}
      </Stack>
    </Stack>
  );
}

function FeedPage() {
  const [articles, setArticles] = useState([]);
  const { state } = useLocation();
  const { item: selectedFeed } = state;

  useEffect(() => {
    const fetchArticles = async () => {
      if (!selectedFeed) {
        setArticles([]);
        return;
      }

      const parser = new Parser();
      const feed = await parser.parseURL(selectedFeed.url);

      setArticles(feed.items);
    };

    fetchArticles();
  }, [selectedFeed]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {selectedFeed && <Typography variant="h4">{selectedFeed.name}</Typography>}
      <Box mt={4}>
        {articles && articles.map((article) => (
          <a href={article.link} target="_blank" style={{ textDecoration: "none" }}>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: 1,
                borderBottom: "1px solid #f4f4f4"
              }}
              spacing={1}
            >
              <Typography color="#242424">{article.title}</Typography>
              <Typography variant="body2" color="#b4b4b4">{article.pubDate}</Typography>
            </Stack>
          </a>
        ))}
      </Box>
    </Box>
  )
}


function Dashboard() {
  return (
    <Box sx={{ width: 340 }}>
      <h2>Dashboard</h2>
      <ListVocab />
    </Box>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

function App() {
  const lang = chrome.i18n.getUILanguage()
  const langCode = lang.split("-")[0]
  const theme = getTheme(langCode)
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <BrowserRouter>
              <Main />
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App