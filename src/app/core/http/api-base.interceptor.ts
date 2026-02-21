import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbs = /^https?:\/\//i.test(req.url);
  const url = isAbs ? req.url : `${environment.apiBaseUrl}${req.url}`;

  return next(req.clone({ url }));
};
