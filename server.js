const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());  // 解析 JSON 请求

const storeDataFile = path.join(__dirname, 'store_data.txt'); // 商店数据文件路径
const profileDataFile = path.join(__dirname, 'profile_data.txt'); // 用户数据文件路径

// 获取商店数据
app.get('/api/get-data', (req, res) => {
  fs.readFile(storeDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取商店数据文件:', err);
      res.status(500).send('服务器错误');
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

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取用户数据文件:', err);
      res.status(500).send('服务器错误');
      return;
    }

    const users = data.trim().split('\n').map(line => JSON.parse(line));
    const user = users.find(user => user.username === username);

    if (user && user.password === password) {
      res.status(200).json({ success: true, username: user.username });
    } else {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
