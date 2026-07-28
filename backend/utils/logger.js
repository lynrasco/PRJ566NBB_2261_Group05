const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");
const errorLogPath = path.join(logDir, "error.txt");

const ensureLogDirectory = () => {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    console.error("Failed to create log directory:", err);
  }
};

const formatEntry = (level, message, stack, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length
    ? `Meta: ${JSON.stringify(meta, null, 2)}`
    : "";

  return [
    `==================== ${timestamp} ====================`,
    `[${level}] ${message}`,
    metaString,
    stack || "",
    "",
  ]
    .filter(Boolean)
    .join("\n");
};

const writeLog = (entry) => {
  ensureLogDirectory();

  try {
    fs.appendFileSync(errorLogPath, `${entry}\n`, "utf8");
  } catch (err) {
    console.error("Failed to write log entry:", err);
  }
};

const error = (err, meta = {}) => {
  const message = err && err.message ? err.message : String(err);
  const stack = err && err.stack ? err.stack : "";
  const entry = formatEntry("ERROR", message, stack, meta);

  writeLog(entry);
};

module.exports = {
  error,
};
