from fastapi import FastAPI, status, Response
import requests
from logger import AppLogger
from typing import Union
from fastapi.middleware.cors import CORSMiddleware

logger = AppLogger().get_logger()

app = FastAPI(title="api do ollama", description="api que contempla o ollama com o modelo da meta llama3.2:1b, isso é apenas um setup, não ha treinamento de modelos", version= "v.0.0.10")
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]  # You can also specify specific headers here if needed.
)

storage_response = []

@app.get("/ask", status_code=status.HTTP_201_CREATED) 
def ask(prompt: Union[str, int]):
    logger.info(f"This provides an unleashed model with the prompt: {prompt}")

    try:

        headers = {"Content-Type": "application/json"}
        res = requests.post(
            'http://0.0.0.0:11434/api/generate',
            json={"model": "llama3.2:1b", "prompt": prompt, "stream": False, "headers": headers},
            timeout=100
            )

        storage_response.append(res)
        
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        
        logger.error(f"Error while making a request to the model API: {e}")
        return Response(content=f"Error occurred: {e}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(content=res.text, media_type="application/json", status_code=status.HTTP_200_OK)

@app.get("/", status_code=status.HTTP_200_OK)
def health() -> dict:
    return{"title": {app.title}, "description":{app.description}, "version": {app.version}}    

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload= True)