import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { id: string, text: string, transLangCode: string }

export async function getVocabsFromText(params: GetVocabByWordSentenceParams) {
  const timeLabel = `openai_${params.id}`
  console.time(timeLabel);
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `          
          As an English teacher, can you give me vocabulary for an English learner including word, phrasal verbs and phrases as many as possible from the content below. 

          - [word]: Word , phrasal verb, or phrase
          - [pronounce]: Pronounce of the word or phrase
          - [meaning]: Meaning of the word or phrase
          - [sentence]: Sentence from the content
          - [transMeaning${params.transLangCode}ByContext]: Translate meaning of the word or phrase from English to Japanese
          - [example]: Give some examples of the word or phrase
          """
          ${params.text}
          """
        `
      }
    ],
    functions: [{
      name: "set_recipe",
      parameters: {
        type: "object",
        properties: {
          vocabs: {
            type: "array",
            items: {
              type: 'object',
              properties: {
                word: {
                  type: "string",
                  description: "sentence from the content"
                },
                pronounce: {
                  type: "string",
                  description: "Pronounce of the word or phrase"
                },
                meaning: {
                  type: "string",
                  description: "Meaning of the word or phrase"
                },
                sentence: {
                  type: "string",
                  description: "sentence from the given content"
                },
                example: {
                  type: "string",
                  description: "other example for the word or phrase"
                },
                [`transMeaning${params.transLangCode}ByContext`]: {
                  type: "string",
                  description: "translation of the meaning or phrase to Japanese"
                },
              }
            }
          }
        }
      }
    }],
    function_call: { name: "set_recipe" }
  }, {
    timeout: 60000,
    maxRetries: 3
  });
  console.timeEnd(timeLabel); //Prints something like that-> test: 11374.004ms

  const generatedText = response.choices[0].message.function_call.arguments;
  try {
    const result = JSON.parse(generatedText)

    if (!result || !result.vocabs) {
      return { err: 'No response from OpenAI' }
    }

    return {
      vocabs: result.vocabs
    }
  } catch (error) {
    console.log(generatedText)
    console.error(error)
    return {
      vocabs: []
    }
  }
}