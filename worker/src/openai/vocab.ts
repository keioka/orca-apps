import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

const langName = {
  'ja': 'Japanese',
  'en': 'English',
  'vi': 'Vietnamese',
}

export async function getVocabsFromText({ id, text, transLangCode }) {
  console.log("getVocabsFromText", id)
  try {
    const response = await openai.chat.completions.create(
      {
        model: 'gpt-3.5-turbo-1106',
        temperature: 0,
        // response_format: { "type": "json_object" },
        messages: [
          {
            role: "system",
            content: `          
            You are an English teacher. Please give me a comprehensive list of vocabulary including words, phrasal verbs, and phrases extracted from the provided content. The list should be formatted in JSON, with details for each vocabulary item from each sentence. 
            Don't include proper nouns, such as names of people, places, or companies.

            Here are the specifications for the list:
            - [word]: The word, phrasal verb, or phrase (e.g., verb, noun, adjective, adverb, preposition, conjunction, interjection, phrasal verb, idiom, proverb, slang). Ensure nouns are in singular form and verbs are in base form. Required
            - [pronounce]: The pronunciation of the word or phrase. Required
            - [part of speech (POS)]: The part of speech of the word or phrase. Required
            - [meaning]: The meaning of the word or phrase. Required
            - [sentence]: The sentence from the content where the word or phrase is found. Required
            - [example]: Additional examples of the word or phrase in use. Required
            - [meaningInJapanese]: The meaning of the word or phrase in Japanese. Required
            
            All of fields below are required.
            Please process the following text to create the list:

            Content:
            """"
            ${text}
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
                    pos: {
                      type: "string",
                      description: "Part of speech (POS) of the word or phrase"
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
                    [`meaningIn${langName[transLangCode.toLowerCase()]}`]: {
                      type: "string",
                      description: "Meaning of the word or phrase in Japanese"
                    },
                  }
                }
              }
            },
            required: [
              "word",
              "pronounce",
              "pos",
              "meaning",
              "sentence",
              "example",
              `meaningIn${langName[transLangCode.toLowerCase()]}`
            ],
          },

        }],
        function_call: { name: "set_recipe" },
      }, {
      timeout: 60000,
    });

    const generatedText = response.choices[0].message.function_call.arguments;

    const result = JSON.parse(generatedText)

    if (!result || !result.vocabs) {
      return { err: 'No response from OpenAI' }
    }

    console.log({
      result
    })
    return {
      vocabs: result.vocabs
    }
  } catch (error) {
    console.error(error)
    return {
      vocabs: []
    }
  }
}