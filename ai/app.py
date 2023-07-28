from flask import Flask, Response, request, g, jsonify
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
from db import add_message, get_messages_by_lesson_id, get_lesson_and_material_by_id
from validate import validate_token

from prisma import Client
from langchain.document_loaders import WebBaseLoader
import firebase_admin
from firebase_admin import credentials
from langchain.document_loaders import YoutubeLoader
import time
import os

# Initialize the Prisma Client

API_KEY = "REDACTED_OPENAI_API_KEY"

async def chat(message, lesson_id, user_id=None):
  start_time = time.time()
  
  urls=[]
  prisma = Client()
  await prisma.connect()
  history = await get_messages_by_lesson_id(prisma, lesson_id)
  lesson = await get_lesson_and_material_by_id(prisma, lesson_id)

  loader_load_time = time.time()
  print(f"Time to get all info': {loader_load_time - start_time} seconds")
  await add_message(prisma, lesson_id, message, type="user", created_by_id=user_id)
  
  add_message_time = time.time()
  print(f"Time to add new message': {add_message_time - loader_load_time} seconds")

  if lesson.material.type != "video":
    url = lesson.material.url.replace("watch?v=", "embed/")
    loader = YoutubeLoader.from_youtube_url(url, add_video_info=True)
    data = loader.load()
  else:
    url = lesson.material.url
    loader = WebBaseLoader(url)
    data = loader.load()
  
  text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
  documents = text_splitter.split_documents(data)

  loader_doc_time = time.time()
  print(f"Time to load doc': {loader_doc_time - add_message_time} seconds")

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

  vectorstore_time = time.time()
  print(f"Time to store vector': {vectorstore_time - loader_doc_time} seconds")

  history_all = ""
  
  for messageInfo in history:
    role = "Human" if messageInfo.type == "user" else "AI"
    history_all += f"""
    {role}: {messageInfo.fullContent}
  """
  
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
        """ + f"""
        {history_all}
        """
      ),
      HumanMessagePromptTemplate.from_template("{question}")
  ])
    
    
  print(prompt)
  
  qa = ConversationalRetrievalChain.from_llm(
    chatLLM, 
    vectorstore.as_retriever(), 
    memory=memory, 
    verbose=True,
    combine_docs_chain_kwargs={'prompt': prompt}
  )
  
  response = qa({ "question": message })
  
  response_time = time.time()
  print(f"Time to response': {response_time - vectorstore_time} seconds")
  answer = response["answer"]
  
  await add_message(prisma, lesson_id, answer, type="ai")

  return answer


# def firebaseInit(): 
#   cred = credentials.Certificate("./serviceAccountKey.json")
#   firebase_admin.initialize_app(cred)
  
def firebaseInit():
  # Fetch the environment variable
  env = os.getenv('ENV', 'dev')  # Default to 'dev' if ENV is not set

  # Map environment to respective JSON file
  env_to_json = {
      'dev': './devServiceAccountKey.json',
      'prod': './prodServiceAccountKey.json'
  }

  # Throw error if environment is not recognized
  if env not in env_to_json:
    raise ValueError(f'Unrecognized environment {env}')

  # Choose the JSON file based on environment
  json_file = env_to_json[env]

  # Initialize Firebase
  cred = credentials.Certificate(json_file)
  firebase_admin.initialize_app(cred)

firebaseInit()
app = Flask(__name__)

@app.route("/api/chat", methods=["POST"])
async def bot():
  data = request.get_json()
  message = data["message"]
  lesson_id = data["lessonId"]
  
  try:
    validate_token(request)
  except Exception as error:
    print(f'Error validating Firebase token: {error}')
    return jsonify(error=f'Invalid Token: {error}'), 403
      

  print(g.current_user)
  
  return Response(await chat(message, lesson_id, g.current_user['id']), mimetype='text/event-stream')
