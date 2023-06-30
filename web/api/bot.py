from flask import Flask, Response, request
from chat.index import chat
app = Flask(__name__)

@app.route("/api/bot", methods=["POST"])
def bot():
  data = request.get_json()
  message = data["message"]
  return Response(chat(message), mimetype='text/event-stream')
