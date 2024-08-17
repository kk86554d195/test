const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const storeDataFile = path.join(__dirname, 'store_data.txt');
const profileDataFile = path.join(__dirname, 'profile_data.txt');
const reviewsDataFile = path.join(__dirname, 'reviews_data.txt');

// 获取商店数据
app.get('/api/get-stores', (req, res) => {
  fs.readFile(storeDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取商店数据文件:', err);
      res.status(500).send('无法读取商店数据文件-服务器错误');
      return;
    }
    const jsonData = data.trim().split('\n').map(line => JSON.parse(line));
    res.status(200).json(jsonData);
  });
});

// 保存商店数据
app.post('/api/save-store', (req, res) => {
  const store = req.body;
  fs.appendFile(storeDataFile, JSON.stringify(store) + '\n', err => {
    if (err) {
      console.error('无法保存商店数据:', err);
      res.status(500).send('无法保存商店数据-服务器错误');
      return;
    }
    res.status(200).send('商店数据已保存');
  });
});

// 获取用户数据
app.get('/api/get-user', (req, res) => {
  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取用户数据文件:', err);
      res.status(500).send('无法读取用户数据文件-服务器错误');
      return;
    }
    const users = data.trim().split('\n').map(line => JSON.parse(line));
    res.status(200).json(users);
  });
});

// 保存用户数据
app.post('/api/save-user', (req, res) => {
  const user = req.body;
  fs.appendFile(profileDataFile, JSON.stringify(user) + '\n', err => {
    if (err) {
      console.error('无法保存用户数据:', err);
      res.status(500).send('无法保存用户数据-服务器错误');
      return;
    }
    res.status(200).send('用户数据已保存');
  });
});

// 获取评价数据
app.get('/api/get-reviews', (req, res) => {
  fs.readFile(reviewsDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取评价数据文件:', err);
      res.status(500).send('无法读取评价数据文件-服务器错误');
      return;
    }
    const reviews = data.trim().split('\n').map(line => JSON.parse(line));
    res.status(200).json(reviews);
  });
});

// 保存评价数据
app.post('/api/save-review', (req, res) => {
  const review = req.body;
  fs.appendFile(reviewsDataFile, JSON.stringify(review) + '\n', err => {
    if (err) {
      console.error('无法保存评价数据:', err);
      res.status(500).send('无法保存评价数据-服务器错误');
      return;
    }
    res.status(200).send('评价数据已保存');
  });
});

// 登录用户
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取用户数据文件:', err);
      res.status(500).send('无法读取用户数据文件-服务器错误');
      return;
    }

    const users = data.trim().split('\n').map(line => JSON.parse(line));
    const user = users.find(user => user.username === username);

    if (!user || user.password !== password) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }

    res.status(200).json({ success: true, memberName: user.memberName });
  });
});

// 注册用户
app.post('/api/register', (req, res) => {
  const { username, password, memberName } = req.body;

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取用户数据文件:', err);
      res.status(500).send('无法读取用户数据文件-服务器错误');
      return;
    }

    const users = data.trim().split('\n').map(line => JSON.parse(line));
    if (users.find(user => user.username === username)) {
      res.status(409).json({ success: false, message: '用户名已存在' });
      return;
    }

    const newUser = { username, password, memberName };
    fs.appendFile(profileDataFile, JSON.stringify(newUser) + '\n', err => {
      if (err) {
        console.error('无法保存用户数据:', err);
        res.status(500).send('无法保存用户数据-服务器错误');
        return;
      }
      res.status(200).json({ success: true });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
