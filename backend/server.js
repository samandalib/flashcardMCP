const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Node.js + Next.js backend running!' });
});

app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Sample data from backend',
    items: ['Item 1', 'Item 2', 'Item 3'],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});