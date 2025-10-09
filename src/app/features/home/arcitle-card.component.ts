import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { Article } from "../../core/models/post.model";
import { Router } from "@angular/router";
import { ROUTE_PATHS } from "../../core/router/route-paths";

@Component({
  standalone: true,
  selector: "app-article-card",
  imports: [CommonModule, MatCardModule, MatChipsModule],
  styleUrls: ["./article-card.component.scss"],
  template: `
    <mat-card class="card mat-elevation-z2" (click)="handleCardClick()">
      <div class="header">
        <div class="emoji">{{ article.emoji || "📝" }}</div>
        <div class="title-block">
          <span class="mat-title-medium title">{{ article.title }}</span>
          <span class="date">{{ article.date | date: "mediumDate" }}</span>
        </div>
      </div>
    </mat-card>
  `,
})
export class ArticleCardComponent {
  @Input({ required: true })
  article!: Article;

  constructor(private router: Router) {}

  handleCardClick() {
    if (this.article == null) return;
    this.router.navigate([ROUTE_PATHS.ARTICLES.ROOT], {
      queryParams: {
        pageId: this.article.id,
        title: this.article.title,
      },
    });
  }
}
