import { Component, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Article } from "../../core/models/post.model";
import { Router } from "@angular/router";
import { ROUTE_PATHS } from "../../core/router/route-paths";

@Component({
  standalone: true,
  selector: "app-article-card",
  imports: [CommonModule],
  styleUrls: ["./article-card.component.scss"],
  template: `
    <article class="card" (click)="handleCardClick()">
      <div class="card-emoji">{{ article().emoji || "📝" }}</div>
      <div class="card-body">
        <h3 class="card-title">{{ article().title }}</h3>
        <time class="card-date">{{ article().date | date: "yyyy.MM.dd" }}</time>
        @if (article().tags.length) {
          <div class="card-tags">
            @for (tag of article().tags; track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>
        }
      </div>
    </article>
  `,
})
export class ArticleCardComponent {
  private router = inject(Router);

  article = input.required<Article>();

  handleCardClick() {
    const a = this.article();
    this.router.navigate([ROUTE_PATHS.ARTICLES.ROOT], {
      queryParams: { pageId: a.id },
    });
  }
}
