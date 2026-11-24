// src/Logger/colors.ts
var Colors = {
  reset: "\x1B[0m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  gray: "\x1B[90m",
  bold: "\x1B[1m",
  underline: "\x1B[4m"
};
var colorize = (text, color) => {
  return `${Colors[color]}${text}${Colors.reset}`;
};

// src/Logger/loggerTools.ts
var getDateAndTimeField = (showTime, showDate) => {
  const dateAndTime = /* @__PURE__ */ new Date();
  const dateInfo = {
    day: dateAndTime.getDate(),
    month: dateAndTime.getMonth(),
    year: dateAndTime.getFullYear(),
    h: dateAndTime.getHours(),
    m: dateAndTime.getMinutes(),
    s: dateAndTime.getSeconds()
  };
  const date = showDate ? `${dateInfo.day}.${dateInfo.month}.${dateInfo.year}` : "";
  const time = showTime ? `${dateInfo.h}:${dateInfo.m}:${dateInfo.s}` : "";
  const separator = date && time ? " " : "";
  const field = `[${date}${separator}${time}]`;
  return field;
};
var getCallerInfoField = (showNameCaller = true, showFileCaller = true, level = 5) => {
  const stack = new Error().stack?.split("\n");
  const caller = stack?.[level]?.trim();
  const match = caller?.match(/at (.*?) \((.*?):\d+:\d+\)/);
  const functionCallerName = showNameCaller ? (match?.[1] ?? "unknown_function") + "()" : "";
  const fileCallerName = showFileCaller ? match?.[2]?.split(/[\\/]/).pop() ?? "unknown_file" : "";
  const separator = functionCallerName && fileCallerName ? " -> " : "";
  const field = `[${fileCallerName}${separator}${functionCallerName}]`;
  return field;
};

// src/Logger/themes.ts
var getColorForElement = (element, typeLog) => {
  const theme = {
    marker: {
      log: "gray",
      debug: "magenta",
      ok: "green",
      error: "red",
      warn: "yellow"
    },
    date: {
      log: "gray",
      debug: "gray",
      ok: "gray",
      error: "gray",
      warn: "gray"
    },
    caller: {
      log: "gray",
      debug: "gray",
      ok: "gray",
      error: "gray",
      warn: "gray"
    },
    text: {
      log: "white",
      debug: "magenta",
      ok: "green",
      error: "red",
      warn: "yellow"
    }
  };
  return theme[element][typeLog];
};

// src/Logger/config.ts
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
var defaultConfig = {
  logInFile: false,
  logInFileForDebug: false,
  telegram: {
    logInTelegram: false,
    api: void 0,
    chatsIds: void 0
  },
  nameCaller: true,
  nameFileCaller: true,
  timeCall: true,
  dateCall: true,
  padding: false,
  marker: "\u23FA"
};
var isObject = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
var findConfig = () => {
  let currentDir = process.cwd();
  while (true) {
    const configPath = join(currentDir, "lumen.config.json");
    if (existsSync(configPath)) {
      return configPath;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }
    currentDir = parentDir;
  }
};
var getConfig = () => {
  const configPath = findConfig();
  if (!configPath) {
    return { ...defaultConfig };
  }
  try {
    const fileContent = readFileSync(configPath, "utf-8");
    const parsedConfig = JSON.parse(fileContent);
    if (!isObject(parsedConfig)) {
      throw new Error("Configuration must be a JSON object");
    }
    const telegramConfig = isObject(parsedConfig.telegram) ? parsedConfig.telegram : {};
    return {
      ...defaultConfig,
      ...parsedConfig,
      telegram: {
        ...defaultConfig.telegram,
        ...telegramConfig,
        api: process.env.TELEGRAM_BOT_TOKEN ?? telegramConfig.api ?? defaultConfig?.telegram?.api
      }
    };
  } catch (error) {
    console.error("[Lumen Log] Failed to read config:", error);
    return { ...defaultConfig };
  }
};

// src/Logger/fileManager.ts
import fs from "fs";
import path from "path";
var getLogsFilesDirectory = () => {
  console.log("start search logs directory");
  const dir = process.cwd() + "/logs";
  return dir;
};
var getFilePath = (typeLog, directory) => {
  const date = (/* @__PURE__ */ new Date()).toLocaleDateString();
  const dir = path.join(directory, typeLog);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = `${dir}/${date}.log`;
  try {
    fs.writeFileSync(filePath, "", { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
  return filePath;
};
var printLogInFile = (pathFile, message) => {
  fs.appendFileSync(pathFile, message.toString() + "\n", "utf-8");
};

// src/Logger/telegram.ts
var sendTelegramMessage = async (message, api, chatIds) => {
  if (!api) {
    throw new Error("[Lumen Log] Telegram bot token is missing");
  }
  if (!chatIds) {
    throw new Error("[Lumen Log] Telegram: No chats ids");
  }
  const url = `https://api.telegram.org/bot${api}/sendMessage`;
  await Promise.all(
    chatIds.map((userId) => sendMessage(url, userId, message))
  );
};
var sendMessage = async (url, chatId, message) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: String(message)
    })
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.description ?? "Telegram API error");
  }
};

// src/Logger/lumen.ts
var Lumen = class {
  // Private
  static config = getConfig();
  static getInfo(props, level = 5) {
    const dateCall = props?.options?.dateCall ?? this.config.dateCall;
    const timeCall = props?.options?.timeCall ?? this.config.timeCall;
    const showDateAndTimeField = dateCall || timeCall;
    const nameCaller = props?.options?.nameCaller ?? this.config.nameCaller;
    const fileCaller = props?.options?.nameFileCaller ?? this.config.nameFileCaller;
    const showCallerField = nameCaller || fileCaller;
    const dateAndTime = showDateAndTimeField ? getDateAndTimeField(timeCall, dateCall) : "";
    const callerInfo = showCallerField ? getCallerInfoField(nameCaller, fileCaller, level) : "";
    return {
      showDateAndTimeField,
      showCallerField,
      dateAndTime,
      callerInfo
    };
  }
  static buildMeta(meta, options = {}) {
    const { colored = true } = options;
    const lines = ["\n~ Data:", "{"];
    const colorTypes = {
      string: "green",
      number: "yellow",
      boolean: "red",
      undefined: "gray"
    };
    const indent = (depth) => "  ".repeat(depth);
    const getType = (value) => {
      if (value === null) return "null";
      if (Array.isArray(value)) return "array";
      return typeof value;
    };
    const paint = (value, color) => colored ? colorize(value, color) : value;
    const formatKey = (key) => paint(key, "blue") === key || !colored ? colored ? colorize(colorize(key, "blue"), "bold") : key : colorize(colorize(key, "blue"), "bold");
    const formatType = (type) => paint(`(${type})`, "magenta");
    const formatValue = (value) => {
      if (typeof value === "string") return JSON.stringify(value);
      if (typeof value === "undefined") return "undefined";
      if (typeof value === "bigint") return `${value}n`;
      if (typeof value === "symbol") return value.toString();
      if (typeof value === "function") {
        return `[Function: ${value.name || "anonymous"}]`;
      }
      return String(value);
    };
    const visited = /* @__PURE__ */ new WeakSet();
    const render = (value, key, depth) => {
      const prefix = indent(depth);
      const formattedKey = colored ? colorize(colorize(key, "blue"), "bold") : key;
      if (value !== null && typeof value === "object") {
        if (visited.has(value)) {
          lines.push(`${prefix}${formattedKey}: [Circular]`);
          return;
        }
        visited.add(value);
        try {
          if (Array.isArray(value)) {
            lines.push(
              `${prefix}${formattedKey}: [ ${formatType(`array, length: ${value.length}`)}`
            );
            value.forEach((item, index) => {
              render(item, `[${index}]`, depth + 1);
            });
            lines.push(`${prefix}]`);
          } else {
            lines.push(
              `${prefix}${formattedKey}: { ${formatType("object")}`
            );
            for (const [childKey, childValue] of Object.entries(value)) {
              render(childValue, childKey, depth + 1);
            }
            lines.push(`${prefix}}`);
          }
        } finally {
          visited.delete(value);
        }
        return;
      }
      const type = getType(value);
      const color = colorTypes[type] ?? "white";
      const formattedValue = paint(formatValue(value), color);
      lines.push(
        `${prefix}${formattedKey}: ${formattedValue} ${formatType(type)}`
      );
    };
    if (meta !== null && typeof meta === "object" && !Array.isArray(meta)) {
      for (const [key, value] of Object.entries(meta)) {
        render(value, key, 1);
      }
    } else {
      render(meta, "value", 1);
    }
    lines.push("}");
    return lines.join("\n");
  }
  static buildLog(dataLog) {
    const colorMarker = getColorForElement("marker", dataLog.logType);
    const colorDate = getColorForElement("date", dataLog.logType);
    const colorCaller = getColorForElement("caller", dataLog.logType);
    const colorText = getColorForElement("text", dataLog.logType);
    const { dateAndTime, callerInfo } = this.getInfo(dataLog.props);
    const separator = dateAndTime || callerInfo ? " " : "";
    const padding = dataLog.props?.options?.padding ?? this.config.padding ? "\n" : "";
    const markerSymbol = dataLog.props?.options?.marker ?? this.config.marker ?? "\u23FA";
    const marker = `${colorize(markerSymbol, colorMarker)} `;
    const loggerType = colorize(`[${dataLog.logType.toUpperCase()}]`, colorMarker);
    const fields = `${colorize(dateAndTime, colorDate)}${separator}${colorize(callerInfo, colorCaller)}`;
    const textForMessage = colorize(dataLog.message, colorText);
    const metaData = dataLog.props?.data;
    const metaField = metaData ? this.buildMeta(metaData) : "";
    const text = `${padding}${marker} ${loggerType} ${fields}${separator ? "\n" : ""}${textForMessage}${metaField}${padding}`;
    return text;
  }
  static buildLogWithoutColorize(dataLog) {
    const { dateAndTime, callerInfo } = this.getInfo(dataLog.props, 6);
    const separator = dateAndTime || callerInfo ? " " : "";
    const padding = dataLog.props?.options?.padding ?? this.config.padding ? "\n" : "";
    const marker = dataLog.props?.options?.marker ?? "\u23FA";
    const loggerType = `[${dataLog.logType.toUpperCase()}]`;
    const fields = `${dateAndTime}${separator}${callerInfo}`;
    const metaData = dataLog.props?.data;
    const metaField = metaData ? this.buildMeta(metaData, { colored: false }) : "";
    const text = `${padding}${marker} ${loggerType} ${fields}${separator ? "\n" : ""}${dataLog.message}${metaField}${padding}`;
    return text;
  }
  static logInFile(dataLog) {
    const canWrite = dataLog.props?.options?.logInFile ?? this.config.logInFile;
    const isDebug = dataLog.logType === "debug";
    const isWriteDebug = dataLog.props?.options?.logInFileForDebug;
    if (!canWrite) {
      return;
    }
    if (isDebug && !isWriteDebug) {
      return;
    }
    const directory = getLogsFilesDirectory();
    const filePath = getFilePath(dataLog.logType, directory);
    const textForLog = this.buildLogWithoutColorize(dataLog);
    printLogInFile(filePath, textForLog);
  }
  static logInTelegram(dataLog) {
    const canSend = dataLog.props?.options?.telegram?.logInTelegram ?? this.config.telegram?.logInTelegram;
    const api = dataLog.props?.options?.telegram?.api ?? this.config.telegram?.api;
    const chatsIds = dataLog.props?.options?.telegram?.chatsIds ?? this.config.telegram?.chatsIds;
    const canSendToTelegram = canSend && api && chatsIds;
    if (!canSendToTelegram) {
      return;
    }
    const textMessage = this.buildLogWithoutColorize(dataLog);
    sendTelegramMessage(textMessage, api, chatsIds);
  }
  // Public functions
  static log(message, props) {
    const dataLog = {
      message,
      logType: "log",
      props
    };
    const textLog = this.buildLog(dataLog);
    console.log(textLog);
    this.logInFile(dataLog);
    this.logInTelegram(dataLog);
  }
  static debug(message, props) {
    const dataLog = {
      message,
      logType: "debug",
      props
    };
    const textLog = this.buildLog(dataLog);
    console.log(textLog);
    this.logInFile(dataLog);
    this.logInTelegram(dataLog);
  }
  static ok(message, props) {
    const dataLog = {
      message,
      logType: "ok",
      props
    };
    const textLog = this.buildLog(dataLog);
    console.log(textLog);
    this.logInFile(dataLog);
    this.logInTelegram(dataLog);
  }
  static error(message, props) {
    const dataLog = {
      message,
      logType: "error",
      props
    };
    const textLog = this.buildLog(dataLog);
    console.log(textLog);
    this.logInFile(dataLog);
    this.logInTelegram(dataLog);
  }
  static warn(message, props) {
    const dataLog = {
      message,
      logType: "warn",
      props
    };
    const textLog = this.buildLog(dataLog);
    console.log(textLog);
    this.logInFile(dataLog);
    this.logInTelegram(dataLog);
  }
};
export {
  Lumen
};
