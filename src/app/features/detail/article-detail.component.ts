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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  standalone: true,
  selector: "app-article-detail",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./article-detail.component.scss"],
  template: `
    <main class="container">
      @if (loading()) {
        <div class="spinner-wrap">
          <mat-progress-spinner
            mode="indeterminate"
            [diameter]="40"
            aria-label="Loading"
          ></mat-progress-spinner>
        </div>
      } @else {
        <a class="back-link" routerLink="/" [queryParams]="{ tab: 1 }">이전으로 돌아가기</a>
        <h1 class="title">{{ title() }}</h1>
        <markdown class="content" [data]="markdownContents()"></markdown>
      }
    </main>
  `,
  imports: [MarkdownComponent, MatProgressSpinnerModule, RouterLink],
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postsPort = inject(PostsPort);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  title = signal("");
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
          this.markdownContents.set(res.contents);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
