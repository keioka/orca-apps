const contentful = require('contentful')

export const client = contentful.createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_API_KEY,
  host: process.env.NEXT_PUBLIC_CONTENTFUL_HOST,
})

export const clientPreview = contentful.createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_API_KEY,
  host: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_HOST,
})