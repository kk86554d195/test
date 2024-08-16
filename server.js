const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const storeDataFile = path.join(__dirname, 'store_data.txt');
const profileDataFile = path.join(__dirname, 'profile_data.txt');

// 获取商店数据
app.get('/api/get-data', (req, res) => {
  fs.readFile(storeDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取商店数据文件:', err);
      res.status(500).send('无法读取商店数据文件-服务器错误');
      return;
    }

    const lines = data.trim().split('\n');
    const jsonData = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('JSON 解析错误:', e);
        return null;
      }
    }).filter(item => item !== null);

    res.status(200).json(jsonData);
  });
});

// 处理用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // 打印接收到的用户名和密码，帮助调试
  console.log('Received login request:', { username, password });

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('無法讀取用戶數據文件:', err);
      res.status(500).send('無法讀取用戶數據文件-伺服器錯誤');
      return;
    }

    console.log('讀取到的用戶數據文件內容:', data);

    let users;
    try {
      users = data.trim().split('\n').map(line => JSON.parse(line));
    } catch (parseErr) {
      console.error('解析用戶數據時出錯:', parseErr);
      res.status(500).send('解析用戶數據時出錯-伺服器錯誤');
      return;
    }

    console.log('解析後的用戶數據:', users);

    const user = users.find(user => user.username === username);

    if (!user) {
      console.error('用戶名不存在:', username);
      res.status(401).json({ success: false, message: '用戶名或密碼錯誤' });
      return;
    }

    if (user.password === password) {
      res.status(200).json({ success: true, memberName: user.memberName });
    } else {
      console.error('密碼錯誤:', password);
      res.status(401).json({ success: false, message: '用戶名或密碼錯誤' });
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
