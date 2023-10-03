import React, { useState, useEffect } from "react"
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
import { CardCategory } from "~components/CardCategory"
import { CardNewsFeed } from "~components/CardNewsFeed"
import businessImage from "data-base64:~assets/images/business.png"
import { BsSearch } from "react-icons/bs"
import { vc } from "~data/rss/vc"
import { NoteScreen } from "../tabScreens/NoteScreen"
import { Provider } from "react-redux";
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { persistor, store } from '../redux/store';
import { getTheme } from "../theme";
import { ThemeProvider } from '@mui/material/styles';

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/"],
  css: ["../font.css"]
}

const WIDTH_SIDEBAR = 280
const ROOT_PATH = "/tabs/index.html"

const feeds = [
  {
    category: "Business",
    items: [
      {
        name: "Mckinsey",
        url: "https://www.mckinsey.com/insights/rss.aspx"
      },
    ]
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
  const domain = new URL(url).origin;
  const faviconUrl = `${domain}/favicon.ico`;

  return faviconUrl
}

function Main() {
  return (
    <Routes>
      <Route path={`${ROOT_PATH}`} element={<Layout />}>
        <Route index element={<Home />} />
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
    <Stack direction="row" spacing={1} alignItems="center" sx={{ paddingLeft: "20px", cursor: "pointer" }}>
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
          sx={{
            backgroundColor: "#f4f4f4",
            padding: 2,
            width: "100%",
            height: 32,
          }}
        >

        </Box>
        <Box sx={{ paddingX: 2, marginTop: 2 }}>
          <Typography variant="caption">Dashboard</Typography>
        </Box>
        <Box sx={{ display: "flex", height: 32, alignItems: "center" }}>
          <Menu
            icon={<SlFeed size={12} />}
            path={`${ROOT_PATH}/note`}
            title="Note"
          />
        </Box>
        {/* <Box sx={{ display: "flex", height: 32, alignItems: "center" }}>
          <Menu
            icon={<BsGraphUpArrow size={12} />}
            path={`${ROOT_PATH}/dashboard`}
            title="Progress"
          />
        </Box> */}

        <Box>
          <Box sx={{ paddingX: 2, marginTop: 2 }}>
            <Typography variant="caption">RSS Feed</Typography>
          </Box>
          <Box sx={{ display: "flex", height: 32, alignItems: "center" }}>
            <Menu
              icon={<BsSearch size={12} />}
              path={`${ROOT_PATH}/feed`}
              title="Search"
            />
          </Box>
          {/* <Box sx={{ display: "flex", height: 32, alignItems: "center" }}>
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
                        icon={<img src={fetchFavicon(item.url)} style={{ width: 16, height: 16 }} />
                        }
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
      </Drawer>
      <Box
        sx={{
          paddingLeft: `${WIDTH_SIDEBAR}px`
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function Home() {
  return (
    <Stack spacing={6}>
      <Stack sx={{ background: "#f4f4f4", justifyContent: "center", alignItems: "center", padding: 2, borderRadius: 1 }} spacing={1}>
        <Typography>Type RSS Feed URL</Typography>
        <TextField sx={{ background: "#fff", width: "90%" }} size="small" placeholder="https://" />
      </Stack>

      <Box>
        <Typography variant="h6">By Category</Typography>
        <Stack direction="row" spacing={1} sx={{ overflowX: "scroll", padding: 1 }}>
          <CardCategory imgUrl={businessImage} title={"business"} />
          <CardCategory imgUrl={businessImage} title={"World News"} />
          <CardCategory imgUrl={businessImage} title={"VC"} />
          <CardCategory imgUrl={businessImage} title={"Science"} />
        </Stack>
      </Box>
      <Stack spacing={1}>
        <CardNewsFeed feed={{
          name: "TechCrunch",
        }} />
        <CardNewsFeed feed={{}} />
        <CardNewsFeed feed={{}} />
        <CardNewsFeed feed={{}} />
        <CardNewsFeed feed={{}} />
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