import * as functions from "firebase-functions";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";
import { loadQAStuffChain, loadQAMapReduceChain } from "langchain/chains";

import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";

export const chat = async (req, res) => {
  try {
    console.log(functions.config());

    const model = new ChatOpenAI({
      temperature: 0.9,
      openAIApiKey: functions.config().openai_api_key,
    });


    const chain = loadQAStuffChain(llm);

    // const template = "What is a good name for a company that makes {product}?";
    // const promptA = new PromptTemplate({ template, inputVariables: ["product"] });
    // const responseA = await promptA.format({ product: "colorful socks" });

    const loader = new PlaywrightWebBaseLoader("https://www.bbc.com/news/live/world-europe-65686238");
    const doc = await loader.load();

    // Pass in a list of messages to `call` to start a conversation. In this simple example, we only pass in one message.
    // const response = await chat.call([
    //   {
    //     input_documents: docs,
    //   },
    //   new HumanChatMessage(
    //     "What is a good name for a company that makes colorful socks?"
    //   ),
    // ]);

    const response = await chain.call({
      input_documents: [doc],
      question: "Did erdogan win",
    });

    res.send({ message: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
};
