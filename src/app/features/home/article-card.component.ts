import { Component, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { Article } from "../../core/models/post.model";
import { Router } from "@angular/router";
import { ROUTE_PATHS } from "../../core/router/route-paths";

@Component({
  standalone: true,
  selector: "app-article-card",
  imports: [CommonModule, MatCardModule],
  styleUrls: ["./article-card.component.scss"],
  template: `
    <mat-card class="card mat-elevation-z2" (click)="handleCardClick()">
      <div class="header">
        <div class="emoji">{{ article().emoji || "📝" }}</div>
        <div class="meta">
          <div class="top-row">
            <span class="mat-title-medium title">{{ article().title }}</span>
            <span class="date">{{ article().date | date: "mediumDate" }}</span>
          </div>
          @if (article().tags.length) {
            <div class="tag-list">
              @for (tag of article().tags; track tag) {
                <span class="tag-badge">{{ tag }}</span>
              }
            </div>
          }
        </div>
      </div>
    </mat-card>
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
