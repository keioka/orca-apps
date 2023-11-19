import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "@/trigger";
import { OpenAI } from "@trigger.dev/openai";
import { getMaterialById, createVocabs } from '@/models/material';
import { parseWebText } from '@/utils/webParser';
import { capitalize } from 'lodash';


const langName = {
  'ja': 'Japanese',
  'en': 'English',
  'vi': 'Vietnamese',
}

const openai = new OpenAI({
  id: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
});

client.defineJob({
  id: "openai.createVocab",
  name: "OpenAI Tasks",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "openai.createVocab",
  }),
  integrations: {
    openai,
  },
  run: async (payload, io, ctx) => {
    //this background function can take longer than a serverless timeout
    const { materialId, url, transLangCode } = payload
    await io.logger.info(`createVocabsFromUrl start ${materialId}`);

    try {
      let text
      if (url) {
        text = await parseWebText(url)
      } else if (materialId) {
        const material = await getMaterialById(materialId)
        if (!material) {
          throw new Error('Material not found')
        }
        text = await parseWebText(material.url)
      }

      if (!text) {
        console.error("Missing text");
        throw new Error('Failed to parse text')
      }

      const cleanedText = text.replace(/\s+/g, ' ').trim()
      const splitContent = splitTextBySentenceWithWordCount(cleanedText, 125)
      const transLangCodeCap = capitalize(transLangCode)

      // ================ getVocabsFromText =======================
      async function getVocabsFromText({ id, text, transLangCode }) {
        const response = await io.openai.backgroundCreateChatCompletion(
          `background-chat-completion-${id}`,
          {
            model: 'gpt-4-1106-preview',
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
          - [meaningIn${langName[transLangCode.toLowerCase()]}]: Meaning of the word or phrase in Japanese
          - [example]: Give some examples of the word or phrase
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
                }
              }
            }],
            function_call: { name: "set_recipe" }
          }, {
          timeout: 60000,
        });

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
      // ================ getVocabsFromText =======================


      return await Promise.all(splitContent.map(async (content, index) => {
        const { vocabs } = await getVocabsFromText({
          id: `${materialId}_${index}`,
          text: content.replace(/\s+/g, ' ').trim(),
          transLangCode: transLangCodeCap
        })

        const mappedVocabs = vocabs.map((vocab) => {
          return {
            ...vocab,
            translation: vocab[`meaningIn${langName[transLangCode.toLowerCase()]}`],
            langCode: transLangCode
          }
        })

        await createVocabs({
          vocabParams: mappedVocabs,
          materialId
        })
        console.log("createVocabsFromUrl end", materialId);

        return mappedVocabs
      }))


    } catch (error) {
      console.error(error);
    }
  }
});


function splitTextBySentenceWithWordCount(text: string, count: number): string[] {
  const regex = /([.?!])\s*/; // Regex to split by delimiters and capture them
  const sentences = text.split(regex);
  const splitSentences: string[] = [];
  let currentContent = '';
  let wordCount = 0;

  for (let i = 0; i < sentences.length; i += 2) { // Increment by 2 to skip delimiters
    const sentence = sentences[i] + (sentences[i + 1] || ''); // Combine sentence with its delimiter
    const currentSentenceWordCount = sentence.split(/\s+/).filter(Boolean).length; // Get the number of words in the current sentence

    if ((wordCount + currentSentenceWordCount) > count) {
      splitSentences.push(currentContent.trim());
      currentContent = sentence;
      wordCount = currentSentenceWordCount;
    } else {
      currentContent += ' ' + sentence;
      wordCount += currentSentenceWordCount;
    }
  }

  if (currentContent) {
    splitSentences.push(currentContent.trim());
  }

  return splitSentences;
}

