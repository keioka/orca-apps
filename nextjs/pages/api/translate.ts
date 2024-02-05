import axios from "axios";
const DEEPL_API_ENDPOINT = 'https://api-free.deepl.com/v2/translate';
const USER_AGENT = 'YourApp/1.2.3';  // Replace with your application's user agent
import { translate } from '@/utils/apis/deepL'

async function translateText(text: string, targetLang: string = 'ja'): Promise<string> {
  try {
    [{ text }] = await translate({ texts: [text], targetLang })
    if (text) {
      return text
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
