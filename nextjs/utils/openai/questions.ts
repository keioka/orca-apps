import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

export async function questions({ text }: { text: string }) {

  const params = {
    model: 'gpt-3.5-turbo-1106',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `

         As an English teacher, please create 3 open-ended questions for English Learners about the content provided below. 
         Give me 3 questions and Japanese translation of the questions.
         They should not be too long and be just one sentence.

         """"
         content: ${text}
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
            questions: {
              type: "array",
              items: {
                type: 'object',
                properties: {
                  question: {
                    type: "string",
                    description: "question for English Learners"
                  },
                  jaQuestion: {
                    type: "string",
                    description: "Japanese translation of the question"
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

  if (!result || !result.questions) {
    return { err: 'No response from OpenAI' }
  }

  return result.questions

}
