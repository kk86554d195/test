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
  const { storeName } = req.query; // 接收查询参数 storeName

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
      let reviews = reviewsData.trim().split('\n').map(line => JSON.parse(line));

      // 如果 storeName 提供，只返回该店家的评论
      if (storeName) {
        reviews = reviews.filter(review => review.storeName === storeName);
      }

      // 合并用户数据
      const enrichedReviews = reviews.map(review => {
        const user = users.find(user => user.account === review.account); // 使用 account 而非 username
        return {
          ...review,
          username: user ? user.username : '未知用户' // 将 account 匹配到对应的 username
        };
      });

      res.status(200).json(enrichedReviews);
    });
  });
});





// 保存评价数据
app.post('/api/save-review', (req, res) => {
  const newReview = req.body;

  // 確保文件存在，若不存在則創建
  fs.readFile(reviewsDataFile, 'utf8', (err, data) => {
    if (err && err.code === 'ENOENT') {
      // 如果文件不存在，創建一個空的文件
      fs.writeFileSync(reviewsDataFile, '');
      data = '';
    } else if (err) {
      console.error('無法讀取評價數據文件:', err);
      res.status(500).send('無法讀取評價數據文件-服務器錯誤');
      return;
    }

    let reviews = data.trim() ? data.trim().split('\n').map(line => JSON.parse(line)) : [];

    // 查找是否已經存在相同使用者對相同店家的評價
    const reviewIndex = reviews.findIndex(review => review.account === newReview.account && review.storeName === newReview.storeName);

    if (reviewIndex !== -1) {
      // 如果找到相同的評價，進行覆蓋
      reviews[reviewIndex] = newReview;
    } else {
      // 否則新增該評價
      reviews.push(newReview);
    }

    // 將所有評價重新寫入文件
    fs.writeFile(reviewsDataFile, reviews.map(r => JSON.stringify(r)).join('\n') + '\n', (err) => {
      if (err) {
        console.error('無法保存評價數據:', err);
        res.status(500).send('無法保存評價數據-服務器錯誤');
        return;
      }
      res.status(200).send('評價數據已保存');
    });
  });
});





// 登录用户
app.post('/api/login', (req, res) => {
  const { account, password } = req.body;

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取用户数据文件:', err);
      res.status(500).send('无法读取用户数据文件-服务器错误');
      return;
    }

    const users = data.trim().split('\n').map(line => JSON.parse(line));
    const user = users.find(user => user.account === account);

    if (!user || user.password !== password) {
      res.status(401).json({ success: false, message: '账号或密码错误' });
      return;
    }

    res.status(200).json({ success: true, username: user.username });
  });
});

// 注册用户
app.post('/api/register', (req, res) => {
  const { account, password, username } = req.body;

  fs.readFile(profileDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取用户数据文件:', err);
      res.status(500).send('无法读取用户数据文件-服务器错误');
      return;
    }

    const users = data.trim().split('\n').map(line => JSON.parse(line));
    if (users.find(user => user.account === account)) {
      res.status(409).json({ success: false, message: '账号已存在' });
      return;
    }

    const newUser = { account, password, username };
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

// 加入我的最爱
app.post('/api/add-favorite', (req, res) => {
  const { account, storeName } = req.body;

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

    if (!favorites[account]) {
      favorites[account] = [];
    }
    if (!favorites[account].includes(storeName)) {
      favorites[account].push(storeName);
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

// 移除我的最爱
app.post('/api/remove-favorite', (req, res) => {
  const { account, storeName } = req.body;

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

    if (favorites[account]) {
      favorites[account] = favorites[account].filter(favorite => favorite !== storeName);

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

// 获取用户我的最爱的店家列表
app.get('/api/get-favorites', (req, res) => {
  const { account } = req.query;

  fs.readFile(favoritesDataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('无法读取收藏数据文件:', err);
      res.status(500).send('无法读取收藏数据文件-服务器错误');
      return;
    }

    const favorites = JSON.parse(data);
    const userFavorites = favorites[account] || [];

    fs.readFile(storeDataFile, 'utf8', (err, storeData) => {
      if (err) {
        console.error('无法读取商店数据文件:', err);
        res.status(500).send('无法读取商店数据文件-服务器错误');
        return;
      }

      const stores = storeData.trim().split('\n').map(line => JSON.parse(line));
      const favoriteStores = stores.filter(store => userFavorites.includes(store.name));

      res.status(200).json(favoriteStores);
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
