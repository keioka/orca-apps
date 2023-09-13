import urlMetadata from 'url-metadata'

async function getMetadata(url: string) {

  const data = await urlMetadata(url)

  const sitedata = {
    title: data.title || data['og:title'],
    description: data.description || data['og:description'],
    image: data.image || data['og:image'],
    url: data.url || data['og:url'],
    name: data['og:site_name'],
    locale: data['og:locale'],
  }

  return sitedata
}