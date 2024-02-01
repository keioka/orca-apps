import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

export async function sample({ url, history, vocabularies }: { url: string, history: any[], vocabularies: any[] }) {

  const params = {
    model: 'gpt-3.5-turbo-1106',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `

         As an English teacher, please suggest 3 sample response to answer the last message from the AI using conversation history. 
         Use vocabulary from Saved vocabularies section as many as possible.
         Give me a sample sentence for the conversation and Japanese translation of the sentence.
         They should not be questions.
         They should not be too long.
         [Text from: ${url}]
          """"
          Last message from AI: ${history[history.length - 1].content}

          History: ${history}

          Saved vocabularies: ${vocabularies}
          """
          `
      }
    ],
    functions: [
      {
        name: "set_recipe",
        parameters: {
          type: "object",
          properties: {
            samples: {
              type: "array",
              items: {
                type: 'object',
                properties: {
                  sentence: {
                    type: "string",
                    description: "sample sentence for the conversation"
                  },
                  jaSentence: {
                    type: "string",
                    description: "Pronounce of the word or phrase"
                  },
                }
              }
            },
          },
        }
      }
    ],
    function_call: { name: "set_recipe" },
  }

  const completion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(
    params,
    {
      timeout: 60000,
    }
  );


  const generatedText = completion.choices[0].message.function_call.arguments;

  const result = JSON.parse(generatedText)

  if (!result || !result.samples) {
    return { err: 'No response from OpenAI' }
  }

  return result.samples

}
