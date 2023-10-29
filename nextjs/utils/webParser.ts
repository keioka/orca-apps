import urlMetadata from 'url-metadata'
import { default as urlAPI } from 'url'
import * as cheerio from 'cheerio';
import axios from 'axios';
var { Readability } = require('@mozilla/readability');
var { JSDOM } = require('jsdom');

interface SiteData {
  title: string;
  publisher: string;
  description: string;
  imageUrl: string;
  url: string;
  publisherName: string;
  locale: string;
  domain: string;
}

export async function fetchAndParseWebsite(url: string): Promise<SiteData | null> {
  try {
    const data = await urlMetadata(url)
    const parsedUrl = urlAPI.parse(url);

    const sitedata = {
      ...data,
      domain: parsedUrl.hostname,
      title: data.title || data['og:title'],
      description: data.description || data['og:description'],
      imageUrl: data.image || data['og:image'],
      url: data.url || data['og:url'],
      publisherName: data['og:site_name'],
      locale: data['og:locale'],
    }

    return sitedata
  } catch (error) {
    console.error("Error fetching and parsing the URL:", error);
    return { error: error.message };
  }
}


export async function parseWebText(url: string): Promise<string | null> {
  if (!url) {
    return null
  }

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const body = $('body').html();
  const document = new JSDOM(body)
  const article = new Readability(document.window.document).parse();

  console.log("content=========================")
  console.log(article.textContent)

  // Use Cheerio to parse the HTML
  // const $ = cheerio.load(html);
  // const $ = await cheerio.fromURL(url);
  // const text = $('body').text();
  return article.textContent.trim();
}