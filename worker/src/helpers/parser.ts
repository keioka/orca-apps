import * as cheerio from 'cheerio';
import axios from 'axios';
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom';
import axios, { AxiosRequestConfig } from 'axios';

export async function parseWebText(url: string): Promise<string | null> {
  if (!url) {
    return null;
  }

  const headers: AxiosRequestConfig['headers'] = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    Referer: 'http://www.google.com/'
  };

  const response = await axios.get(url, { headers });
  const html = response.data;
  const $ = cheerio.load(html);
  const body = $('body').html();
  const document = new JSDOM(body);
  const article = new Readability(document.window.document).parse();
  if (!article) {
    return null;
  }
  return article.textContent.trim();
}