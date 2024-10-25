import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { TokenResponse } from './auth.interface';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient)
  router = inject(Router)
  cookieService = inject(CookieService)

  baseApiUrl = 'https://icherniakov.ru/yt-course/auth'

  token: string|null = null
  refreshToken: string|null = null

  constructor() { }

  isAuth(){
    if (!this.token) {
      this.token = this.cookieService.get("access_token")
      this.refreshToken = this.cookieService.get("refresh_token")
    }

    return !!this.token
  }

  login(payload: {username: string, password: string}) {
    const formData = new FormData()
    formData.append('username',payload.username)
    formData.append('password',payload.password)
    return this.http.post<TokenResponse>(this.baseApiUrl + '/token', formData).pipe(
      tap((val) => {
        this.token = val.access_token
        this.refreshToken = val.refresh_token

        this.cookieService.set('access_token', this.token)
        this.cookieService.set('refresh_token', this.refreshToken)
      })
    )
  }


  refresh() {
    return this.http.post<TokenResponse>(this.baseApiUrl + '/refresh', {
      refresh_token: this.refreshToken
    }).pipe(
      catchError(error => {
        return throwError(() => {
          this.logout()
          return error
        })
      }),
      tap((val) => {
        this.token = val.access_token
        this.refreshToken = val.refresh_token

        this.cookieService.set('access_token', this.token)
        this.cookieService.set('refresh_token', this.refreshToken)
      })
    )
  }

  logout() {
    this.cookieService.deleteAll()
    this.token = null
    this.refreshToken = null
    this.router.navigate(['/login'])
  }
}
