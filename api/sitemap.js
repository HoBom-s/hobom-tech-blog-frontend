const SITE = "https://hobom-tech-blog.vercel.app";
// 정상 slug만 허용 (예: 앞 슬래시가 붙은 잘못된 slug는 사이트맵에서 제외)
const SLUG_PATTERN = /^[A-Za-z0-9-]+$/;

export default async function handler(req, res) {
  const gateway = process.env.HOBOM_API_GATEWAY_URL;
  const apiKey = process.env.HOBOM_API_GATEWAY_KEY;

  try {
    const articles = [];
    let cursor = null;
    let guard = 0;

    do {
      const params = new URLSearchParams({ pageSize: "50" });
      if (cursor) params.set("cursor", cursor);
      const target = `${gateway}/hobom-api-gateway/hobom-internal/hobom/tech/articles?${params.toString()}`;

      const response = await fetch(target, {
        headers: { "x-hobom-api-key": apiKey, Accept: "*/*" },
      });
      if (!response.ok) break;

      const data = await response.json();
      const items = data && data.items ? data.items : {};
      articles.push(...(items.articles || []));
      cursor = items.hasMore ? items.nextCursor : null;
      guard += 1;
    } while (cursor && guard < 50);

    const entries = [
      `  <url>\n    <loc>${SITE}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ];

    for (const article of articles) {
      const slug = String(article.slug || "");
      if (!SLUG_PATTERN.test(slug)) continue;

      const lastmod = article.date ? `\n    <lastmod>${article.date}</lastmod>` : "";
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
    res.status(500).json({ error: "sitemap failed", message: err.message });
  }
}
