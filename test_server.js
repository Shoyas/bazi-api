const express = require('express');
const { calculateBazi } = require('./src/app/modules/bazi/bazi.service');
const app = express();

app.get('/test', async (req, res) => {
  try {
    const result = calculateBazi({
      birthDate: '2004-10-30',
      birthTime: '10:30',
      gender: 'male',
      timezone: 'Asia/Dhaka',
      language: 'en'
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
