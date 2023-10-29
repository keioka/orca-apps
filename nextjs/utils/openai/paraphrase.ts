import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { sentence: string }

export async function getParaphrase(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          As an English teacher, Can you give me 5 paraphrases of this sentence

          """
          sentence: ${params.sentence}
          """
        `
      }
    ],
    functions: [{
      name: "set_recipe",
      parameters: {
        type: "object",
        properties: {
          phrases: {
            type: "array",
            items: {
              type: 'object',
              properties: {
                sentence: {
                  type: "string",
                  description: "sentence from the content"
                },
              }
            }
          }
        }
      }
    }],
    function_call: { name: "set_recipe" }
  });
  console.timeEnd('openai'); //Prints something like that-> test: 11374.004ms

  const generatedText = response.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText)

  if (!result || !result.phrases) {
    return { err: 'No response from OpenAI' }
  }

  return {
    phrases: result.phrases
  }

}
