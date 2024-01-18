import resp_model
from openai import OpenAI

client = OpenAI(api_key="<Your API Key>")
# default_prompt = "you are my python code generator, "

default_prompt="You have been working in a software development company for last 20 years. Your job now is to compose ** code for $$. Keep your replies concise, offering only the segment fit for inclusion in the code, omitting any explanatory details"

def open_ai_call(lang, instruction):
    completion = client.chat.completions.create( model="gpt-3.5-turbo", messages=[{"role": "user", "content": default_prompt.replace("**", lang).replace("$$", instruction)} ], max_tokens=100,) # response = completion.choices[0].message.content
    texts = completion.choices[0].message.content.split('\n') # texts = filter(lambda x: x.startswith("#")==False, texts)
    response = resp_model.model.copy()
    imports = []
    statements = []
    comments = []
   
    for msg in texts: 
      if msg.startswith("import"):  
         imports.append(msg) 
      elif msg.startswith("#"):  
         comments.append(msg) 
      elif msg.startswith('```'):  
         comments.append(msg) 
      else: statements.append(msg)
   
    response["imports"] = imports
    response["statements"] = statements
    response["comments"] = comments
    print(response) 
    return response