import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const isNodeRuntime =
  typeof process !== "undefined" &&
  typeof process.versions === "object" &&
  typeof process.versions.node === "string";

let repoLogDir: string | null = null;
let nodeFs: any = null;
if (isNodeRuntime) {
  try {
    nodeFs = require("fs");
    repoLogDir = `${process.cwd()}/logs`;
  } catch {
    repoLogDir = null;
  }
}

const LOG_DIR =
  repoLogDir ??
  (FileSystem.documentDirectory ? `${FileSystem.documentDirectory}logs` : "");
const ERROR_LOG_FILE = repoLogDir
  ? `${repoLogDir}/error.txt`
  : `${LOG_DIR}/error.txt`;

const serializeValue = (value: unknown): string => {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}\n${value.stack ?? ""}`;
  }

  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const formatEntry = (
  level: string,
  values: unknown[],
  meta: Record<string, unknown> = {},
) => {
  const timestamp = new Date().toISOString();
  const message = values.map(serializeValue).join(" ");
  const metaString = Object.keys(meta).length
    ? `Meta: ${JSON.stringify(meta, null, 2)}`
    : "";

  return [
    `==================== ${timestamp} ====================`,
    `[${level}] ${message}`,
    metaString,
    "",
  ]
    .filter(Boolean)
    .join("\n");
};

const ensureLogDirectory = async () => {
  if (repoLogDir && nodeFs) {
    try {
      if (!nodeFs.existsSync(repoLogDir)) {
        nodeFs.mkdirSync(repoLogDir, { recursive: true });
      }
      return true;
    } catch {
      return false;
    }
  }

  try {
    if (!FileSystem.documentDirectory) return false;

    const dirInfo = await FileSystem.getInfoAsync(LOG_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOG_DIR, { intermediates: true });
    }
    return true;
  } catch {
    return false;
  }
};

const writeLog = async (entry: string) => {
  if (repoLogDir && nodeFs) {
    try {
      const dirReady = await ensureLogDirectory();
      if (!dirReady) return;

      const existing = nodeFs.existsSync(ERROR_LOG_FILE)
        ? nodeFs.readFileSync(ERROR_LOG_FILE, "utf8")
        : "";
      nodeFs.writeFileSync(ERROR_LOG_FILE, `${existing}${entry}\n`, "utf8");
      return;
    } catch {
      return;
    }
  }

  if (!FileSystem.documentDirectory) {
    return;
  }

  try {
    const dirReady = await ensureLogDirectory();
    if (!dirReady) return;

    let content = "";
    const fileInfo = await FileSystem.getInfoAsync(ERROR_LOG_FILE);
    if (fileInfo.exists) {
      try {
        content = await FileSystem.readAsStringAsync(ERROR_LOG_FILE);
      } catch {
        content = "";
      }
    }

    await FileSystem.writeAsStringAsync(ERROR_LOG_FILE, `${content}${entry}\n`);
  } catch {
    return;
  }
};

export const error = async (
  errorValue: unknown,
  meta: Record<string, unknown> = {},
) => {
  const entry = formatEntry("ERROR", [errorValue], meta);
  await writeLog(entry);
};

export const initializeGlobalErrorLogging = async () => {
  const errorUtils = (globalThis as any).ErrorUtils;
  if (errorUtils?.setGlobalHandler) {
    const originalHandler = errorUtils.getGlobalHandler?.();
    errorUtils.setGlobalHandler((err: unknown, isFatal?: boolean) => {
      void error(err, {
        source: "ErrorUtils",
        isFatal: Boolean(isFatal),
        platform: Platform.OS,
      });
      if (typeof originalHandler === "function") {
        originalHandler(err, isFatal);
      }
    });
  }

  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("unhandledrejection", (event: any) => {
      const reason = event?.reason ?? "Unhandled promise rejection";
      void error(reason, {
        source: "unhandledrejection",
        platform: Platform.OS,
      });
    });
  }
};

export const getErrorLogPath = () => ERROR_LOG_FILE;
