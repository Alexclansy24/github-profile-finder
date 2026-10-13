
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { normalizeGitHubError } from '../errors/github-api-error';
import { GitHubRepository } from '../models/github-repository.model';
import { GitHubUser } from '../models/github-user.model';

@Injectable({
  providedIn: 'root',
})
export class GitHubApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.github.com';

  getUser(username: string) {
    const encodedUsername = encodeURIComponent(username.trim());

    return this.http
      .get<GitHubUser>(`${this.baseUrl}/users/${encodedUsername}`)
      .pipe(
        catchError((error: unknown) =>
          throwError(() => normalizeGitHubError(error)),
        ),
      );
  }

  getUserRepos(
    username: string,
    page = 1,
    perPage = 100,
  ) {
    const encodedUsername = encodeURIComponent(username.trim());

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http
      .get<GitHubRepository[]>(
        `${this.baseUrl}/users/${encodedUsername}/repos`,
        { params },
      )
      .pipe(
        catchError((error: unknown) =>
          throwError(() => normalizeGitHubError(error)),
        ),
      );
  }
}
