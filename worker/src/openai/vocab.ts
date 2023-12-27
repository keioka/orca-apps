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
            As an English teacher, can you give me a list of vocabulary including word, phrasal verbs and phrases as many as possible from the content below. Please return the list in JSON format and extract vocabulary from each sentence from the content below.
 
            - [word]: Word, phrasal verb, or phrase. Verb, noun, adjective, adverb, preposition, conjunction, interjection, phrasal verb, idiom, proverb, slang, etc. Noun should be singular form. Verb should be in base form.
            - [pronounce]: Pronounce of the word or phrase
            - [part of speech (POS)]: Part of speech (POS) of the word or phrase
            - [meaning]: Meaning of the word or phrase
            - [sentence]: Sentence from the content
            - [example]: Give some examples of the word or phrase
            - [meaningIn${langName[transLangCode.toLowerCase()]}]: Meaning of the word or phrase in Japanese
            """
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