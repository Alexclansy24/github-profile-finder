
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { GitHubApiService } from './github-api.service';
import { GitHubApiError } from '../errors/github-api-error';

describe('GitHubApiService', () => {
  let service: GitHubApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(GitHubApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch a GitHub user by username', () => {
    const mockUser = {
      id: 1,
      login: 'octocat',
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://github.com/octocat',
      name: 'The Octocat',
      bio: null,
      company: null,
      location: null,
      blog: '',
      public_repos: 8,
      followers: 10,
      following: 5,
      created_at: '2011-01-25T18:44:36Z',
    };

    let result: unknown;

    service.getUser('octocat').subscribe((user) => {
      result = user;
    });

    const request = httpTesting.expectOne(
      'https://api.github.com/users/octocat',
    );

    expect(request.request.method).toBe('GET');
    request.flush(mockUser);

    expect(result).toEqual(mockUser);
  });

  it('should request repositories with pagination parameters', () => {
    service.getUserRepos('octocat', 2, 100).subscribe();

    const request = httpTesting.expectOne(
      (req) =>
        req.url === 'https://api.github.com/users/octocat/repos' &&
        req.params.get('page') === '2' &&
        req.params.get('per_page') === '100',
    );

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should normalize a missing user into a GitHubApiError', () => {
    let receivedError: unknown;

    service.getUser('missing-user').subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const request = httpTesting.expectOne(
      'https://api.github.com/users/missing-user',
    );

    request.flush(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(receivedError).toBeInstanceOf(GitHubApiError);
    expect((receivedError as GitHubApiError).code).toBe('USER_NOT_FOUND');
  });
});
