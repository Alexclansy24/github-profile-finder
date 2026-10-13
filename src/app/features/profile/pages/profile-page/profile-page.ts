
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  catchError,
  map,
  merge,
  of,
  Subject,
  switchMap,
} from 'rxjs';

import {
  GitHubApiError,
  normalizeGitHubError,
} from '../../../../core/errors/github-api-error';
import { GitHubRepository } from '../../../../core/models/github-repository.model';
import { GitHubUser } from '../../../../core/models/github-user.model';
import { GitHubApiService } from '../../../../core/services/github-api.service';

interface RepositoryRequest {
  username: string;
  page: number;
  reset: boolean;
}

type RepositoryResult =
  | {
      kind: 'success';
      request: RepositoryRequest;
      repositories: GitHubRepository[];
    }
  | {
      kind: 'error';
      request: RepositoryRequest;
      error: GitHubApiError;
    };

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

  private readonly retryProfileTrigger = new Subject<void>();
  private readonly repositoryRequestTrigger = new Subject<RepositoryRequest>();

  readonly username = signal('');
  readonly profile = signal<GitHubUser | null>(null);
  readonly loading = signal(true);
  readonly error = signal<GitHubApiError | null>(null);

  readonly repositories = signal<GitHubRepository[]>([]);
  readonly repositoriesLoading = signal(true);
  readonly loadingMore = signal(false);
  readonly repositoryError = signal<GitHubApiError | null>(null);
  readonly hasMoreRepositories = signal(false);

  private readonly nextRepositoryPage = signal(2);
  private readonly repositoryErrorPage = signal(1);
  private readonly perPage = 100;

  constructor() {
    const routeUsername$ = this.route.paramMap.pipe(
      map((params) => params.get('username') ?? ''),
    );

    const retryProfileUsername$ = this.retryProfileTrigger.pipe(
      map(() => this.route.snapshot.paramMap.get('username') ?? ''),
    );

    merge(routeUsername$, retryProfileUsername$)
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
                error: this.toApiError(error),
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

    const initialRepositoryRequest$ = routeUsername$.pipe(
      map(
        (username): RepositoryRequest => ({
          username,
          page: 1,
          reset: true,
        }),
      ),
    );

    merge(
      initialRepositoryRequest$,
      this.repositoryRequestTrigger,
    )
      .pipe(
        switchMap((request)=> {
          if (request.reset) {
            this.repositories.set([]);
            this.nextRepositoryPage.set(2);
            this.hasMoreRepositories.set(false);
            this.repositoriesLoading.set(true);
            this.loadingMore.set(false);
          } else {
            this.loadingMore.set(true);
          }

          this.repositoryError.set(null);

          return this.api
            .getUserRepos(request.username, request.page, this.perPage)
            .pipe(
              map(
                (repositories): RepositoryResult => ({
                  kind: 'success',
                  request,
                  repositories,
                }),
              ),
              catchError((error: unknown) =>
                of<RepositoryResult>({
                  kind: 'error',
                  request,
                  error: this.toApiError(error),
                }),
              ),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.repositoriesLoading.set(false);
        this.loadingMore.set(false);

        if (result.kind === 'error') {
          this.repositoryError.set(result.error);
          this.repositoryErrorPage.set(result.request.page);
          return;
        }

        const { request, repositories } = result;

        this.repositories.update((current) =>
          request.reset ? repositories : [...current, ...repositories],
        );

        this.hasMoreRepositories.set(
          repositories.length === this.perPage,
        );

        this.nextRepositoryPage.set(request.page + 1);
      });
  }

  retryProfile(): void {
    this.retryProfileTrigger.next();
  }

  loadMoreRepositories(): void {
    if (
      !this.hasMoreRepositories() ||
      this.repositoriesLoading() ||
      this.loadingMore() ||
      this.repositoryError()
    ) {
      return;
    }

    this.repositoryRequestTrigger.next({
      username: this.username(),
      page: this.nextRepositoryPage(),
      reset: false,
    });
  }

  retryRepositories(): void {
    const page = this.repositoryErrorPage();

    this.repositoryRequestTrigger.next({
      username: this.username(),
      page,
      reset: page === 1,
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

  private toApiError(error: unknown): GitHubApiError {
    return error instanceof GitHubApiError
      ? error
      : normalizeGitHubError(error);
  }
}
