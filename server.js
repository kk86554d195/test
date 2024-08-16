const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();  // 初始化 Express 應用

const dataFile = path.join(__dirname, 'data.txt');  // 設定檔案路徑
const cors = require('cors');
app.use(cors());
app.get('/api/get-data', (req, res) => {
  console.log('嘗試讀取檔案:', dataFile);

  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('無法讀取檔案:', err);
      res.status(500).send('伺服器錯誤');
      return;
    }

    console.log('檔案讀取成功');

    const lines = data.trim().split('\n');
    const jsonData = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('JSON 解析錯誤:', e);
        return null;
      }
    }).filter(item => item !== null);

    res.status(200).json(jsonData);
  });
});

const PORT = process.env.PORT || 8080;  // 設定伺服器的端口

app.listen(PORT, () => {
  console.log(`伺服器正在運行在端口 ${PORT}`);
});
