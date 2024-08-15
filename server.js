const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/data', (req, res) => {
  res.json({
    message: 'Hello from Railway!',
    data: [1, 2, 3, 4, 5]
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});