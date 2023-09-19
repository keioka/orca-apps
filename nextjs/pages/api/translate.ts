import axios from "axios";
const DEEPL_API_ENDPOINT = 'https://api-free.deepl.com/v2/translate';
const USER_AGENT = 'YourApp/1.2.3';  // Replace with your application's user agent

async function translateText(text: string, targetLang: string): Promise<string> {
  console.log("key", process.env.DEEPL_AUTH_KEY)
  try {
    const response = await axios.post(
      DEEPL_API_ENDPOINT,
      {
        text: [text],
        target_lang: targetLang
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_AUTH_KEY}`,
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log({ response })
    const translations = response.data.translations;
    if (translations && translations.length > 0) {
      return translations[0].text;
    } else {
      throw new Error('No translations received from DeepL');
    }

  } catch (error) {
    console.error(error);
    throw new Error(`Error translating text: ${error.message}`);
  }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { text, lang } = req.body;

  console.log({ body: req.body })
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const translation = await translateText(text, lang)

    return res.status(200).json({ translation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
