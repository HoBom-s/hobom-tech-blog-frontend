import { Component, inject, signal, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MarkdownComponent } from "ngx-markdown";
import { PostsPort } from "../../core/ports/post.port";
import { ROUTE_PATHS } from "../../core/router/route-paths";
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
        <a
          [href]="ROUTE_PATHS.MAIN.HOME"
          style="
            color:rgba(0,0,0,.55);
            text-decoration:underline;
            text-underline-offset:2px;
            cursor: pointer;
            margin-bottom: 28px;
        "
        >
          이전으로 돌아가기
        </a>
        <h1 class="title" style="margin-bottom: 32px;">{{ title() }}</h1>
        <markdown class="content" [data]="markdownContents()"></markdown>
      }
    </main>
  `,
  imports: [MarkdownComponent, MatProgressSpinnerModule],
})
export class ArticleDetailComponent {
  private route = inject(ActivatedRoute);
  private postsPort = inject(PostsPort);

  loading = signal<boolean>(false);
  title = signal<string>("");
  pageId = signal<string>("");
  markdownContents = signal<string>("");

  ngOnInit() {
    this.route.queryParamMap.subscribe((map) => {
      this.loading.set(true);
      const title = map.get("title");
      if (title != null) this.title.set(title);

      const pageId = map.get("pageId");
      if (pageId == null) return;

      this.postsPort.getDetail({ pageId }).subscribe({
        next: (res) => {
          this.markdownContents.set(res.contents);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    });
  }

  protected readonly ROUTE_PATHS = ROUTE_PATHS;
}
