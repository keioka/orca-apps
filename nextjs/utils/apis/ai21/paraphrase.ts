import axios, { AxiosResponse } from 'axios';

interface ParaphraseCoreRequest {
  text: string; // The input text to be paraphrased
  style?: string; // Controls length and tone, default is 'general'
  startIndex?: number; // Starting position for paraphrasing, optional
  endIndex?: number; // End position for paraphrasing, optional
}

interface ParaphraseCoreResult {
  text: string; // The paraphrased text
}

type ParaphraseCoreResponse = ParaphraseCoreResult[];

export const getParaphraseCore = async (requestData: ParaphraseCoreRequest): Promise<ParaphraseCoreResponse> => {
  try {
    const response: AxiosResponse<ParaphraseCoreResponse> = await axios.post(
      'https://api.ai21.com/studio/v1/paraphrase',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AI21_API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error: any) {
    console.error('Error:', error);
    throw error; // or handle it as you see fit
  }
};

interface ParaphraseRequest {
  sentence: string
}

interface ParaphraseResult {
  sentence: string;
  tone: string;
}

type ParaphraseResponse = {
  phrases: ParaphraseResult[]
};

export const getParaphrase = async (requestData: ParaphraseRequest): Promise<ParaphraseResponse> => {
  try {
    const styles = ["general", "casual", "formal", "short", "long"]
    const allStyleResult = await Promise.all(styles.map(async (style) => {
      const sentences = await getParaphraseCore({
        text: requestData.sentence,
        style: style
      })

      return sentences.suggestions.map((sentence) => {
        return {
          sentence: sentence.text,
          tone: style
        }
      })
    }))
    const result = allStyleResult.flat()
    return { phrases: result }
  } catch (error: any) {
    console.error('Error:', error);
    throw error; // or handle it as you see fit
  }
};

// https://docs.ai21.com/reference/paraphrase-ref