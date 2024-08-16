app.get('/api/get-data', (req, res) => {
  const path = require('path');
  const dataFile = path.join(__dirname, 'data.txt');

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
