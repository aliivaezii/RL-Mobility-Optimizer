/**
 * MoveWise — Standalone launcher
 * Serves the built dist/ folder on a local port and opens the default browser.
 * Bundled into MoveWise.exe via pkg so anyone can double-click to run.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = 3456;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// When running as a pkg exe, __dirname points to the snapshot filesystem.
// Use the real exe location to find the dist/ folder next to it.
const EXE_DIR = path.dirname(process.execPath);
const DIST = fs.existsSync(path.join(EXE_DIR, "dist"))
  ? path.join(EXE_DIR, "dist")
  : path.join(__dirname, "dist");

function serve(req, res) {
  // Only allow GET/HEAD
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }

  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Prevent path traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(DIST, safePath);

  // If it's a directory or doesn't exist, serve index.html (SPA fallback)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  const data = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  res.end(data);
}

const server = http.createServer(serve);

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  MoveWise is running at ${url}\n`);
  console.log("  Press Ctrl+C to stop.\n");

  // Open default browser
  const start =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(start);
});
