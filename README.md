# GitHub Profile Finder

A responsive Angular application for exploring public GitHub profiles
and repositories. Enter a GitHub username to view profile details,
browse public repositories, and search, filter, and sort the
repositories directly in the browser.

> **Project status:** Local development project. Add your deployed URL
> and screenshots here after deployment.

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [How It Works](#how-it-works)
-   [Getting Started](#getting-started)
-   [Available Commands](#available-commands)
-   [Project Structure](#project-structure)
-   [GitHub API and Rate Limits](#github-api-and-rate-limits)
-   [Error Handling](#error-handling)
-   [Testing](#testing)
-   [Accessibility and Responsive
    Design](#accessibility-and-responsive-design)
-   [Limitations](#limitations)
-   [Possible Future Improvements](#possible-future-improvements)
-   [License](#license)

## Overview

GitHub Profile Finder uses GitHub's public REST API to retrieve profile
and repository information without requiring a custom backend or
database.

The application is built with Angular standalone components and Angular
Router. RxJS is used to coordinate asynchronous API requests, while
Angular Signals and computed values manage reactive UI state and derived
repository lists.

### What you can do

1.  Search for a GitHub user by username.
2.  View the user's avatar, name, bio, company, location, blog, GitHub
    profile link, public repository count, followers, following, and
    account creation date.
3.  Browse public repositories in pages of up to 100 results.
4.  Search the repositories already loaded by repository name or
    description.
5.  Filter loaded repositories by programming language.
6.  Sort loaded repositories by last updated, stars, or repository name.
7.  Retry failed profile or repository requests and load additional
    repository pages.

## Features

-   **Profile lookup:** Fetches public user details from GitHub.
-   **Repository browsing:** Displays repository descriptions, primary
    language, star count, fork count, and last-updated date.
-   **Pagination:** Loads repositories in pages of up to 100, instead of
    requesting all pages at once.
-   **Client-side search:** Searches the repositories currently loaded
    in the application.
-   **Language filtering:** Offers language options based on the loaded
    repositories.
-   **Sorting:** Supports recently updated, most stars, and alphabetical
    repository-name ordering.
-   **Loading states:** Displays loading feedback while profile or
    repository data is being fetched.
-   **Error and retry states:** Provides recovery actions for failed
    requests.
-   **Route-based profiles:** Uses `/users/:username` so a profile has a
    shareable URL.
-   **Responsive layout:** Adapts the interface to different screen
    sizes.
-   **System theme:** Uses the operating system's light or dark color
    preference.
-   **No backend required:** Communicates directly with GitHub's public
    API.

## Technology Stack

  -----------------------------------------------------------------------
  Technology                          Function in this project
  ----------------------------------- -----------------------------------
  **Angular 22**                      Frontend framework for building the
                                      application UI and organizing
                                      components and services.

  **TypeScript**                      Adds static types to models,
                                      services, and component logic.

  **Angular standalone components**   Let components declare their own
                                      dependencies without requiring
                                      feature NgModules.

  **Angular Router**                  Handles the home/search route, user
                                      profile route, and not-found route.

  **Angular HttpClient**              Sends HTTP requests to the GitHub
                                      REST API.

  **RxJS**                            Coordinates asynchronous streams
                                      and API requests. Operators such as
                                      `switchMap`, `merge`, `map`,
                                      `catchError`, and
                                      `takeUntilDestroyed` are used in
                                      request flows.

  **Angular Signals**                 Stores reactive UI state such as
                                      the current profile, loading
                                      status, repositories, selected
                                      language, search query, and sort
                                      order.

  **`computed()`**                    Derives available languages and the
                                      filtered/sorted repository list
                                      from reactive state.

  **Tailwind CSS**                    Provides utility classes for
                                      styling and responsive layouts.

  **Vitest**                          Runs unit tests.

  **Angular HTTP testing utilities**  Mock HTTP requests in service tests
                                      without calling the real GitHub
                                      API.

  **GitHub REST API**                 Supplies public profile and
                                      repository data.

  **npm**                             Installs and manages project
                                      dependencies and runs scripts.
  -----------------------------------------------------------------------

## How It Works

### 1. Search for a user

The user enters a GitHub username in the search form. The application
validates that the input is not empty and navigates to
`/users/:username`.

### 2. Load the profile

The profile page reads the username from the route and requests:

``` text
GET https://api.github.com/users/{username}
```

The returned public user data is displayed in the profile overview.

### 3. Load repositories

The application requests public repositories from:

``` text
GET https://api.github.com/users/{username}/repos?page=1&per_page=100
```

Additional pages are requested when the user chooses to load more
repositories. The application retains repositories already loaded if a
later page request fails.

### 4. Search, filter, and sort

Repository search, language filtering, and sorting are performed in the
browser against the repositories loaded so far. They do not send a new
API request. Loading another page adds more repositories to the set that
can be searched, filtered, and sorted.

### 5. Handle request changes and errors

RxJS `switchMap()` switches to the latest route-driven request, helping
prevent an older request from overwriting the result for a newer
username. Errors are normalized into application-level error types so
the UI can show appropriate messages and retry actions.

## Getting Started

### Prerequisites

-   Node.js compatible with the installed Angular CLI version.
-   npm, which is included with Node.js.
-   Git, if you plan to clone the repository.

Check your installed versions:

``` bash
node --version
npm --version
```

The project was developed with Angular CLI **22.2.2**, Node.js
**24.21.0**, and npm **11.19.0**. Use a Node.js version supported by
your installed Angular version.

### 1. Clone the repository

Replace `<your-repository-url>` with the URL of your Git repository:

``` bash
git clone <your-repository-url>
cd github-profile-finder
```

If you already have the project locally, open a terminal in the project
root instead.

### 2. Install dependencies

``` bash
npm install
```

### 3. Start the development server

``` bash
npm start
```

Open the local URL printed in the terminal by Angular CLI (commonly
`http://localhost:4200`).

The development server watches the source files and rebuilds when
changes are saved.

## Available Commands

Run these commands from the project root:

  -----------------------------------------------------------------------
  Command                             Purpose
  ----------------------------------- -----------------------------------
  `npm start`                         Starts the Angular development
                                      server.

  `npx ng build`                      Builds the application for
                                      production.

  `npx ng test --watch=false`         Runs the test suite without watch
                                      mode.

  `npx ng test`                       Runs tests using the configured
                                      test runner in its default mode.

  `npx ng version`                    Displays Angular CLI, Angular,
                                      Node.js, and package-manager
                                      versions.

  `npm ls typescript rxjs`            Displays the installed TypeScript
                                      and RxJS dependency versions.
  -----------------------------------------------------------------------

## Project Structure

The following is a guide to the main application areas. The exact
generated configuration files may vary depending on the Angular CLI
setup.

``` text
github-profile-finder/
├── public/                         # Static public assets, if used
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── errors/
│   │   │   │   └── github-api-error.ts
│   │   │   ├── models/
│   │   │   │   ├── github-user.model.ts
│   │   │   │   └── github-repository.model.ts
│   │   │   └── services/
│   │   │       └── github-api.service.ts
│   │   ├── features/
│   │   │   ├── search/
│   │   │   │   └── pages/search-page/
│   │   │   └── profile/
│   │   │       └── pages/profile-page/
│   │   ├── shared/
│   │   │   └── pages/not-found/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.ts
│   │   └── app.html
│   ├── styles.css
│   ├── main.ts
│   └── index.html
├── tsconfig.json
├── package.json
└── README.md
```

### Main areas

-   **`core/models/`** --- TypeScript interfaces describing GitHub user
    and repository API responses.
-   **`core/services/github-api.service.ts`** --- Centralizes HTTP calls
    to the GitHub API and normalizes request errors.
-   **`core/errors/`** --- Defines application-level API error codes and
    maps HTTP failures to those codes.
-   **`features/search/`** --- Contains the username search page and
    input validation.
-   **`features/profile/`** --- Contains profile loading, repository
    pagination, filtering, sorting, and retry behavior.
-   **`shared/pages/not-found/`** --- Displays a not-found page for
    unknown routes.
-   **`app.routes.ts`** --- Defines application routes, including
    `/users/:username`.
-   **`app.config.ts`** --- Registers application-level providers such
    as routing and `HttpClient`.
-   **`styles.css`** --- Holds global styling and light/dark theme
    rules.

## GitHub API and Rate Limits

The application uses the public GitHub REST API without authentication.
No personal access token is required for this project.

Unauthenticated requests are subject to GitHub's rate limits. If the
limit is reached, the application should show the relevant error state
and allow the user to try again later.

Repository search, language filtering, and sorting only operate on data
already loaded into the browser. A repository may not appear in the
filtered results until its page has been loaded.

For current API limits and behavior, consult the [GitHub REST API
documentation](https://docs.github.com/en/rest).

## Error Handling

The application normalizes API failures into categories such as:

-   **User not found (`404`):** The requested username does not exist or
    the requested resource is unavailable.
-   **Rate limit:** GitHub indicates that the API request limit has been
    reached.
-   **Access forbidden (`403`):** The request is forbidden for a reason
    other than a confirmed rate limit.
-   **Network error:** The browser could not complete the request.
-   **Server error (`5xx`):** GitHub returned a server-side error.
-   **Invalid request (`4xx`):** The API rejected the request.
-   **Unknown error:** The failure does not match a known category.

A `403` response is not automatically treated as a rate-limit error. The
application checks available response information before classifying it.

Profile and repository loading have separate states. If loading an
additional repository page fails, already loaded repositories are
retained and the failed page can be retried.

## Testing

The project uses Vitest with Angular's testing utilities.

The service tests cover behavior such as:

-   Fetching a GitHub user.
-   Requesting repositories with pagination parameters.
-   Normalizing a missing-user response.
-   Classifying rate-limit, forbidden, network, and server errors.

Run the tests with:

``` bash
npx ng test --watch=false
```

Build the project with:

``` bash
npx ng build
```

Run these commands before publishing a release. Add tests for any new
behavior as the project evolves.

## Accessibility and Responsive Design

The interface should be usable with keyboard navigation and provide
meaningful labels and error feedback. Profile and repository loading
states should be understandable without relying only on color. Check the
layout at mobile, tablet, and desktop widths before deployment.

## Limitations

-   Only public GitHub profile and repository information is displayed.
-   No sign-in, private repository access, or write operations are
    supported.
-   There is no backend or database.
-   API requests are subject to GitHub's unauthenticated rate limits.
-   Search, language filtering, and sorting apply only to repositories
    loaded so far.
-   Data is not persisted between visits.
-   API availability and response time depend on GitHub.

## Possible Future Improvements

-   Add screenshots and a live demo link.
-   Add repository topics and additional profile details.
-   Add more filters, such as fork status.
-   Improve automated tests for route changes, pagination retries, and
    combined filters.
-   Add a deployment workflow and verify direct URL refreshes on the
    selected host.

## License

MIT License

Copyright (c) [2026] [rakesh paramanick]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.