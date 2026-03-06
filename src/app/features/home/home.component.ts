import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

import { Article } from "../../core/models/post.model";
import { PostsPort } from "../../core/ports/post.port";
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
            <h1 class="name">JunHo Kim</h1>
            <p class="role">Software Engineer</p>
          </div>
          <nav class="social-links" aria-label="소셜 링크">
            <a
              href="https://github.com/foxmon"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn"
              aria-label="GitHub 프로필 (새 탭에서 열림)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/%EC%A4%80%ED%98%B8-%EA%B9%80-b76685254/"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn"
              aria-label="LinkedIn 프로필 (새 탭에서 열림)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </nav>
        </div>
      </header>

      <section class="card about" aria-label="소개">
        <p>
          B2B SaaS, EdTech, 인터넷 은행 도메인에서 실무 경험을 쌓아온 소프트웨어 엔지니어입니다.
          WebRTC 기반 학습 플랫폼부터 대출 심사 엔진까지, 성능과 유지보수성, 사용자 경험의 균형을 고민하며 시스템을 설계하고 만들어 왔습니다.
        </p>
        <p>
          개인 프로젝트
          <a href="https://hobom-system.com" target="_blank" rel="noopener noreferrer">HoBom</a>을
          통해 Hexagonal Architecture, gRPC, Kafka, Redis 기반의 이벤트 드리븐 시스템을
          직접 설계·구축·운영하고 있으며, 단일 서버 위에서 6개의 서비스와 CI/CD 파이프라인까지
          관리하는 1인 인프라 운영 경험을 쌓고 있습니다.
        </p>
        <p>
          Clean Architecture와 TDD를 기반으로 지속 가능한 코드를 지향하며,
          제품의 비전과 기술적 실행 사이의 간극을 좁히는 데 관심이 많습니다.
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
