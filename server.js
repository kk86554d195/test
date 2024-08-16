app.get('/api/get-data', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('無法讀取檔案:', err);
      res.status(500).send('伺服器錯誤');
      return;
    }
    
    // 將每一行資料解析成 JSON 格式
    const lines = data.trim().split('\n');
    const jsonData = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('JSON 解析錯誤:', e);
        return null;
      }
    }).filter(item => item !== null);
    
    // 直接返回解析後的 JSON 資料列表
    res.status(200).json(jsonData);
  });
});
