const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const dataFile = 'data.txt';

app.post('/api/send-data', (req, res) => {
  const receivedData = req.body.data;
  
  // 獲取當前時間
  const currentTime = new Date().toLocaleString(); 
  
  // 將資料與當前時間結合
  const modifiedData = `${receivedData} ${currentTime}`;
  
  // 將資料記錄到檔案中
  fs.appendFile(dataFile, modifiedData + '\n', (err) => {
    if (err) {
      console.error('無法寫入檔案:', err);
      res.status(500).send('伺服器錯誤');
      return;
    }
    
    console.log('資料已記錄:', modifiedData);
    res.status(200).send({ modifiedData: modifiedData });
  });
});

app.get('/api/get-data', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('無法讀取檔案:', err);
      res.status(500).send('伺服器錯誤');
      return;
    }
    
    // 將檔案中的資料返回給前端
    const lines = data.trim().split('\n');
    res.status(200).send({ data: lines });
  });
});

app.listen(3000, () => {
  console.log('伺服器正在3000端口運行');
});
