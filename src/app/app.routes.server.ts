import { RenderMode, ServerRoute } from "@angular/ssr";

import { environment } from "../environments/environment";

const SLUG_PATTERN = /^[A-Za-z0-9-]+$/;

/**
 * 빌드 시 백엔드(공개 프록시)에서 전 아티클 slug를 수집한다.
 * 각 slug 는 /articles/:slug 정적 프리렌더 대상이 된다.
 */
async function fetchAllSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let cursor: string | null = null;
  let guard = 0;

  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (cursor) {
      params.set("cursor", cursor);
    }
    const response = await fetch(
      `${environment.siteUrl}/hobom-internal/api/v1/hobom/tech/articles?${params.toString()}`,
      { headers: { Accept: "*/*" } },
    );
    if (!response.ok) {
      break;
    }
    const data = (await response.json()) as {
      items?: {
        articles?: Array<{ slug?: string }>;
        nextCursor?: string | null;
        hasMore?: boolean;
      };
    };
    const items = data.items ?? {};
    for (const article of items.articles ?? []) {
      const slug = String(article.slug ?? "");
      if (SLUG_PATTERN.test(slug)) {
        slugs.push(slug);
      }
    }
    cursor = items.hasMore ? (items.nextCursor ?? null) : null;
    guard += 1;
  } while (cursor && guard < 50);

  return slugs;
}

export const serverRoutes: ServerRoute[] = [
  {
    path: "articles/:slug",
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const slugs = await fetchAllSlugs();
      return slugs.map((slug) => ({ slug }));
    },
  },
  {
    path: "**",
    renderMode: RenderMode.Prerender,
  },
];
