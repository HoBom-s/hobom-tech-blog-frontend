import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { Article } from "../../core/models/post.model";
import { PostsPort } from "../../core/ports/post.port";
import { ArticleCardComponent } from "./article-card.component";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import {
  MatActionList,
  MatListItem,
  MatListItemTitle,
} from "@angular/material/list";

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
    MatActionList,
    MatListItem,
    MatListItemTitle,
  ],
  styleUrls: ["./home.component.scss"],
  template: `
    <main class="container">
      <mat-tab-group
        [selectedIndex]="selectedIndex()"
        (selectedIndexChange)="onIndexChange($event)"
        mat-stretch-tabs="false"
        mat-align-tabs="start"
        class="tab-group"
      >
        <mat-tab label="Profile"></mat-tab>
        <mat-tab label="Articles"></mat-tab>
      </mat-tab-group>
      @if (selectedIndex() === 1) {
        @if (!articles().length && loading()) {
          <div class="spinner-wrap">
            <mat-progress-spinner
              mode="indeterminate"
              [diameter]="40"
              aria-label="Loading"
            ></mat-progress-spinner>
          </div>
        }

        @if (articles().length) {
          <section class="grid">
            @for (article of articles(); track article.id) {
              <app-article-card [article]="article"></app-article-card>
            }
          </section>
        }
      } @else if (selectedIndex() === 0) {
        <section class="profile">
          <mat-card>
            <mat-card-header>
              <mat-card-title class="profile-name">JunHo Kim</mat-card-title>
              <mat-card-subtitle>Software Engineer · Korea</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>
                Product-driven Software Engineer with hands-on experience across
                B2B SaaS, EdTech, and digital banking domains. Proven track
                record in architecting, building, and scaling robust
                systems—from WebRTC-powered learning platforms to
                mission-critical loan approval engines—balancing performance,
                maintainability, and user experience. Skilled in driving
                modernization initiatives through Clean Architecture, TDD, and
                scalable frontend patterns. Committed to continuous learning
                through personal projects and cross-functional collaboration.
                Passionate about bridging product vision with technical
                execution to deliver lasting impact in fast-paced environments.
              </p>
              <mat-chip-set>
                <mat-chip>React</mat-chip>
                <mat-chip>NestJS</mat-chip>
                <mat-chip>Spring Boot</mat-chip>
              </mat-chip-set>
            </mat-card-content>
            <mat-action-list class="social">
              <a
                mat-list-item
                class="social-item"
                href="https://github.com/foxmon"
                target="_blank"
                rel="noopener"
              >
                <mat-icon matListItemIcon>code</mat-icon>
                <div matListItemTitle>GitHub</div>
              </a>
              <a
                mat-list-item
                class="social-item"
                href="https://www.linkedin.com/in/%EC%A4%80%ED%98%B8-%EA%B9%80-b76685254/"
                target="_blank"
                rel="noopener"
              >
                <mat-icon matListItemIcon>work</mat-icon>
                <div matListItemTitle>LinkedIn</div>
              </a>
            </mat-action-list>
          </mat-card>
        </section>
      }
    </main>
  `,
})
export class HomeComponent implements OnInit {
  private postsPort = inject(PostsPort);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedIndex = signal<number>(0);
  articles = signal<Article[]>([]);
  cursor = signal<string | null | undefined>(null);
  hasMore = signal<boolean>(false);
  loading = signal<boolean>(false);

  ngOnInit() {
    const tab = Number(this.route.snapshot.queryParamMap.get("tab")) || 0;
    this.selectedIndex.set(tab);
    this.fetch();
  }

  onIndexChange(index: number) {
    this.selectedIndex.set(index);
    this.router.navigate([], {
      queryParams: { tab: index },
      replaceUrl: true,
    });
  }

  private fetch(cursor?: string | null) {
    this.loading.set(true);
    this.postsPort.listCursor({ cursor, limit: 20 }).subscribe({
      next: (res) => {
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
