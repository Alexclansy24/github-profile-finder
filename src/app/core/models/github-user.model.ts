
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}
