
import { HttpErrorResponse } from '@angular/common/http';

export type GitHubApiErrorCode =
  | 'USER_NOT_FOUND'
  | 'RATE_LIMIT'
  | 'ACCESS_FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly code: GitHubApiErrorCode,
    public readonly status: number | null = null,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export function normalizeGitHubError(error: unknown): GitHubApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return new GitHubApiError(
      'An unexpected error occurred. Please try again.',
      'UNKNOWN_ERROR',
    );
  }

  if (error.status === 0) {
    return new GitHubApiError(
      'Unable to connect to GitHub. Check your internet connection and try again.',
      'NETWORK_ERROR',
      0,
    );
  }

  const apiMessage =
    typeof error.error?.message === 'string'
      ? error.error.message.toLowerCase()
      : '';

  const remainingRequests = error.headers.get('x-ratelimit-remaining');

  if (
    error.status === 429 ||
    remainingRequests === '0' ||
    apiMessage.includes('rate limit')
  ) {
    return new GitHubApiError(
      'GitHub API rate limit reached. Please wait before trying again.',
      'RATE_LIMIT',
      error.status,
    );
  }

  if (error.status === 404) {
    return new GitHubApiError(
      'The requested GitHub user or resource was not found.',
      'USER_NOT_FOUND',
      404,
    );
  }

  if (error.status === 403) {
    return new GitHubApiError(
      'GitHub denied this request. The resource may be restricted, or access may be temporarily limited.',
      'ACCESS_FORBIDDEN',
      403,
    );
  }

  if (error.status >= 500) {
    return new GitHubApiError(
      'GitHub is experiencing a server problem. Please try again later.',
      'SERVER_ERROR',
      error.status,
    );
  }

  if (error.status >= 400) {
    return new GitHubApiError(
      'GitHub could not process this request.',
      'INVALID_REQUEST',
      error.status,
    );
  }

  return new GitHubApiError(
    'An unexpected error occurred. Please try again.',
    'UNKNOWN_ERROR',
    error.status,
  );
}
