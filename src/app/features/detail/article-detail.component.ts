import { Component, inject, signal, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MarkdownComponent } from "ngx-markdown";
import { PostsPort } from "../../core/ports/post.port";
import { ROUTE_PATHS } from "../../core/router/route-paths";

@Component({
  standalone: true,
  selector: "app-article-detail",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./article-detail.component.scss"],
  template: `
    <main class="container">
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
      <h1 style="margin-bottom: 32px;">{{ title() }}</h1>
      <markdown [data]="markdownContents()"></markdown>
    </main>
  `,
  imports: [MarkdownComponent],
})
export class ArticleDetailComponent {
  private route = inject(ActivatedRoute);
  private postsPort = inject(PostsPort);

  title = signal<string>("");
  pageId = signal<string>("");
  markdownContents = signal<string>("");

  ngOnInit() {
    this.route.queryParamMap.subscribe((map) => {
      const title = map.get("title");
      if (title != null) this.title.set(title);

      const pageId = map.get("pageId");
      if (pageId == null) return;

      this.postsPort.getDetail({ pageId }).subscribe({
        next: (res) => {
          this.markdownContents.set(res.contents);
        },
        error: (error) => {
          //
        },
      });
    });
  }

  protected readonly ROUTE_PATHS = ROUTE_PATHS;
}
