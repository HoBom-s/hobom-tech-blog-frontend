import { Observable } from "rxjs";
import { ArticleType } from "../models/post.model";

export abstract class PostsPort {
  abstract listCursor(params?: {
    cursor?: string | null;
    limit?: number;
    tag?: string;
    q?: string;
  }): Observable<ArticleType>;
}
