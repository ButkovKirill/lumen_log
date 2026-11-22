// src/index.ts
function log(message, level = "info") {
  const time = (/* @__PURE__ */ new Date()).toISOString();
  console.log(`[${time}] [${level.toUpperCase()}] ${message}`);
}
export {
  log
};
