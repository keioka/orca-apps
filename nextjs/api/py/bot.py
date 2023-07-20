from flask import Flask, Response, request
from langchain.document_loaders import PlaywrightURLLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.prompts import (
    ChatPromptTemplate,
    # MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import queue

API_KEY = "REDACTED_OPENAI_API_KEY"

def chat(message, chat_history_from_client, url):

  urls = [
    url,
  ]

  loader = PlaywrightURLLoader(urls=urls, remove_selectors=["header", "footer"])
  data = loader.load()

  text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
  documents = text_splitter.split_documents(data)

  q = queue.Queue()

  chatLLM = ChatOpenAI(
    temperature=0.1, 
    openai_api_key=API_KEY, 
    streaming=True,
    # callbacks=[CallbackHandler(q)],
  )

  memory = ConversationBufferMemory(return_messages=True, memory_key="chat_history")

  embeddings = OpenAIEmbeddings(
    openai_api_key=API_KEY, 
  )

  vectorstore = Chroma.from_documents(documents, embeddings)

  prompt = ChatPromptTemplate.from_messages([
      SystemMessagePromptTemplate.from_template(
          """
          You are an English teacher. Your name is Erika. You are talking to a student who is learning English. Don't say As an AI language model, I don't have a personal name.

          Use the following pieces of news article context to ask and answer the users question and chat history.
          
          Please answer user's question as a teacher or answer with some reaction in very short sentence and always ask a question about the following context at the end of what you say and let the student answer it.
          
          If the user asks you a question or comments related to the context, please answer it with reaction in simple way and ask a question about the following context at the end of what you say and let the student answer it.
          
          Please don't answer and reply with more than 4 sentences. Keep it short and simple.
          
          Don't talk too much
          ----------------
          {context}
        
          ----------------
          {chat_history}
        """
      ),
      HumanMessagePromptTemplate.from_template("{question}")
  ])
    
  qa = ConversationalRetrievalChain.from_llm(
    chatLLM, 
    vectorstore.as_retriever(), 
    memory=memory, 
    verbose=True,
    combine_docs_chain_kwargs={'prompt': prompt}
  )
  
  response = qa({ "question": message })
  
  return response["answer"]



app = Flask(__name__)

@app.route("/api/bot", methods=["POST"])
def bot():
  data = request.get_json()
  message = data["message"]
  history = data["history"]
  url = data["url"]

  return Response(chat(message, history, url), mimetype='text/event-stream')
