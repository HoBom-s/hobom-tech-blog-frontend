import { HttpInterceptorFn } from "@angular/common/http";
import { isPlatformServer } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment";

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbs = /^https?:\/\//i.test(req.url);
  if (isAbs) {
    return next(req);
  }

  // SSR(서버) 환경에서는 상대경로를 쓸 수 없어 절대 origin을 붙인다.
  const platformId = inject(PLATFORM_ID);
  const base = isPlatformServer(platformId)
    ? `${environment.siteUrl}${environment.apiBaseUrl}`
    : environment.apiBaseUrl;

  return next(req.clone({ url: `${base}${req.url}` }));
};
