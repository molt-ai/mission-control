// GitHub repo fetching from cached file (server-only)

import { promises as fs } from 'fs';
import path from 'path';
import { GitHubRepo } from './types';

export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'github-repos.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const repos = JSON.parse(content);
    
    return repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      updatedAt: repo.updatedAt,
      language: repo.primaryLanguage?.name || null,
      stars: repo.stargazerCount || 0,
      isPrivate: repo.isPrivate,
    }));
  } catch (e) {
    console.error('Failed to load GitHub repos:', e);
    return [];
  }
}
