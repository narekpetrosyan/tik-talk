import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../data/services/profile.service';
import { SubscriberCardComponent } from './subscriber-card/subscriber-card.component';
import { AsyncPipe } from '@angular/common';
import { firstValueFrom, map } from 'rxjs';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SubscriberCardComponent, AsyncPipe, ImgUrlPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  profileService = inject(ProfileService);
  subscribers$ = this.profileService
    .getSubscribersShortList()
    .pipe(map(val => val.items.slice(0, 3)));

  me = this.profileService.me;

  ngOnInit() {
    firstValueFrom(this.profileService.getMe());
  }
}
