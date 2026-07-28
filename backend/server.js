const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
//const loginRoute = require("./routes/login");
const itemRoutes = require("./routes/itemRoutes");
const aiRoutes = require("./routes/aiRoutes");
const ebayRoutes = require("./routes/ebayRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }
  next(err);
});

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

app.use("/api/ebay", ebayRoutes);

app.use("/api/pricing", pricingRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const handleProcessError = (err, origin) => {
  logger.error(err, { origin });
  console.error(`Process ${origin}:`, err);
};

process.on("unhandledRejection", (reason, promise) => {
  handleProcessError(reason, "unhandledRejection");
});

process.on("uncaughtException", (err) => {
  handleProcessError(err, "uncaughtException");
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("eBay listing config loaded:", {
    paymentPolicy: Boolean(process.env.EBAY_PAYMENT_POLICY_ID),
    returnPolicy: Boolean(process.env.EBAY_RETURN_POLICY_ID),
    fulfillmentPolicy: Boolean(process.env.EBAY_FULFILLMENT_POLICY_ID),
    defaultCategory: Boolean(process.env.EBAY_DEFAULT_CATEGORY_ID),
  });
});
