import axios from 'axios';

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Array<Article>;
}

interface Article {
  source: {
    id: string;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

const formatDate = (date) => date.toISOString().split('T')[0];

const getYesterdaysDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return formatDate(date);
};

const getTodaysDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

const domains = 'abcnews.go.com,aljazeera.com,arstechnica.com,apnews.com,axios.com,bleacherreport.com,bloomberg.com,breitbart.com,businessinsider.com,buzzfeed.com,cbsnews.com,cnn.com,ccn.com,engadget.com,ew.com,espn.com,espncricinfo.com,fortune.com,foxnews.com,foxsports.com,google.com,ycombinator.com,ign.com,mashable.com,medicalnewstoday.com,msnbc.com,mtv.com,nationalgeographic.com,nationalreview.com,nbcnews.com,newscientist.com,newsweek.com,nymag.com,nextbigfuture.com,nfl.com,nhl.com,politico.com,polygon.com,recode.net,reddit.com,reuters.com,techcrunch.com,techradar.com,theamericanconservative.com,thehill.com,huffingtonpost.com,thenextweb.com,theverge.com,wsj.com,washingtonpost.com,washingtontimes.com,time.com,usatoday.com,vice.com,wired.com'

export const getNewsFromAPI = async (query: string) => {
  const url = 'https://newsapi.org/v2/everything';
  const queryParams = {
    q: query,
    from: getYesterdaysDate(),
    to: getTodaysDate(),
    sortBy: 'relevancy',
    domains: domains,
    apiKey: process.env.NEWS_API_API_KEY,
  };

  try {
    const response = await axios.get(url, { params: queryParams });
    console.log({
      response
    })
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const formatResponse = (response: NewsApiResponse) => {
  const { articles } = response;
  return articles.map((article) => ({
    title: article.title,
    url: article.url,
    source: article.source.name,
    publishedAt: article.publishedAt,
  }));
}