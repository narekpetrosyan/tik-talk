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
  searchProfiles = signal<Profile[]>([]);

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

  getAccount(id: string) {
    return this.http
      .get<Profile>(`${this.baseApiUrl}/account/${id}`)
      .pipe(tap(val => this.me.set(val)));
  }

  patchProfile(profile: Partial<Profile>) {
    return this.http.patch(this.baseApiUrl + '/account/me', profile);
  }

  filterProfiles(params: Record<string, any>) {
    return this.http
      .get<Pagable<Profile>>(this.baseApiUrl + '/account/accounts', { params })
      .pipe(
        tap(val => {
          this.searchProfiles.set(val.items);
        })
      );
  }
}
