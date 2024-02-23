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
            Please create a comprehensive JSON-formatted vocabulary list from the provided text. 
            The list should include words, phrasal verbs, and phrases, but exclude proper nouns like names of people, places, or companies. 
            The list should have at least 50 words, phrasal verbs, or phrases.

            Each vocabulary item from each sentence should have the following details:

            [word]: The word, phrasal verb, or phrase in its base form (e.g., 'suggesting' becomes 'suggest'). This is required.
            [pronounce]: The pronunciation of the word or phrase. This is required.
            [level]: The level of the word or phrase. This is required. Level should be CEFR A1, A2, B1, B2, C1, C2
            [part of speech (POS)]: The part of speech of the word or phrase. This is required.
            [meaning]: The meaning of the word or phrase. This is required.
            [sentence]: The sentence from the content where the word or phrase is found. This is required.
            [example]: Additional examples of the word or phrase in use. This is required.
            [meaningInJapanese]: The Japanese translation of the word or phrase's meaning. Don't use sentence but should be a word This is required.
            
            Please ensure that all fields are filled for each vocabulary item. Process the following text to create the list:

            Please follow the following rules:
            
            Rule 1: Word can be combined word 
            For example:
            credit balances in credit balances. In this case, the word should be credit balances and not credit or balances.
            Debt level should be 'Debt Level' not debt and level


            Rule 2: Word should be singular for nouns and base form for verbs
            For example:
            - suggesting should be suggest
            - suggested should be suggest
            - balances should be balance
            Please ensure that all fields are filled for each vocabulary item. Process the following text to create the list:

            Rule 3: We don't need number
            - Ignore $23.75 billion
            - Ignore 2.5 million
            - Ignore 2.5
            - Ignore 2.5%
            - Ignore 2.5 percent
            - Ignore 2.5 percentage

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
                      description: "The word, phrasal verb, or phrase (e.g., verb, noun, adjective, adverb, preposition, conjunction, interjection, phrasal verb, idiom, proverb, slang). Ensure nouns are in singular form and verbs are in base form. Required"
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
                    level: {
                      type: "string",
                      description: "Level of the word or phrase. Level should be CEFR A1, A2, B1, B2, C1, C2"
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
              "level",
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


export async function getVocabsFromUrl({ id, url, transLangCode }) {
  console.log("getVocabsFromText", id, url)
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
            [Text from: ${url}]

            Please create a comprehensive JSON-formatted vocabulary list as much as possible from the url above. The list should include words, phrasal verbs, and phrases, but exclude proper nouns like names of people, places, or companies. Each vocabulary item from each sentence should have the following details:

            [word]: The word, phrasal verb, or phrase in its base form (e.g., 'suggesting' becomes 'suggest'). This is required.
            [pronounce]: The pronunciation of the word or phrase. This is required.
            [part of speech (POS)]: The part of speech of the word or phrase. This is required.
            [meaning]: The meaning of the word or phrase. This is required.
            [sentence]: The sentence from the content where the word or phrase is found. This is required.
            [example]: Additional examples of the word or phrase in use. This is required.
            [meaningInJapanese]: The Japanese translation of the word or phrase's meaning. Don't use sentence but should be a word This is required.
            
            Please ensure that all fields are filled for each vocabulary item. Process the following text to create the list:

            Please follow the following rules:
            
            Rule 1: Word can be combined word 
            For example:
            credit balances in credit balances. In this case, the word should be credit balances and not credit or balances.
            Debt level should be 'Debt Level' not debt and level


            Rule 2: Word should be singular for nouns and base form for verbs
            For example:
            - suggesting should be suggest
            - suggested should be suggest
            - balances should be balance
            Please ensure that all fields are filled for each vocabulary item. Process the following text to create the list:

            Rule 3: We don't need number
            - Ignore $23.75 billion
            - Ignore 2.5 million
            - Ignore 2.5
            - Ignore 2.5%
            - Ignore 2.5 percent
            - Ignore 2.5 percentage

            `
            //   content: `          
            //   You are an English teacher. Please give me a comprehensive list of vocabulary including words, phrasal verbs, and phrases extracted from the provided content. 
            //   The list should be formatted in JSON, with details for each vocabulary item from each sentence. 

            //   Don't include proper nouns, such as names of people, places, or companies.

            //   Here are the specifications for the list:
            //   - [word]: The word, phrasal verb, or phrase (e.g., verb, noun, adjective, adverb, preposition, conjunction, interjection, phrasal verb, idiom, proverb, slang). Ensure nouns are in singular form and verbs are in base form. 'suggesting' should be 'suggest'. 'suggested' should be 'suggest' Required
            //   - [pronounce]: The pronunciation of the word or phrase. Required
            //   - [part of speech (POS)]: The part of speech of the word or phrase. Required
            //   - [meaning]: The meaning of the word or phrase. Required
            //   - [sentence]: The sentence from the content where the word or phrase is found. Required
            //   - [example]: Additional examples of the word or phrase in use. Required
            //   - [meaningInJapanese]: The meaning of the word or phrase in Japanese. Required

            //   All of fields below are required.
            //   Please process the following text to create the list:

            //   Content:
            //   """"
            //   ${text}
            //   """
            // `
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
                      description: "The word, phrasal verb, or phrase (e.g., verb, noun, adjective, adverb, preposition, conjunction, interjection, phrasal verb, idiom, proverb, slang). Ensure nouns are in singular form and verbs are in base form. Required"
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