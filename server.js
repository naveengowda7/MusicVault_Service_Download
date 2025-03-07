const express = require("express");
const cors = require("cors"); // ✅ Import CORS
const downloadRoutes = require("./src/routes/downloadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: "GET,POST,PUT,DELETE,OPTIONS", // Allow necessary HTTP methods
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization", // Allow necessary headers
  })
);

// ✅ Allow JSON request body
app.use(express.json());

// Routes
app.use("/api", downloadRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Download Service running on http://localhost:${PORT}`);
});
