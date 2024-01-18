from flask import Flask, request, session
from flask_cors import CORS, cross_origin
import serv

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/qd/<lang>')
@cross_origin(supports_credentials=True)
def index(lang):
   response = serv.open_ai_call(lang, request.args.get('instruct'))
   return response