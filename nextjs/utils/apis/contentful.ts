const contentful = require('contentful')

export const client = contentful.createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_API_KEY,
  host: process.env.NEXT_PUBLIC_CONTENTFUL_HOST,
})

console.log({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID?.slice(0, 5),
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_API_KEY?.slice(0, 5),
  host: process.env.NEXT_PUBLIC_CONTENTFUL_HOST?.slice(0, 5),
})