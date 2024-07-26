import time
import os
import queue
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
from langchain.chains import LLMChain
from chat.callback import ThreadedGenerator, StreamingResponseCallbackHandler

from langchain.chains.summarize import load_summarize_chain
from db import add_message, get_messages_by_lesson_id, get_lesson_and_material_by_id
from prisma import Client
from langchain.document_loaders import WebBaseLoader, YoutubeLoader
import firebase_admin
from firebase_admin import credentials
from validate import validate_token

# Initialize the Prisma Client

API_KEY = os.environ["OPENAI_API_KEY"]

async def chat(message, lesson_id, user_id=None):
  print(">>>>>>>>>>> chat <<<<<<<<<<<<<<<<")
  DATABASE_URL = os.getenv('DATABASE_URL')  # Default to 'dev' if ENV is not set  
  start_time = time.time()
    
  prisma = Client()
  await prisma.connect()
  
  try: 
    history = await get_messages_by_lesson_id(prisma, lesson_id)
    lesson = await get_lesson_and_material_by_id(prisma, lesson_id)

    loader_load_time = time.time()
    print(f"Time to get all info': {loader_load_time - start_time} seconds")
    await add_message(prisma, lesson_id, message, type="user", created_by_id=user_id)
    
    add_message_time = time.time()
    print(f"Time to add new message': {add_message_time - loader_load_time} seconds")

    if lesson.material.type == "video":
      print(">>>>>>>>>>> video <<<<<<<<<<<<<<<<")
      url = lesson.material.url.replace("watch?v=", "embed/")
      loader = YoutubeLoader.from_youtube_url(url, add_video_info=False)
      data = loader.load()
    else:
      url = lesson.material.url
      loader = WebBaseLoader(url)
      data = loader.load()
    
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    documents = text_splitter.split_documents(data)

    loader_doc_time = time.time()
    print(f"Time to load doc': {loader_doc_time - add_message_time} seconds")

    # q = queue.Queue()

    chatLLM = ChatOpenAI(
      temperature=0.1, 
      openai_api_key=API_KEY, 
      streaming=True,
      # callbacks=[StreamingResponseCallbackHandler(q)],
    )
    
    
    chain = load_summarize_chain(chatLLM, chain_type="refine")
    
    # summary_chain = load_summarize_chain(chatLLM, chain_type="map_reduce")
    # promptSubject = PromptTemplate(
    #   input_variables=["text"], 
    #   template="""
    #     \"\"\"{text}\"\"\"\
    #     上記のテーマのは以下の通り：\n\n* 
    #   """
    # )
    # chainSubject = LLMChain(llm=llm, prompt=promptSubject)

    # overall_chain_map_reduce = SimpleSequentialChain(chains=[summary_chain, chainSubject])

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
          You are an English teacher, in a conversation with a student learning English. Use a brief and simple dialogue, answering the student's questions with no more than four sentences, and always including an open-ended like (why, how, what) question related to the provided news article context.

          React to the student's questions and comments in a straightforward manner and encourage them to respond to your context-related inquiries.

          Avoid excessive elaboration, and remember to keep the conversation focused on the news article context.
          
          Please always include an open-ended like (why, how, what) question related to the provided news article context.
          
          Please facilitate the conversation by asking questions and encouraging the student to respond to your context-related inquiries.
          
          Also add Japanese translation of your English sentence.
          ----------------
          {context}
          
          ----------------
          """ + f"""
          {history_all}
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
    
    print(qa)
    
    response = qa({ "question": message })
    
    response_time = time.time()
    print(f"Time to response': {response_time - vectorstore_time} seconds")
    answer = response["answer"]
    
    await add_message(prisma, lesson_id, answer, type="ai")
    
    return answer
  
  except Exception as e:
    print("------------------ Error ---------------")
    print(e)
    raise e
  finally:
    await prisma.disconnect()
    


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
    return jsonify(message=f'Firebase token error > {error}', status=401), 401
  
  try:
    result = await chat(message, lesson_id, g.current_user['id'])
    return Response(result, mimetype='text/event-stream')
  except Exception as error:
    print(f'Error chat: {error}')
    print("dddddd")
    return jsonify(message=f'Chat error > {error}', status=500), 500
  
