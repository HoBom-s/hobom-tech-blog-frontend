import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

import { Article } from "../../core/models/post.model";
import { PostsPort } from "../../core/ports/post.port";
import { SeoService } from "../../core/seo/seo.service";
import { ArticleCardComponent } from "./article-card.component";

@Component({
  standalone: true,
  selector: "app-home",
  imports: [CommonModule, ArticleCardComponent],
  styleUrls: ["./home.component.scss"],
  template: `
    <main id="main-content" class="page" role="main">
      <header class="hero" aria-label="프로필">
        <div class="hero-inner">
          <div class="hero-text">
            <h1 class="name">Software Engineer</h1>
          </div>
          <nav class="social-links" aria-label="소셜 링크">
            <a
              href="https://github.com/foxmon"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn"
              aria-label="GitHub 프로필 (새 탭에서 열림)"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/foxmon/"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn"
              aria-label="LinkedIn 프로필 (새 탭에서 열림)"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
              </svg>
              LinkedIn
            </a>
          </nav>
        </div>
      </header>

      <section class="card about" aria-label="소개">
        <p>
          배우고 고민한 것들을 기록으로 남기기 위해 쓰는 개발 블로그입니다.
          백엔드와 프론트엔드를 오가며 시스템을 설계하고 만드는 일을 좋아합니다.
        </p>
        <p>
          개인 프로젝트
          <a
            href="https://github.com/HoBom-s"
            target="_blank"
            rel="noopener noreferrer"
            >HoBom</a
          >을 통해 아키텍처와 분산 시스템을 직접 설계하고 운영하며 실험하고
          있습니다.
        </p>
        <div class="tech-stack" role="list" aria-label="기술 스택">
          @for (tech of techs; track tech) {
            <span class="chip" role="listitem">{{ tech }}</span>
          }
        </div>
      </section>

      <section class="card articles" aria-label="게시글 목록">
        <h2 class="section-title">Articles</h2>
        @if (!articles().length && loading()) {
          <div class="spinner-wrap" role="status" aria-label="글을 불러오는 중">
            <div class="spinner"></div>
          </div>
        }
        @if (articles().length) {
          <div class="article-list" role="feed" aria-label="블로그 글">
            @for (article of articles(); track article.id) {
              <app-article-card [article]="article"></app-article-card>
            }
          </div>
        }
      </section>
    </main>
  `,
})
export class HomeComponent implements OnInit {
  private postsPort = inject(PostsPort);
  private seo = inject(SeoService);

  articles = signal<Article[]>([]);
  cursor = signal<string | null | undefined>(null);
  hasMore = signal<boolean>(false);
  loading = signal<boolean>(false);

  techs = [
    "React",
    "TypeScript",
    "NestJS",
    "Spring Boot",
    "Kotlin",
    "Go",
    ".NET",
    "PostgreSQL",
    "MongoDB",
    "Kafka",
    "Redis",
    "Docker",
  ];

  ngOnInit() {
    this.seo.setDefault();
    this.fetch();
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
