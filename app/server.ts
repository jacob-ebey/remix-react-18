import * as fs from "fs";
import * as fsp from "fs/promises";
import { createServer } from "http";
import type { RequestListener } from "http";
import * as path from "path";

import { installGlobals, formatServerError } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/server-runtime";
import * as build from "@remix-run/server-build";
import mime from "mime";

installGlobals();

let remixHandler = createRequestHandler(
  build,
  { formatServerError },
  process.env.NODE_ENV
);

let cwd = process.cwd();
let requestListener: RequestListener = async (req, res) => {
  try {
    let url = new URL(req.url || "/", `http://${req.headers.host}`);
    path.resolve();

    let filepath = path.resolve(cwd, path.join("public", url.pathname));
    let exists = await fsp
      .stat(filepath)
      .then((r) => r.isFile())
      .catch(() => false);
    if (exists) {
      let stream = fs.createReadStream(filepath);
      res.statusCode = 200;
      res.setHeader("Content-Type", mime.getType(filepath) || "text/plain");
      res.setHeader(
        "Cache-Control",
        url.pathname.startsWith("/build/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=10"
      );

      stream.pipe(res);
      return;
    }
  } catch (error) {}

  try {
    let url = new URL(req.url || "/", `http://${req.headers.host}`);

    let headers = new Headers();
    for (let [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      if (Array.isArray(value)) {
        for (let val of value) {
          headers.append(key, val);
        }
        continue;
      }
      headers.append(key, value);
    }

    let method = (req.method || "get").toLowerCase();
    let body: any = ["get", "head"].includes(method) ? undefined : req;

    let request = new Request(url.toString(), {
      headers,
      body,
      method,
    });

    let response = await remixHandler(request, { res });
    if (response) {
      let headers: Record<string, string[]> = {};
      for (const [key, value] of response.headers) {
        headers[key] = headers[key] || [];
        headers[key].push(value);
      }
      res.writeHead(response.status, response.statusText, headers);
      if (Buffer.isBuffer(response.body)) {
        res.end(response.body);
      } else if ((response.body as any)?.pipe) {
        (response.body as any).pipe(res);
      } else {
        res.end();
      }
    }
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
};

let server = createServer(requestListener);
server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
