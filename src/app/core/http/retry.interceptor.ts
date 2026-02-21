import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { retry, throwError, timer } from "rxjs";

export const retryInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    retry({
      count: 2,
      delay: (err, attempt) => {
        const retriable =
          req.method === "GET" &&
          err instanceof HttpErrorResponse &&
          err.status >= 500;
        return retriable
          ? timer(Math.min(500 * 2 ** attempt, 3000))
          : throwError(() => err);
      },
    }),
  );
