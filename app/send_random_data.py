import asyncio
import websockets
import random
import json
import time

async def send_random_data():
    uri = "ws://localhost:8000/ws"  # サーバーのWebSocketエンドポイント
    async with websockets.connect(uri) as websocket:
        while True:
            # ランダムなデータを生成
            data = {
                "timestamp": round(time.time(), 2),  # タイムスタンプ
                "heartbeat": random.randint(60, 100),  # 心拍数（例: 60～100の範囲）
                "acceleration": {
                    "x": round(random.uniform(-1.0, 1.0), 2),
                    "y": round(random.uniform(-1.0, 1.0), 2),
                    "z": round(random.uniform(-9.8, 9.8), 2),
                },
                "message": random.choice(["Normal", "Warning", "Critical"]),
            }
            # JSON形式でデータを送信
            await websocket.send(json.dumps(data))
            print(f"Sent: {data}")
            
            # 必要に応じてサーバーからの応答を受信
            response = await websocket.recv()
            print(f"Received: {response}")
            
            # 1秒待機して次のデータを送信
            await asyncio.sleep(1)

# イベントループを起動
if __name__ == "__main__":
    asyncio.run(send_random_data())

