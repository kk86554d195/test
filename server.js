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

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('无法读取用户数据文件');
      return;
    }

    const users = data.trim().split('\n').map(line => JSON.parse(line));
    const user = users.find(user => user.username === username);

    if (!user) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    } else if (user.password === password) {
      res.status(200).json({ success: true, memberName: user.memberName, favorites: user.favorites || [] });
    } else {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  });
});

// 保存用户资料
app.post('/api/save-profile', (req, res) => {
  const { username, memberName, favorites } = req.body;

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('无法读取用户数据文件');
      return;
    }

    let users = data.trim().split('\n').map(line => JSON.parse(line));
    const userIndex = users.findIndex(user => user.username === username);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], memberName, favorites };
    } else {
      users.push({ username, memberName, favorites });
    }

    fs.writeFile(profileDataFile, users.map(user => JSON.stringify(user)).join('\n') + '\n', 'utf8', err => {
      if (err) {
        res.status(500).send('无法保存用户数据');
        return;
      }
      res.status(200).send('用户数据保存成功');
    });
  });
});

// 获取评论数据
app.get('/api/get-reviews', (req, res) => {
  fs.readFile(reviewsDataFile, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('无法读取评论数据文件');
      return;
    }

    const reviews = JSON.parse(data);
    res.status(200).json(reviews);
  });
});

// 保存评论数据
app.post('/api/save-reviews', (req, res) => {
  const { storeName, reviews } = req.body;

  fs.readFile(reviewsDataFile, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('无法读取评论数据文件');
      return;
    }

    let reviewsData = JSON.parse(data);
    reviewsData[storeName] = reviews;

    fs.writeFile(reviewsDataFile, JSON.stringify(reviewsData), 'utf8', err => {
      if (err) {
        res.status(500).send('无法保存评论数据');
        return;
      }
      res.status(200).send('评论数据保存成功');
    });
  });
});

// 保存商店数据
app.post('/api/save-store', (req, res) => {
  const storeData = req.body;

  fs.writeFile(storeDataFile, storeData.map(store => JSON.stringify(store)).join('\n') + '\n', 'utf8', err => {
    if (err) {
      res.status(500).send('无法保存商店数据');
      return;
    }
    res.status(200).send('商店数据保存成功');
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
