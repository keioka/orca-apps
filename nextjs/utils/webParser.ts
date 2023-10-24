import urlMetadata from 'url-metadata'
import { default as urlAPI } from 'url'

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