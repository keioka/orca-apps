const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({ project: 'orca-398204', location: 'us-central1' });
const model = 'gemini-pro';


export async function getVocabsFromText({ id, text, transLangCode }) {
  // Instantiate the models
  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generation_config: {
      "max_output_tokens": 2048,
      "temperature": 0.9,
      "top_p": 1,
      "response_format": "json_object",
    },
  });

  const req = {
    contents: [
      {
        role: 'system',
        parts: [
          {
            text: `
            Please create a comprehensive JSON-formatted vocabulary list from the provided text. The list should include words, phrasal verbs, and phrases, but exclude proper nouns like names of people, places, or companies. Each vocabulary item from each sentence should have the following details:

            [word]: The word, phrasal verb, or phrase in its base form (e.g., 'suggesting' becomes 'suggest'). This is required.
            [pronounce]: The pronunciation of the word or phrase. This is required.
            [part of speech (POS)]: The part of speech of the word or phrase. This is required.
            [meaning]: The meaning of the word or phrase. This is required.
            [sentence]: The sentence from the content where the word or phrase is found. This is required.
            [example]: Additional examples of the word or phrase in use. This is required.
            [meaningInJapanese]: The Japanese translation of the word or phrase's meaning. This is required.
            
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
          }]
      }],
  };

  const response = await generativeModel.generateContent(req);

  return response
}

