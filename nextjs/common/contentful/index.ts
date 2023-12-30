import { format } from 'path'
import { client } from '../../utils/apis/contentful'

export async function getAllArticles() {
  const result = await client.getEntries({
    content_type: "newsArticle",
    limit: 200,
  })

  console.log({ result })
  return result
}


export async function getEntry(entryId: string) {
  const res = await client.getEntry(entryId)

  console.log(res)
  if (!res || !res.items || res.items.length === 0) {
    return null; // Return null if the data structure is not as expected
  }

  return res.items[0]; // Return the first item from the 'items' array
}

export async function updateContent() {
  const result = await client.updateContent({

  })
}

export function formatEntries(entries: any[]) {
  return entries.map((entry) => {
    return {
      id: entry.sys.id,
      title: entry.fields.title,
      slug: entry.fields.slug,
      description: entry.fields.description,
      content: entry.fields.content,
      publishedDate: entry.fields.publishedDate,
      // heroImage: {
      //   url: entry.fields.heroImage.fields.file.url,
      //   width: entry.fields.heroImage.fields.file.details.image.width,
      //   height: entry.fields.heroImage.fields.file.details.image.height,
      // },
    }
  })
}