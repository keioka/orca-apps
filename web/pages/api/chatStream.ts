// import { ChatOpenAI } from "langchain/chat_models";
import { NextResponse } from "next/server";
import { Document } from 'langchain/document';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import puppeteer from 'puppeteer';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";

// import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
// import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
// import { PlaywrightWebBaseLoader } from '../../utils/WebLoader';
// import * as cheerio from "langchain/document_loaders/web/cheerio";
// import type { LaunchOptions, Page, Browser, BrowserType } from "playwright";
// import { chromium } from "playwright";

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

// console.log({
//   chromium
// })

// async function scrape(
//   url: string,
//   options?: {
//     launchOptions?: LaunchOptions;
//     evaluate?: PlaywrightEvaluate;
//     gotoOptions?: {
//       referer?: string;
//       timeout?: number;
//       waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
//     };
//   }
// ): Promise<string> {
//   const browser = await chromium.launch({
//     headless: true,
//     ...options?.launchOptions,
//   });
//   const page = await browser.newPage();

//   console.log({ page })
//   await page.goto(url, {
//     timeout: 180000,
//     waitUntil: "domcontentloaded",
//     ...options?.gotoOptions,
//   });

//   const bodyHTML = options?.evaluate
//     ? await options?.evaluate(page, browser)
//     : await page.content();

//   await browser.close();

//   return bodyHTML;
// }

async function scrape(url: string) {
  console.log({ url })

  const api = `https://lexper.p.rapidapi.com/v1.1/extract?url=${url}&js_timeout=30&media=true`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'REDACTED_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'lexper.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(api, options);
    const result = await response.json();
    return result.article.text;
  } catch (error) {
    console.error(error);
  }
}


// async function scrape(
//   url: string,
// ): Promise<string> {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(url);

//   await browser.close();
// }

const qaPrompt = `
  You are an English teacher. The following are exerpts from conversations with an AI
  English tutor. The tutor asks questions about the context. Start conversation and ask me question first
`

// "You are an English teacher. Ask questions based on the context to provide conversational answer without any prior knowledge."

export default async function handler(req, res) {
  const body = await req.json()
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

    const text = await scrape("https://www.bbc.com/news/uk-65746524")
    // const loader = new PlaywrightWebBaseLoader("https://www.bbc.com/news/uk-65746524");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });

    const docs = await textSplitter.createDocuments([text]);

    // const docs = [new Document({ pageContent: text, metadata: { url: "" } })];

    const chatLLM = new ChatOpenAI({
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

    // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    //   SystemMessagePromptTemplate.fromTemplate(
    //     "You are an English teacher. Asking questions as many as possible one by one"
    //   ),
    //   HumanMessagePromptTemplate.fromTemplate("{input}"),
    // ]);

    const store = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY }));
    // const model = new OpenAI({ openAIApiKey: env.OPENAI_API_KEY });
    // const chain = RetrievalQAChain.fromLLM(llm, store.asRetriever());
    console.log({
      docs,
      a: store.asRetriever()
    })

    let chain = ConversationalRetrievalQAChain.fromLLM(
      chatLLM,
      store.asRetriever(),
      {
        questionGeneratorTemplate: qaPrompt,
        qaTemplate: qaPrompt,
        returnSourceDocuments: true
      }
    );

    // const chain = new LLMChain({
    //   prompt: chatPrompt,
    //   llm: llm,
    // });

    // new LLMChain({
    //   prompt: chatPrompt,
    //   llm: llm,
    // });

    // const chain = new LLMChain({ prompt, llm });
    // chain.call({ query: query }).catch(console.error);

    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.





    chain
      .call({
        question: body.question,
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