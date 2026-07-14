import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap, EMPTY, map } from "rxjs";
import { MarkdownComponent } from "ngx-markdown";
import { PostsPort } from "../../core/ports/post.port";
import { SeoService } from "../../core/seo/seo.service";
import { environment } from "../../../environments/environment";

const EXCERPT_MAX = 155;

function toExcerpt(markdown: string, max = EXCERPT_MAX): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_\`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

@Component({
  standalone: true,
  selector: "app-article-detail",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./article-detail.component.scss"],
  template: `
    <main id="main-content" class="detail-page" role="main">
      @if (loading()) {
        <div class="spinner-wrap" role="status" aria-label="글을 불러오는 중">
          <div class="spinner"></div>
        </div>
      } @else {
        <nav class="nav" aria-label="페이지 이동">
          <a class="back-link" routerLink="/" aria-label="홈으로 돌아가기">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
            Back
          </a>
        </nav>
        <article class="article">
          <header class="article-header">
            <h1 class="article-title">{{ title() }}</h1>
            @if (tags().length) {
              <div class="article-tags" role="list" aria-label="태그">
                @for (tag of tags(); track tag) {
                  <span class="tag" role="listitem">{{ tag }}</span>
                }
              </div>
            }
          </header>
          <section class="article-body" aria-label="본문">
            <markdown class="content" [data]="markdownContents()"></markdown>
          </section>
        </article>
      }
    </main>
  `,
  imports: [MarkdownComponent, RouterLink],
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postsPort = inject(PostsPort);
  private destroyRef = inject(DestroyRef);
  private seo = inject(SeoService);

  loading = signal(false);
  title = signal("");
  tags = signal<string[]>([]);
  markdownContents = signal("");

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get("slug");
          if (slug == null) return EMPTY;

          this.loading.set(true);
          return this.postsPort
            .getDetail({ slug })
            .pipe(map((res) => ({ res, slug })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ res, slug }) => {
          this.title.set(res.title);
          this.tags.set(res.tags ?? []);
          this.markdownContents.set(res.contents);
          this.loading.set(false);

          this.seo.setArticle({
            title: res.title,
            description: toExcerpt(res.contents),
            url: `${environment.siteUrl}/articles/${slug}`,
            tags: res.tags ?? [],
          });
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
