document.addEventListener('DOMContentLoaded', function() {
    const dataContainer = document.getElementById('heart-rate');
    const ctx = document.getElementById('heartRateChart').getContext('2d');

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

    // グラフの設定
    const heartRateChart = new Chart(ctx, {
        type: 'line',
        data: heartRateData,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (mm:ss)'
                    },
                    type: 'time',
                    time: {
                        parser: 'mm:ss',
                        unit: 'minute',
                        displayFormats: {
                            'minute': 'mm:ss'
                        }
                    }
                }],
                y: {
                    min: 0
                }
            }
        }
    });

    // CSVデータの取得とパース
    function fetchCsvData() {
        fetch('/static/heart_rate_data.csv') // CSVファイルのパスを指定
            .then(response => {
                if (!response.ok) {
                    throw new Error("CSV file could not be fetched.");
                }
                return response.text(); // テキスト形式で読み込む
            })
            .then(csvText => {
                const parsedData = parseCsv(csvText); // CSVをパース
                updateChart(parsedData); // グラフを更新
            })
            .catch(error => {
                console.error("Error fetching or parsing CSV:", error);
                dataContainer.innerHTML = "<p>Error loading data...</p>";
            });
    }

    // CSVをパースしてデータを返す
    function parseCsv(csvText) {
        const rows = csvText.split('\n'); // 改行で分割
        const data = rows.map(row => {
            const [minute, second, bpm] = row.split(','); // カンマ区切り
            return {
                time: `${minute}:${second}`, // 時間のフォーマット
                bpm: parseInt(bpm, 10) // BPMを整数に変換
            };
        });
        return data.filter(item => !isNaN(item.bpm)); // 不正なデータを除外
    }

    // グラフを更新
    function updateChart(data) {
        // グラフデータをリセット
        heartRateChart.data.labels = [];
        heartRateChart.data.datasets[0].data = [];

        // 最後の60個のデータを使用
        const MAX_DATA_POINTS = 10;
        const dataToDisplay = data.slice(-MAX_DATA_POINTS); // データの最後の60個を取得

        // 最新の10個のデータを取得
        const last10Data = dataToDisplay.slice(-10); // 最後の10個のデータを取得

        // 最新の10個のBPMの平均を計算
        const averageBPM = last10Data.reduce((sum, item) => sum + item.bpm, 0) / last10Data.length;
        
        // data-containerに最新のBPMを表示
        const dataContainer = document.getElementById('heart-rate');
        dataContainer.innerHTML = `<p>心拍数: ${averageBPM.toFixed(2)} bpm</p>`; // 平均値を表示

        console.log(dataToDisplay);
        // 新しいデータをグラフに追加
        dataToDisplay.forEach(item => {
            heartRateChart.data.labels.push(item.time); // 時間をラベルに追加
            heartRateChart.data.datasets[0].data.push(item.bpm); // BPMデータを追加
        });

        // グラフを更新
        heartRateChart.update();
    }

    // 初回のCSVデータ読み込み
    fetchCsvData();

    // 定期的にCSVデータを再取得する（例えば1秒ごとに）
    setInterval(fetchCsvData, 10*1000); // 1000ミリ秒（1秒）ごとに更新
});