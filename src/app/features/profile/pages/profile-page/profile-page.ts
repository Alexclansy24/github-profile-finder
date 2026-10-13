
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, merge, of, Subject, switchMap } from 'rxjs';

import {
  GitHubApiError,
  normalizeGitHubError,
} from '../../../../core/errors/github-api-error';
import { GitHubUser } from '../../../../core/models/github-user.model';
import { GitHubApiService } from '../../../../core/services/github-api.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-page.html',
})
export class ProfilePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(GitHubApiService);
  private readonly retryTrigger = new Subject<void>();

  readonly username = signal('');
  readonly profile = signal<GitHubUser | null>(null);
  readonly loading = signal(true);
  readonly error = signal<GitHubApiError | null>(null);

  constructor() {
    const routeUsername$ = this.route.paramMap.pipe(
      map((params) => params.get('username') ?? ''),
    );

    const retryUsername$ = this.retryTrigger.pipe(
      map(() => this.route.snapshot.paramMap.get('username') ?? ''),
    );

    merge(routeUsername$, retryUsername$)
      .pipe(
        switchMap((username) => {
          this.username.set(username);
          this.profile.set(null);
          this.error.set(null);
          this.loading.set(true);

          return this.api.getUser(username).pipe(
            map((profile) => ({
              kind: 'success' as const,
              profile,
            })),
            catchError((error: unknown) =>
              of({
                kind: 'error' as const,
                error: normalizeGitHubError(error),
              }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.loading.set(false);

        if (result.kind === 'success') {
          this.profile.set(result.profile);
          return;
        }

        this.error.set(result.error);
      });
  }

  retry(): void {
    this.retryTrigger.next();
  }

  get joinedDate(): string {
    const createdAt = this.profile()?.created_at;

    if (!createdAt) {
      return '';
    }

    return new Date(createdAt).toLocaleDateString('en', {
      month: 'long',
      year: 'numeric',
    });
  }
}
