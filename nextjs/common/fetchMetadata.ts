import urlMetadata from 'url-metadata'

interface Metadata {
  title: string
  description: string
  image: string
  url: string
  name: string
  locale: string
}

export async function fetchMetadata(url: string): Promise<Metadata> {

  const data = await urlMetadata(url)

  const jsonld = data.jsonld
  const publisher = jsonld?.publisher
  const date = jsonld.datePublished


  const sitedata = {
    title: data.title as string || data['og:title'] as string,
    description: data.description as string || data['og:description'] as string,
    image: data.image as string || data['og:image'] as string,
    url: data.url as string || data['og:url'] as string,
    name: data['og:site_name'] as string,
    locale: data['og:locale'] as string,
    category: data.theme || "general",
    publishedAt: date as string,
    externalId: data['og:url'] as string,
    publisher: {
      type: "Article",
      externalId: publisher?.name as string || data.url as string,
      name: publisher?.name as string || data.url as string,
      url: publisher?.url as string || data.url as string,
      imageUrl: publisher?.logo as string || data.image as string,
    }
  }

  return sitedata
}