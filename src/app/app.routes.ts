
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/search/pages/search-page/search-page').then(
        (m) => m.SearchPageComponent,
      ),
    title: 'GitHub Profile Finder',
  },
  {
    path: 'users/:username',
    loadComponent: () =>
      import('./features/profile/pages/profile-page/profile-page').then(
        (m) => m.ProfilePageComponent,
      ),
    title: 'GitHub Profile',
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found-page').then(
        (m) => m.NotFoundPageComponent,
      ),
    title: 'Page Not Found',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
