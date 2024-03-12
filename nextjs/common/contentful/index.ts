import axios from 'axios';
import { format } from 'path'
import { client, clientPreview } from '../../utils/apis/contentful'

const localeKeys = {
  en: 'en-US',
  ja: 'ja-JP',
}

function getEnUS(obj) {
  if (Array.isArray(obj)) {
    return obj.map(getEnUS);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj['en-US']) {
      return obj['en-US'];
    }
    const newObj = {};
    for (const key in obj) {
      newObj[key] = getEnUS(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function getJaJp(obj) {
  if (Array.isArray(obj)) {
    return obj.map(getJaJp);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj['ja']) {
      return obj['ja'];
    }
    const newObj = {};
    for (const key in obj) {
      if (key === 'en-US') {
        return ""
      }
      newObj[key] = getJaJp(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export async function getAllArticles() {
  return await clientPreview.getEntries({
    content_type: "newsArticle",
    limit: 100,
  })
}

export async function getEntryWithLocale(entryId: string) {
  const res = await clientPreview.withAllLocales.getEntry(entryId)
  return res; // Return the first item from the 'items' array
}

export async function getEntry(entryId: string) {
  const res = await clientPreview.getEntry(entryId)
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  console.log({ res })
  return res; // Return the first item from the 'items' array
}

export async function updateContent() {
  const result = await client.updateContent({

  })
}

export function formatEntries(entries: any[]) {


  return entries.map((entry) => {

    const cleanedArticle = getEnUS(entry)
    const jaArticle = getJaJp(entry)
    return {
      id: cleanedArticle.sys.id,
      title: cleanedArticle.fields.title,
      slug: cleanedArticle.fields.slug,
      description: cleanedArticle.fields.description,
      content: cleanedArticle.fields.content,
      publishedDate: cleanedArticle.fields.publishedDate,

      p1Exists: cleanedArticle.fields.p1 && cleanedArticle.fields.p1.length > 0 ? true : false,
      p1VocabCount: cleanedArticle.fields.p1Vocab ? cleanedArticle.fields.p1Vocab.length : 0,
      p1JaExists: jaArticle.fields.p1 && jaArticle.fields.p1.length > 0 ? true : false,
      p1AudioLink: cleanedArticle.fields.p1AudioLink,

      p2VocabCount: cleanedArticle.fields.p2Vocab ? cleanedArticle.fields.p2Vocab.length : 0,
      p2Exists: cleanedArticle.fields.p2 && cleanedArticle.fields.p2.length > 0 ? true : false,
      p2AudioLink: cleanedArticle.fields.p2AudioLink,
      p2JaExists: jaArticle.fields.p2 && jaArticle.fields.p2.length > 0 ? true : false,

      p3VoabCount: cleanedArticle.fields.p3Vocab ? cleanedArticle.fields.p3Vocab.length : 0,
      p3Exists: cleanedArticle.fields.p3 && cleanedArticle.fields.p3.length > 0 ? true : false,
      p3AudioLink: cleanedArticle.fields.p3AudioLink,

      p4VoabCount: cleanedArticle.fields.p4Vocab ? cleanedArticle.fields.p4Vocab.length : 0,
      p4Exists: cleanedArticle.fields.p4 && cleanedArticle.fields.p4.length > 0 ? true : false,
      p4AudioLink: cleanedArticle.fields.p4AudioLink,

      p5VoabCount: cleanedArticle.fields.p5Vocab ? cleanedArticle.fields.p5Vocab.length : 0,
      p5Exists: cleanedArticle.fields.p5 && cleanedArticle.fields.p5.length > 0 ? true : false,
      p5AudioLink: cleanedArticle.fields.p5AudioLink,

      p6Exists: cleanedArticle.fields.p6 && cleanedArticle.fields.p6.length > 0 ? true : false,
      p6AudioLink: cleanedArticle.fields.p6AudioLink,
      // heroImage: {
      //   url: entry.fields.heroImage.fields.file.url,
      //   width: entry.fields.heroImage.fields.file.details.image.width,
      //   height: entry.fields.heroImage.fields.file.details.image.height,
      // },
    }
  })
}



export function formatContentfulEntryWithLocale(entry: Entry): {
  id: string;
  url: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: Date;
  imageUrl: string | null;
} {
  const cleanedArticle = getEnUS(entry)
  const jaArticle = getJaJp(entry)
  const file = cleanedArticle.fields.heroImage && cleanedArticle.fields.heroImage.fields ? cleanedArticle.fields.heroImage.fields.file : null
  const imageUrl = file ? file.url : null
  return {
    id: cleanedArticle.sys.id,
    title: cleanedArticle.fields.title,
    titleJa: jaArticle.fields.title,
    slug: cleanedArticle.fields.slug,
    description: cleanedArticle.fields.description,
    content: cleanedArticle.fields.content,
    publishedDate: cleanedArticle.fields.publishedDate,
    imageUrl: imageUrl ? "https:" + imageUrl : null,
    p1: cleanedArticle.fields.p1,
    p1Ja: jaArticle.fields.p1,
    p1VocabCount: cleanedArticle.fields.p1Vocab,
    p1AudioLink: cleanedArticle.fields.p1AudioLink,

    p2: cleanedArticle.fields.p2,
    p2Ja: jaArticle.fields.p2,
    p2VocabCount: cleanedArticle.fields.p2Vocab,
    p2AudioLink: cleanedArticle.fields.p2AudioLink,

    p3: cleanedArticle.fields.p3,
    p3Ja: jaArticle.fields.p3,
    p3VoabCount: cleanedArticle.fields.p3Vocab,
    p3AudioLink: cleanedArticle.fields.p3AudioLink,

    p4: cleanedArticle.fields.p4,
    p4Ja: jaArticle.fields.p4,
    p4VoabCount: cleanedArticle.fields.p4Vocab,
    p4AudioLink: cleanedArticle.fields.p4AudioLink,

    p5: cleanedArticle.fields.p5,
    p5Ja: jaArticle.fields.p5,
    p5VoabCount: cleanedArticle.fields.p5Vocab,
    p5AudioLink: cleanedArticle.fields.p5AudioLink,
  }
}

export function formatContentfulEntry(article: Entry): {
  id: string;
  url: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: Date;
  imageUrl: string;
} {
  const { fields, sys } = article
  const { id, title, slug, publishedDate, heroImage, category } = fields
  const file = heroImage && heroImage.fields ? heroImage.fields.file : null
  const imageUrl = file ? file.url : null

  return {
    id: sys.id,
    title,
    url: process.env.ROOT_URL + "/articles/" + slug,
    slug,
    category: category || "general",
    publishedAt: publishedDate ? new Date(publishedDate) : new Date(),
    imageUrl: imageUrl ? "https:" + imageUrl : null,
    p1Vocab: fields.p1Vocab,
    p2Vocab: fields.p2Vocab,
    p3Vocab: fields.p3Vocab,
    p4Vocab: fields.p4Vocab,
    p5Vocab: fields.p5Vocab,
  }
}


type locale = 'en-US' | 'ja-JP'

type UpdateEntryParams = {
  spaceId: string;
  environmentId: string;
  entryId: string;
  cmaToken: string;
  contentTypeId: string;
  version: number;
  fields: {
    [key in locale]: any;
  }
};

type UpdateEntryResponse = {
  // Define the response type structure here
};

// https://www.contentful.com/developers/docs/references/content-management-api/#/reference/entries/entry/update-an-entry/console

type GetEntryParams = {
  spaceId: string;
  environmentId: string;
  entryId: string;
  cmaToken: string;
};

type GetEntryResponse = {
  fields: {
    [key: string]: {
      [key: string]: string;
    };
  };
  metadata: {
    tags: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    }[];
  };
  sys: {
    id: string;
    type: string;
    contentType: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    version: number;
    space: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    environment: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    createdAt: string;
    createdBy: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    updatedAt: string;
    updatedBy: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
  };
};

export async function getEntryRaw(entryId: string): Promise<GetEntryResponse> {
  const url = `https://${process.env.NEXT_PUBLIC_CONTENTFUL_PROD_HOST}/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/master/entries/${entryId}`;
  const headers = {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_CMA_TOKEN}`
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data as GetEntryResponse;
  } catch (error) {
    console.error('Error retrieving entry:', error);
    throw error;
  }
}

export async function updateEntry(params: UpdateEntryParams): Promise<UpdateEntryResponse> {
  const { entryId, contentTypeId, environmentId, version, fields } = params;
  const url = `https://${process.env.NEXT_PUBLIC_CONTENTFUL_PROD_HOST}/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${environmentId}/entries/${entryId}`;
  const headers = {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_CMA_TOKEN}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json',
    'X-Contentful-Content-Type': contentTypeId,
    'X-Contentful-Version': version
  };
  const requestBody = {
    fields: fields
  };

  console.log({ requestBody })
  try {
    const response = await axios.put(url, requestBody, { headers });
    return response.data as UpdateEntryResponse;
  } catch (error) {
    console.error('============================');
    // console.error('Error updating entry:', error);
    console.error("Error updating entry:", error.response.data);
    console.error("Error updating entry details:", JSON.stringify(error.response.data.details))
  }
}