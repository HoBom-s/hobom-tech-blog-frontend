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
  ],
  providers: [{ provide: PostsPort, useClass: PostsService }],
  styleUrls: ["./home.component.scss"],
  template: `
    <section class="hero">
      <h1 class="title">HoBom Engineering</h1>
      <p class="subtitle">
        Notes on building scalable systems — from hexagonal architectures & data
        pipelines to reactive frontends. Curated directly from Notion via our
        Spring parser API.
      </p>
      <div style="margin-top:18px;">
        <button
          mat-raised-button
          color="primary"
          (click)="refresh()"
          [disabled]="loading()"
        >
          <mat-icon>refresh</mat-icon>&nbsp;{{
            loading() ? "Refreshing..." : "Refresh"
          }}
        </button>
      </div>
    </section>

    <!-- FEATURED / LATEST -->
    <main class="container">
      <h2 class="mat-headline-small" style="margin: 8px 0 12px;">
        Latest articles
      </h2>
      <section class="grid" *ngIf="articles()?.length; else loadingTpl">
        <mat-card
          class="card mat-elevation-z2"
          *ngFor="let a of articles(); trackBy: trackById"
        >
          <div class="header">
            <div class="emoji">{{ a.emoji || "📝" }}</div>
            <div class="title-row">
              <div class="mat-title-medium">{{ a.title }}</div>
              <div class="date">{{ a.date | date: "mediumDate" }}</div>
            </div>
          </div>
          <div class="content"></div>
          <div class="chips" *ngIf="a.tags?.length">
            <mat-chip-set>
              <mat-chip *ngFor="let t of a.tags">{{ t }}</mat-chip>
            </mat-chip-set>
          </div>
        </mat-card>
      </section>

      <ng-template #loadingTpl>
        <div class="loadmore" style="padding:40px;">
          <mat-progress-spinner
            diameter="40"
            mode="indeterminate"
          ></mat-progress-spinner>
        </div>
      </ng-template>
      <div class="loadmore" *ngIf="hasMore()">
        <button
          mat-stroked-button
          color="primary"
          (click)="loadMore()"
          [disabled]="loading()"
        >
          {{ loading() ? "Loading..." : "Load more" }}
        </button>
      </div>
      <p class="cta">
        Want more? Connect the detail route later (e.g.
        <code>/posts/:slug</code>) and render full contentHtml.
      </p>
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

  refresh() {
    this.articles.set([]);
    this.cursor.set(null);
    this.hasMore.set(false);
    this.fetch();
  }

  loadMore() {
    if (this.loading() || !this.hasMore()) {
      return;
    }
    this.fetch(this.cursor());
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

  trackById = (_: number, a: Article) => a.id;
}
