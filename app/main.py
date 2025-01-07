from fastapi import FastAPI
from pydantic import BaseModel
import csv
import uvicorn
import os
from datetime import datetime

app = FastAPI()

# CSVファイルのヘッダを最初に書き込んでおく（1回だけ実行する）
def init_csv():
    directory = 'static'
    file_path = os.path.join(directory, 'heart_rate_data.csv')

    # 'static' フォルダが存在しない場合は作成する
    if not os.path.exists(directory):
        os.makedirs(directory)

    # 既存のCSVファイルが存在すれば削除して新しく作成
    if os.path.exists(file_path):
        os.remove(file_path)  # ファイルを削除
    
    try:
        # 新しいファイルを作成してヘッダーを書き込む
        with open(file_path, mode='w', newline='') as file:  # 'w' modeで書き込む
            writer = csv.writer(file)
            writer.writerow(['Minute', 'Second', 'BPM'])  # CSVのヘッダ
        print(f"CSV file created with header: {file_path}")
    except Exception as e:
        print(f"Error initializing CSV: {e}")

# 心拍数データの受信モデル
class HeartRateData(BaseModel):
    bpm: int
    time: int

# POSTエンドポイントでデータを受け取る
@app.post("/data")
async def receive_data(data: HeartRateData):
    bpm = data.bpm
    timestamp = data.time
    
    # タイムスタンプを秒単位で取得
    current_time = datetime.now()  # 現在の時刻を取得
    minute = current_time.minute
    second = current_time.second
    
    # CSVファイルにデータを追加
    file_path = os.path.join('static', 'heart_rate_data.csv')
    with open(file_path, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([minute, second, bpm])  # CSVにMinute, Second, BPMを記録
    
    print(f"Received data - Minute: {minute}, Second: {second}, BPM: {bpm}")
    return {"message": "Data received"}  # クライアントに確認メッセージを返す


if __name__ == '__main__':
    print("Starting server...")
    init_csv()  # サーバ起動時にCSVファイルを初期化
    print("CSV file initialized")
    uvicorn.run(app, host="0.0.0.0", port=8080)  # すべてのIPからアクセス可能にする
