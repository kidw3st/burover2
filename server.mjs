// Простой статический сервер для локального просмотра сайта.
// Запуск: node server.mjs  (http://localhost:4173)
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = 4173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, "http://localhost");
    let urlPath = decodeURIComponent(reqUrl.pathname);
    // локальный приём обработанных изображений (только pics/*.png)
    if (req.method === "POST" && urlPath === "/save") {
      const name = reqUrl.searchParams.get("name") ?? "";
      if (!/^[\w-]+\.png$/.test(name)) {
        res.writeHead(400).end("bad name");
        return;
      }
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      await writeFile(join(root, "pics", name), Buffer.concat(chunks));
      res.writeHead(200).end("saved");
      return;
    }
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const filePath = normalize(join(root, urlPath));
    if (!filePath.startsWith(normalize(root))) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      "content-type": types[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, () => {
  console.log(`Сайт доступен: http://localhost:${port}`);
});
