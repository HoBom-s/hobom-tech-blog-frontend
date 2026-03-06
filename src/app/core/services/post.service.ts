import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { ApiResponse, Article, ArticleDetail, ArticleType } from "../models/post.model";
import { PostsPort } from "../ports/post.port";

function normalizeArticle(a: Article): Article {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    date: a.date,
    tags: a.tags ?? [],
    emoji: a.emoji ?? "📝",
  };
}

@Injectable({ providedIn: "root" })
export class PostsService implements PostsPort {
  private http = inject(HttpClient);

  listCursor(
    params: {
      cursor?: string | null;
      limit?: number;
      tag?: string;
      q?: string;
    } = {},
  ): Observable<ArticleType> {
    const httpParams = new HttpParams({
      fromObject: {
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.limit ? { limit: String(params.limit) } : {}),
        ...(params.tag ? { tag: params.tag } : {}),
        ...(params.q ? { q: params.q } : {}),
      },
    });
    const headers = new HttpHeaders({ Accept: "*/*" });

    return this.http
      .get<ApiResponse<ArticleType>>("/api/v1/hobom/tech/articles", {
        params: httpParams,
        headers,
      })
      .pipe(
        map(
          (res): ArticleType => ({
            articles: (res.items.articles ?? []).map(normalizeArticle),
            nextCursor: res.items.nextCursor ?? null,
            hasMore: Boolean(res.items.hasMore),
          }),
        ),
      );
  }

  getDetail(params: { pageId: string }): Observable<ArticleDetail> {
    const headers = new HttpHeaders({ Accept: "*/*" });

    return this.http
      .get<ApiResponse<ArticleDetail>>(`/api/v1/hobom/tech/${params.pageId}`, { headers })
      .pipe(
        map(
          (res): ArticleDetail => ({
            title: res.items.title ?? "",
            tags: res.items.tags ?? [],
            contents: res.items.contents ?? "",
          }),
        ),
      );
  }
}
