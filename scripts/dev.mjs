import { spawn } from "node:child_process";
import { open, rm } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const convexBin = path.join(rootDir, "node_modules", "convex", "bin", "main.js");
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const nextLockPath = path.join(rootDir, ".next", "dev", "lock");
const convexPort = Number(process.env.CONVEX_PORT ?? 3210);
const nextPort = Number(process.env.PORT ?? 3000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clearOrValidateNextLock() {
  try {
    const handle = await open(nextLockPath, "r+");
    await handle.close();
    await rm(nextLockPath, { force: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    if (error.code === "EBUSY" || error.code === "EPERM") {
      // On Windows, stale/transient file locks can remain briefly after an unclean exit.
      if (await isPortInUse(nextPort)) {
        console.warn(
          `Next.js lock file is busy and port ${nextPort} is already in use. Continuing with lock recovery and port detection.`
        );
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        await sleep(250);
        try {
          await rm(nextLockPath, { force: true });
          return;
        } catch (retryError) {
          if (retryError.code === "ENOENT") return;
          if (retryError.code !== "EBUSY" && retryError.code !== "EPERM") {
            throw retryError;
          }
        }
      }

      console.warn(
        "Next.js lock file is still busy, but port is free. Continuing and letting Next.js handle lock recovery."
      );
      return;
    }
    throw error;
  }
}

function isPortInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(750);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
    socket.connect(port, host);
  });
}

async function findAvailablePort(startPort, maxAttempts = 20) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (!(await isPortInUse(port))) {
      return port;
    }
  }

  throw new Error(
    `Unable to find an available port in range ${startPort}-${startPort + maxAttempts - 1}.`
  );
}

await clearOrValidateNextLock();
const selectedNextPort = await findAvailablePort(nextPort);

const children = [];

if (!(await isPortInUse(convexPort))) {
  children.push(
    spawn(process.execPath, [convexBin, "dev"], {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env,
    })
  );
} else {
  console.log(
    `Convex local backend already running on port ${convexPort}. Reusing existing backend.`
  );
}

children.push(
  spawn(process.execPath, [nextBin, "dev", "--port", String(selectedNextPort)], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  })
);

if (selectedNextPort !== nextPort) {
  console.log(
    `Port ${nextPort} is busy. Started Next.js dev server on port ${selectedNextPort} instead.`
  );
}

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(exitCode);
}

for (const child of children) {
  child.on("exit", (code) => {
    if (shuttingDown) return;
    shutdown(code ?? 0);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
