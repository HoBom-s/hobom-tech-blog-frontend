import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MarkdownModule, MARKED_OPTIONS } from "ngx-markdown";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { routes } from "./app.routes";
import { apiBaseInterceptor } from "./core/http/api-base.interceptor";
import { retryInterceptor } from "./core/http/retry.interceptor";
import { timeoutInterceptor } from "./core/http/timeout.interceptor";
import { errorInterceptor } from "./core/http/error.interceptor";
import { PostsPort } from "./core/ports/post.port";
import { PostsService } from "./core/services/post.service";

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  }),
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(MarkdownModule.forRoot()),
    provideHttpClient(
      withInterceptors([
        apiBaseInterceptor,
        retryInterceptor,
        timeoutInterceptor,
        errorInterceptor,
      ]),
    ),
    { provide: PostsPort, useClass: PostsService },
    {
      provide: MARKED_OPTIONS,
      useValue: {
        gfm: true,
        breaks: false,
      },
    },
  ],
};
