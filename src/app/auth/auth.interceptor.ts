import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

const isRefreshing$ = new BehaviorSubject<boolean>(false);

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  if (!token) {
    return next(req);
  }

  if (isRefreshing$.value) {
    return refreshAndProceed(authService, req, next);
  }

  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(req).pipe(
    catchError(err => {
      if (err.status === 403) {
        return refreshAndProceed(authService, req, next);
      }
      return throwError(() => err);
    })
  );
};

const refreshAndProceed = (
  authService: AuthService,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (!isRefreshing$.value) {
    isRefreshing$.next(true);
    return authService.refresh().pipe(
      switchMap(({ access_token }) => {
        isRefreshing$.next(false);
        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${access_token}`,
            },
          })
        ).pipe(
          tap(() => {
            isRefreshing$.next(false);
          })
        );
      })
    );
  }

  if (req.url.includes('refresh')) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${authService.token}`,
        },
      })
    );
  }

  return isRefreshing$.pipe(
    filter(isRefreshing => !isRefreshing),
    switchMap(() => {
      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${authService.token}`,
          },
        })
      );
    })
  );

  // return next(
  //   req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${authService.token}`,
  //     },
  //   })
  // );
};
