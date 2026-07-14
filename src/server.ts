import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import express from "express";
import { join } from "node:path";

const browserDistFolder = join(import.meta.dirname, "../browser");

const app = express();
const angularApp = new AngularNodeAppEngine();

const SITE = "https://hobom-tech-blog.vercel.app";
const SLUG_PATTERN = /^[A-Za-z0-9-]+$/;

/**
 * 백엔드 API 게이트웨이로 프록시.
 * 클라이언트/SSR 모두 /hobom-internal/api/v1/* 로 백엔드를 호출한다.
 */
app.use("/hobom-internal/api/v1", async (req, res) => {
  const gateway = process.env["HOBOM_API_GATEWAY_URL"];
  const apiKey = process.env["HOBOM_API_GATEWAY_KEY"];
  // Express가 마운트 경로(/hobom-internal/api/v1)를 제거하므로 req.url 은 그 이후 경로다.
  const target = `${gateway}/hobom-api-gateway/hobom-internal${req.url}`;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (
      typeof value === "string" &&
      !["host", "connection"].includes(key.toLowerCase())
    ) {
      headers[key] = value;
    }
  }
  if (apiKey) {
    headers["x-hobom-api-key"] = apiKey;
  }

  const bodyless = req.method === "GET" || req.method === "HEAD";
  const options: Record<string, unknown> = {
    method: req.method,
    headers,
  };
  if (!bodyless) {
    options["body"] = req;
    options["duplex"] = "half";
  }

  try {
    const response = await fetch(target, options as RequestInit);
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (
        !["transfer-encoding", "content-encoding", "connection"].includes(
          key.toLowerCase(),
        )
      ) {
        res.setHeader(key, value);
      }
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res
      .status(502)
      .json({ error: "proxy failed", message: (err as Error).message });
  }
});

/**
 * 동적 sitemap.xml — 전 아티클을 /articles/:slug 로 나열한다.
 */
app.get("/sitemap.xml", async (_req, res) => {
  const gateway = process.env["HOBOM_API_GATEWAY_URL"];
  const apiKey = process.env["HOBOM_API_GATEWAY_KEY"];

  try {
    const articles: Array<{ slug?: string; date?: string }> = [];
    let cursor: string | null = null;
    let guard = 0;

    do {
      const params = new URLSearchParams({ pageSize: "50" });
      if (cursor) {
        params.set("cursor", cursor);
      }
      const target = `${gateway}/hobom-api-gateway/hobom-internal/hobom/tech/articles?${params.toString()}`;
      const response = await fetch(target, {
        headers: { "x-hobom-api-key": apiKey ?? "", Accept: "*/*" },
      });
      if (!response.ok) {
        break;
      }
      const data = (await response.json()) as {
        items?: {
          articles?: Array<{ slug?: string; date?: string }>;
          nextCursor?: string | null;
          hasMore?: boolean;
        };
      };
      const items = data.items ?? {};
      articles.push(...(items.articles ?? []));
      cursor = items.hasMore ? (items.nextCursor ?? null) : null;
      guard += 1;
    } while (cursor && guard < 50);

    const entries = [
      `  <url>\n    <loc>${SITE}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ];
    for (const article of articles) {
      const slug = String(article.slug ?? "");
      if (!SLUG_PATTERN.test(slug)) {
        continue;
      }
      const lastmod = article.date
        ? `\n    <lastmod>${article.date}</lastmod>`
        : "";
      entries.push(
        `  <url>\n    <loc>${SITE}/articles/${slug}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).send(xml);
  } catch (err) {
    res
      .status(500)
      .json({ error: "sitemap failed", message: (err as Error).message });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: "1y",
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env["pm_id"]) {
  const port = process.env["PORT"] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
