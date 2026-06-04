const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
//const loginRoute = require("./routes/login");
const itemRoutes = require("./routes/itemRoutes");
const aiRoutes = require("./routes/aiRoutes");


connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Simple request logger to help debug route matching during development
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

app.get("/", (req, res) => {
  res.send("FlipValue backend running");
});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/items", itemRoutes);

app.use("/api/ai", aiRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});