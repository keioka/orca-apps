import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

export async function chat({ url, history, message }: { url: string, history: any[], message: string }) {
  // console.log("/api/chat")
  // const { url, history = [], message, lessonId } = req.body;

  // let lessonUrl = url;
  // if (lessonId) {
  //   const lesson = await getLesson(lessonId)
  //   lessonUrl = lesson?.material.url ?? url;
  //   console.log({ lesson })
  // }

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `
          [Text from: ${url}]
          
          You are an English teacher, in a conversation with a student learning English. Use a brief and simple dialogue, answering the student's questions with no more than four sentences, and always including an open-ended like (why, how, what) question related to the provided news article context.
          
          React to the student's questions and comments in a straightforward manner and encourage them to respond to your context-related inquiries.
          
          Avoid excessive elaboration, and remember to keep the conversation focused on the news article context.
          
          Please always include an open-ended like (why, how, what) question related to the provided news article context.
          
          Please facilitate the conversation by asking concrete questions about the article and encouraging the student to respond to your context-related inquiries.

          You should not speak more than 3 sentences at a time.

          You should not ask more than 1 question at a time.
          """
          Conversation History: 
            ${history.map((item) => {
          return `- ${item.type}: ${item.content}`
        }).join('\n')}
        `
      },
      { role: 'user', content: message }
    ],
    model: 'gpt-4-0125-preview'
  };
  const completion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);

  return completion.choices[0].message.content;

}
