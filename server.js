const express = require("express");
const cors = require("cors");
const downloadRoutes = require("./src/routes/downloadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://musicvault-frontend.onrender.com",
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

app.use(express.json());


app.use("/api", downloadRoutes);


app.listen(PORT, () => {
  console.log(`Download Service running on http://localhost:${PORT}`);
});
