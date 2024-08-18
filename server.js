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
const favoritesDataFile = path.join(__dirname, 'favorites.txt');

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
  fs.readFile(reviewsDataFile, 'utf8', (err, reviewsData) => {
    if (err) {
      console.error('无法读取评价数据文件:', err);
      res.status(500).send('无法读取评价数据文件-服务器错误');
      return;
    }

    fs.readFile(profileDataFile, 'utf8', (err, profileData) => {
      if (err) {
        console.error('无法读取用户数据文件:', err);
        res.status(500).send('无法读取用户数据文件-服务器错误');
        return;
      }

      const users = profileData.trim().split('\n').map(line => JSON.parse(line));
      const reviews = reviewsData.trim().split('\n').map(line => JSON.parse(line)).map(review => {
        const user = users.find(user => user.username === review.username);
        return {
          ...review,
          userName: user ? user.memberName : '未知用户'
        };
      });

      res.status(200).json(reviews);
    });
  });
});



// 保存评价数据
app.post('/api/save-review', (req, res) => {
  const newReview = req.body;

  fs.readFile(reviewsDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取评价数据文件:', err);
      res.status(500).send('无法读取评价数据文件-服务器错误');
      return;
    }

    // 將文件中的評價資料讀取成陣列
    let reviews = data.trim() ? data.trim().split('\n').map(line => JSON.parse(line)) : [];

    // 查找是否已經存在該使用者對同一店家的評價
    const reviewIndex = reviews.findIndex(review => review.username === newReview.username && review.storeName === newReview.storeName);

    if (reviewIndex !== -1) {
      // 覆蓋現有的評價
      reviews[reviewIndex] = newReview;
    } else {
      // 新增一條新評價
      reviews.push(newReview);
    }

    // 將更新後的評價資料寫回文件
    fs.writeFile(reviewsDataFile, reviews.map(r => JSON.stringify(r)).join('\n') + '\n', (err) => {
      if (err) {
        console.error('无法保存评价数据:', err);
        res.status(500).send('无法保存评价数据-服务器错误');
        return;
      }
      res.status(200).send('评价数据已保存');
    });
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
// 加入我的最愛
app.post('/api/add-favorite', (req, res) => {
  const { username, storeName } = req.body;

  fs.readFile(favoritesDataFile, 'utf8', (err, data) => {
    let favorites = {};

    if (err && err.code !== 'ENOENT') {
      console.error('无法读取收藏数据文件:', err);
      res.status(500).send('无法读取收藏数据文件-服务器错误');
      return;
    }

    if (!err && data.trim()) {
      favorites = JSON.parse(data);
    }

    if (!favorites[username]) {
      favorites[username] = [];
    }
    if (!favorites[username].includes(storeName)) {
      favorites[username].push(storeName);
    }

    fs.writeFile(favoritesDataFile, JSON.stringify(favorites, null, 2), err => {
      if (err) {
        console.error('无法保存收藏数据:', err);
        res.status(500).send('无法保存收藏数据-服务器错误');
        return;
      }
      res.status(200).send('收藏已添加');
    });
  });
});

// 移除我的最愛
app.post('/api/remove-favorite', (req, res) => {
  const { username, storeName } = req.body;

  fs.readFile(favoritesDataFile, 'utf8', (err, data) => {
    let favorites = {};

    if (err && err.code !== 'ENOENT') {
      console.error('无法读取收藏数据文件:', err);
      res.status(500).send('无法读取收藏数据文件-服务器错误');
      return;
    }

    if (!err && data.trim()) {
      favorites = JSON.parse(data);
    }

    if (favorites[username]) {
      favorites[username] = favorites[username].filter(favorite => favorite !== storeName);

      fs.writeFile(favoritesDataFile, JSON.stringify(favorites, null, 2), err => {
        if (err) {
          console.error('无法保存收藏数据:', err);
          res.status(500).send('无法保存收藏数据-服务器错误');
          return;
        }
        res.status(200).send('收藏已移除');
      });
    } else {
      res.status(404).send('用户未找到或用户没有该收藏');
    }
  });
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
