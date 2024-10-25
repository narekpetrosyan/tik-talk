import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { Pagable } from '../interfaces/pagable.interface';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  http = inject(HttpClient);

  baseApiUrl = 'https://icherniakov.ru/yt-course';

  me = signal<Profile | null>(null);

  getTestAccounts() {
    return this.http.get<Profile[]>(this.baseApiUrl + '/account/test_accounts');
  }

  getSubscribersShortList() {
    return this.http.get<Pagable<Profile>>(
      this.baseApiUrl + '/account/subscribers/'
    );
  }

  getMe() {
    return this.http
      .get<Profile>(this.baseApiUrl + '/account/me')
      .pipe(tap(val => this.me.set(val)));
  }
}
