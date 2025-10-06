import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { apiBaseInterceptor } from "./core/http/api-base.interceptor";
import { retryInterceptor } from "./core/http/retry.interceptor";
import { timeoutInterceptor } from "./core/http/timeout.interceptor";
import { errorInterceptor } from "./core/http/error.interceptor";
import { PostsPort } from "./core/ports/post.port";
import { PostsService } from "./core/services/post.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        apiBaseInterceptor,
        retryInterceptor,
        timeoutInterceptor,
        errorInterceptor,
      ]),
    ),
    { provide: PostsPort, useClass: PostsService },
  ],
};
