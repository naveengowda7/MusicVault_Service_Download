import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/database/connection.js";
import downloadRoutes from "./src/routes/downloadRoutes.js";

dotenv.config(); // Load .env variables

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://musicvault-frontend.onrender.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Download Service is running" });
});

app.get("/", (req, res) => {
  res.json({ message: "YouTube Audio Downloader API is running!" });
});

app.use("/api", downloadRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Download Service running on port ${PORT}`);
});