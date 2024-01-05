import axios from 'axios'
const url = process.env.LAMBDA_URL

export async function polly({ text, paragraphNumber, slug }: { text: string, paragraphNumber: string, slug: string }) {
  const response = await axios.post(
    url + '/polly',
    {
      text,
      paragraphNumber,
      slug
    }
  )

  return response.data
}