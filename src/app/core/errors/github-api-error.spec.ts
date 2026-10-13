
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { normalizeGitHubError } from './github-api-error';

describe('normalizeGitHubError', () => {
  it('should identify a missing user', () => {
    const error = normalizeGitHubError(
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
      }),
    );

    expect(error.code).toBe('USER_NOT_FOUND');
  });

  it('should identify a rate limit response', () => {
    const error = normalizeGitHubError(
      new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        headers: new HttpHeaders({
          'x-ratelimit-remaining': '0',
        }),
      }),
    );

    expect(error.code).toBe('RATE_LIMIT');
  });

  it('should not classify every 403 as a rate limit', () => {
    const error = normalizeGitHubError(
      new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
      }),
    );

    expect(error.code).toBe('ACCESS_FORBIDDEN');
  });

  it('should identify a network error', () => {
    const error = normalizeGitHubError(
      new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
      }),
    );

    expect(error.code).toBe('NETWORK_ERROR');
  });

  it('should identify a GitHub server error', () => {
    const error = normalizeGitHubError(
      new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
      }),
    );

    expect(error.code).toBe('SERVER_ERROR');
  });
});
