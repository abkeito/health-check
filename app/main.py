from fastapi import FastAPI
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from typing import AsyncGenerator
import asyncio
import time
import requests
import random

app = FastAPI()

# ESP8266のIPアドレスとポート番号
esp_ip = "157.82.202.11"
esp_port = 80

def get_random_number():
    """ESP8266からランダムなデータ（タイムスタンプと心拍数）を取得"""
    url = f"http://{esp_ip}:{esp_port}/"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.text.strip()
        else:
            return f"Failed to connect. Status code: {response.status_code}"
    except requests.exceptions.RequestException as e:
        return f"An error occurred: {e}"

async def event_stream() -> AsyncGenerator[str, None]:
    """1秒ごとにESP8266からデータを取得し、クライアントにストリーム送信"""
    while True:
        #data = get_random_number()
        data = str(random.randint(60, 100))
        yield f"data: {data}\n\n"
        await asyncio.sleep(1)

@app.get("/")
async def index():
    """クライアントにHTMLページを返す"""
    with open("templates/index.html", "r") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.get("/events")
async def stream():
    """ESP8266からのデータをクライアントにストリームする"""
    return StreamingResponse(event_stream(), media_type="text/event-stream")

# 静的ファイルの設定
app.mount("/static", StaticFiles(directory="static"), name="static")