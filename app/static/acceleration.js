document.addEventListener('DOMContentLoaded', function() {
    const dataContainer = document.getElementById('acceleration');
    const ctx = document.getElementById('accelerationChart').getContext('2d');
    
    // 初期データ
    let heartRateData = {
        labels: [],
        datasets: [{
            label: 'Heart Rate',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            fill: false,
            tension: 0.1
        }]
    };

    // 最大データ数
    const MAX_DATA_POINTS = 60;
    const MAX_REMOVE_POINTS = 20; // 10個ずつ削除

    // グラフの設定
    const heartRateChart = new Chart(ctx, {
        type: 'line',
        data: heartRateData,
        options: {
            responsive: false, // リサイズに対応
            maintainAspectRatio: false, // アスペクト比を維持しない
            scales: {
                //X軸
                xAxes: [{
                    //軸ラベル表示
                    scaleLabel: {
                        display: true,
                        labelString: '分'
                    },
                    //ここで軸を時間を設定する
                    type: 'time',
                    time: {
                        parser: 'mm:ss',
                        unit: 'minute',
                        displayFormats: {
                            'minute': 'mm:ss'
                        }
                    },
                }],
                y: {
                    min: 0
                }
            }
        }
    });

    // EventSourceを使ってストリーミングデータを受け取る
    const eventSource = new EventSource('/events');

    eventSource.onmessage = function(event) {
        const data = parseInt(event.data); // 受け取ったデータ（心拍数）
        
        // データが正しい場合、グラフを更新
        if (!isNaN(data)) {
            // 最新の心拍数を表示
            dataContainer.innerHTML = `<p>運動量: ${data}</p>`;

            // グラフのデータを更新
            const currentTime = new Date(); // Dateオブジェクトを使って現在時刻を取得
            const formattedTime = `${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
            
            // グラフのデータを追加
            heartRateChart.data.labels.push(formattedTime); // 時間ラベルを追加
            heartRateChart.data.datasets[0].data.push(data);

            // 最大20個を超えた場合、10個ずつ削除
            if (heartRateChart.data.labels.length > MAX_DATA_POINTS) {
                heartRateChart.data.labels.splice(0, MAX_REMOVE_POINTS); // 最初の10個を削除
                heartRateChart.data.datasets[0].data.splice(0, MAX_REMOVE_POINTS); // 最初の10個のデータを削除
            }

            // グラフの表示を更新
            heartRateChart.update();
        }
    };

    eventSource.onerror = function() {
        dataContainer.innerHTML = "<p>Error connecting to server...</p>";
    };
});