from fastapi import FastAPI, status, Response
import requests
from logger import AppLogger
from pydantic import BaseModel
from typing import Union

logger = AppLogger().get_logger()

app = FastAPI()

class Prompt(BaseModel):
    prompt: Union[str, int] = None

@app.get('/')
async def root():
    return {'message': 'Welcome to the FastAPI application!'}

@app.get("/ask", response_model= Prompt, status_code=status.HTTP_201_CREATED) 
def ask(prompt: str) -> Prompt:
    logger.info(f"This provides an unleashed model with the prompt: {prompt}")

    try:

        headers = {"Content-Type": "application/json"}
        res = requests.post(
            'http://127.0.0.1:11434/api/generate',
            json={"model": "llama3.2:1b", "prompt": prompt, "stream": False},
            headers=headers,
            timeout=20
            )
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        
        logger.error(f"Error while making a request to the model API: {e}")
        return Response(content=f"Error occurred: {e}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(content=res.text, media_type="application/json", status_code=status.HTTP_200_OK)
