document.addEventListener('DOMContentLoaded', function() {
    const dataContainer = document.getElementById('data-container');
    
    // EventSourceを使ってストリーミングデータを受け取る
    const eventSource = new EventSource('/events');
    
    // データを受け取ったときの処理
    eventSource.onmessage = function(event) {
        const data = event.data;
        dataContainer.innerHTML = `<p>Received Data: ${data}</p>`;
    };
    
    // 接続エラーが発生した場合
    eventSource.onerror = function() {
        dataContainer.innerHTML = "<p>Error connecting to server...</p>";
    };
});