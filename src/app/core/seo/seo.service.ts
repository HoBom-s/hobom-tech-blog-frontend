import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

import { environment } from "../../../environments/environment";

const SITE_NAME = "HoBom Tech Blog";
const DEFAULT_DESCRIPTION =
  "HoBom 기술 블로그. 시스템 설계, 아키텍처, 백엔드/프론트엔드 개발에 대한 글을 씁니다.";
const JSON_LD_ID = "ld-article";

export interface ArticleSeo {
  title: string;
  description: string;
  url: string;
  tags: string[];
}

@Injectable({ providedIn: "root" })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  setArticle(article: ArticleSeo): void {
    const fullTitle = `${article.title} | ${SITE_NAME}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: "description", content: article.description });
    if (article.tags.length) {
      this.meta.updateTag({
        name: "keywords",
        content: article.tags.join(", "),
      });
    }
    this.meta.updateTag({ property: "og:type", content: "article" });
    this.meta.updateTag({ property: "og:title", content: fullTitle });
    this.meta.updateTag({
      property: "og:description",
      content: article.description,
    });
    this.meta.updateTag({ property: "og:url", content: article.url });
    this.meta.updateTag({ name: "twitter:title", content: fullTitle });
    this.meta.updateTag({
      name: "twitter:description",
      content: article.description,
    });
    this.setCanonical(article.url);
    this.setJsonLd({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      url: article.url,
      ...(article.tags.length ? { keywords: article.tags.join(", ") } : {}),
      author: {
        "@type": "Person",
        name: "HoBom",
        url: "https://github.com/foxmon",
      },
      inLanguage: "ko",
    });
  }

  setDefault(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.updateTag({ name: "description", content: DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: "og:type", content: "website" });
    this.meta.updateTag({ property: "og:title", content: SITE_NAME });
    this.meta.updateTag({
      property: "og:description",
      content: DEFAULT_DESCRIPTION,
    });
    this.meta.updateTag({
      property: "og:url",
      content: `${environment.siteUrl}/`,
    });
    this.meta.updateTag({ name: "twitter:title", content: SITE_NAME });
    this.meta.updateTag({
      name: "twitter:description",
      content: DEFAULT_DESCRIPTION,
    });
    this.setCanonical(`${environment.siteUrl}/`);
    this.removeJsonLd();
  }

  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = this.doc.createElement("link");
      link.setAttribute("rel", "canonical");
      this.doc.head.appendChild(link);
    }
    link.setAttribute("href", url);
  }

  private setJsonLd(data: Record<string, unknown>): void {
    let script = this.doc.getElementById(
      JSON_LD_ID,
    ) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement("script");
      script.type = "application/ld+json";
      script.id = JSON_LD_ID;
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  private removeJsonLd(): void {
    this.doc.getElementById(JSON_LD_ID)?.remove();
  }
}
