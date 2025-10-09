import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { Article, ArticleType } from "../../core/models/post.model";
import { PostsService } from "../../core/services/post.service";
import { PostsPort } from "../../core/ports/post.port";
import { ArticleCardComponent } from "./arcitle-card.component";
import { MatTab, MatTabGroup } from "@angular/material/tabs";

@Component({
  standalone: true,
  selector: "app-home",
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ArticleCardComponent,
    MatTabGroup,
    MatTab,
  ],
  providers: [{ provide: PostsPort, useClass: PostsService }],
  styleUrls: ["./home.component.scss"],
  template: `
    <main class="container">
      <mat-tab-group
        mat-stretch-tabs="false"
        mat-align-tabs="start"
        style="margin-bottom: 16px"
      >
        <mat-tab label="Articles" />
      </mat-tab-group>
      @if (articles().length) {
        <section class="grid">
          @for (article of articles(); track article.id) {
            <app-article-card [article]="article"></app-article-card>
          }
        </section>
      }
    </main>
  `,
})
export class HomeComponent {
  private postsPort = inject(PostsPort);

  articles = signal<Article[]>([]);
  cursor = signal<string | null | undefined>(null);
  hasMore = signal<boolean>(false);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.fetch();
  }

  private fetch(cursor?: string | null) {
    this.loading.set(true);
    this.postsPort.listCursor({ cursor, limit: 20 }).subscribe({
      next: (res: ArticleType) => {
        this.articles.set([...this.articles(), ...res.articles]);
        this.cursor.set(res.nextCursor ?? null);
        this.hasMore.set(Boolean(res.hasMore));
        this.loading.set(false);
      },
      error: (err) => {
        console.error("[Home] fetch error", err);
        this.loading.set(false);
      },
    });
  }
}
