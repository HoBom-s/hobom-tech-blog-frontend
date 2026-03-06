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
import { switchMap, EMPTY } from "rxjs";
import { MarkdownComponent } from "ngx-markdown";
import { PostsPort } from "../../core/ports/post.port";

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
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
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

  loading = signal(false);
  title = signal("");
  tags = signal<string[]>([]);
  markdownContents = signal("");

  ngOnInit() {
    this.route.queryParamMap
      .pipe(
        switchMap((map) => {
          const pageId = map.get("pageId");
          if (pageId == null) return EMPTY;

          this.loading.set(true);
          return this.postsPort.getDetail({ pageId });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.title.set(res.title);
          this.tags.set(res.tags ?? []);
          this.markdownContents.set(res.contents);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
