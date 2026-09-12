import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const directory = dirname(fileURLToPath(import.meta.url));
const debugPort = 9438;
export const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Installed Edge + Node's CDP transport, using a disposable local profile.
export async function localBrowser() {
  const profile = join(directory, "runtime", "edge_profile");
  await mkdir(profile, { recursive: true });
  const child = spawn("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", [
    "--headless=new", "--remote-debugging-address=127.0.0.1", `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank",
  ], { windowsHide: true, stdio: "ignore" });
  child.on("error", (error) => { throw error; });
  let target;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      target = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" }).then((result) => result.json());
      break;
    } catch { await pause(250); }
  }
  if (!target) { child.kill(); throw new Error("Installed Edge did not open its local capture connection"); }
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const pending = new Map();
  const errors = [];
  // Optional local recording subscribers; existing capture callers are unchanged.
  const eventHandlers = new Set();
  let nextId = 0;
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      clearTimeout(request.timeout);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(message.params.entry);
    if (message.method) for (const handler of eventHandlers) handler(message);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  return {
    send, evaluate, errors,
    onEvent(handler) { eventHandlers.add(handler); return () => eventHandlers.delete(handler); },
    async close() {
      try { await send("Browser.close"); } catch { child.kill(); }
      socket.close();
    },
  };
}
