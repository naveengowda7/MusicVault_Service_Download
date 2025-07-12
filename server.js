const express = require("express");
const cors = require("cors");
const downloadRoutes = require("./src/routes/downloadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://musicvault-frontend.onrender.com",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Download Service is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Audio Downloader API is running!' });
});

app.use("/api", downloadRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Download Service running on port ${PORT}`);
});