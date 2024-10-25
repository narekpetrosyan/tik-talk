import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { catchError, switchMap, throwError } from "rxjs";

let isRefreshing = false

export const authTokenInterceptor:HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService)
    const token = authService.token

    if (!token) {
        return next(req)
    }

    if (isRefreshing) {
        return refreshAndProceed(authService,req,next)
    }

    req = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    })
    
    return next(req).pipe(
        catchError(err => {
            if (err.status === 403) {
                return refreshAndProceed(authService,req,next)
            }
            return throwError(() => err)
        })
    )
}

const refreshAndProceed = (authService: AuthService,req:HttpRequest<unknown>,next: HttpHandlerFn) => {
    if (!isRefreshing) {
        isRefreshing = true
        return authService.refresh().pipe(
            switchMap(({access_token}) => {
                isRefreshing = false
                return next(req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${access_token}`
                    }
                }))
            })
        )
    }
    
    return next(
        req.clone({
            setHeaders: {
                Authorization: `Bearer ${authService.token}`
            }
        })
    )
}
