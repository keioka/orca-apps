import OpenAI from 'openai';

const openaiAPI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface Params { urls: string[] }

export async function createArticle(params: Params, openai = openaiAPI) {
  if (!params.urls || params.urls.length === 0) {
    return { err: 'No urls provided' }
  }

  try {
    const prompt = `    
      As a writer, can you write a new article about these news below in markdown format.
      Choose some articles with the most interesting content.
      
      ${params.urls.map(url => `[Text from: ${url}]`).join('\n')}

      Requirements:
      - The article should be 500 words long
      - the article should be in markdown format
      - The article should have links for reference and citation for each paragraph
      - Do not copy the content from the given URLs
      - Do not use the same words from the given URLs
      - Do not use "I" or "We" in the article
      - Do not mention Highlight Digest in the article and title
      - Use different levels of vocabularies
      - Use different sentence structures
      - Use different sentence lengths
      - Use different paragraph lengths
      - Use different paragraph structures
      - Use different paragraph orders
      - Use different paragraph transitions
      - Use different paragraph connectors
      - Use different paragraph conjunctions
      - Use different paragraph prepositions
      - Use different paragraph pronouns
      - Use different paragraph adverbs
      - Use different paragraph adjectives
      - Use different paragraph verbs
    `

    console.log({
      prompt
    })
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature: 0,
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      functions: [{
        name: "set_recipe",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title"
            },
            content: {
              type: "string",
              description: "Content in markdown format"
            },
          }
        }
      }],
      function_call: { name: "set_recipe" }
    }, {
      timeout: 60000,
      maxRetries: 3
    });

    const generatedText = response.choices[0].message.function_call.arguments;

    console.log({ generatedText })
    const result = JSON.parse(generatedText)

    if (!result) {
      return { err: 'No response from OpenAI' }
    }

    console.log({
      result
    })

    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}