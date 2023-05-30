// import { ChatOpenAI } from "langchain/chat_models";
import { NextResponse } from "next/server";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
// import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
// import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
// import { PlaywrightWebBaseLoader } from '../../utils/WebLoader';
// import * as cheerio from "langchain/document_loaders/web/cheerio";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "edge",
  unstable_allowDynamic: [
    './node_modules/langchain/**',
    './node_modules/playwright/**',
  ],
};

export default async function handler(req, res) {
  const body = await req.json()

  console.log('body', body)
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined.");
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();


    // const loader = new PuppeteerWebBaseLoader("https://www.bbc.com/news/uk-65746524", {
    //   launchOptions: {
    //     headless: true,
    //   },
    //   gotoOptions: {
    //     waitUntil: "domcontentloaded",
    //   },
    // });
    // const loader = new PlaywrightWebBaseLoader("https://www.bbc.com/news/uk-65746524");
    // const docs = await loader.load();

    const llm = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      temperature: 0.9,
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: async (token) => {
          await writer.ready;
          await writer.write(encoder.encode(`${token}`));
        },
        handleLLMEnd: async () => {
          await writer.ready;
          await writer.close();
        },
        handleLLMError: async (e) => {
          await writer.ready;
          await writer.abort(e);
        },
      }),
    });

    // const chain = new LLMChain({ prompt, llm });
    // chain.call({ query: query }).catch(console.error);

    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a helpful assistant that answers questions as best you can."
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = new LLMChain({
      prompt: chatPrompt,
      llm: llm,
    });


    chain
      .call({
        // input_documents: docs,
        input: body.question,
        chat_history: body.history
      })
      .catch(console.error);

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}