/**
 * projects.js
 * Fetches repos from the GitHub API for PenguineDavid and renders them
 * into .content-area as a vertical list. Results are cached in localStorage
 * and reused for one hour before re-fetching.
 */

const GITHUB_USER = 'PenguineDavid';
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const CACHE_KEY = 'gh_repos_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/* -- CACHE -------------------------------------------------------------------- */

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { timestamp, repos } = JSON.parse(raw);
        if (Date.now() - timestamp > CACHE_TTL_MS) return null;
        return repos;
    } catch {
        return null;
    }
}

function writeCache(repos) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            repos
        }));
    } catch {
        // localStorage full or unavailable - silently skip caching
    }
}

/* -- FETCH --------------------------------------------------------------------- */

async function fetchRepos() {
    const cached = readCache();
    if (cached) return cached;

    const res = await fetch(API_URL, {
        headers: { 'Accept': 'application/vnd.github+json' }
    });

    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

    const repos = await res.json();
    writeCache(repos);
    return repos;
}

/* -- RENDER -------------------------------------------------------------------- */

function languageTag(lang) {
    if (!lang) return '';
    return `<span class="repo-lang">${lang}</span>`;
}

function renderRepos(repos) {
    // Filter out forks if desired - remove the filter() call to include them
    const sorted = repos
        .filter(r => !r.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const list = document.createElement('ul');
    list.className = 'repo-list';

    for (const repo of sorted) {
        const updated = new Date(repo.updated_at).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        const stars = repo.stargazers_count > 0
            ? `<span class="repo-stat">&#9733; ${repo.stargazers_count}</span>`
            : '';

        const forks = repo.forks_count > 0
            ? `<span class="repo-stat">&#8982; ${repo.forks_count}</span>`
            : '';

        const li = document.createElement('li');
        li.className = 'repo-card';
        li.innerHTML = `
            <div class="repo-header">
                <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener">
                    ${repo.name}
                </a>
                <div class="repo-meta">
                    ${languageTag(repo.language)}
                    ${stars}
                    ${forks}
                    <span class="repo-updated">updated ${updated}</span>
                </div>
            </div>
            ${repo.description
                ? `<p class="repo-desc">${repo.description}</p>`
                : '<p class="repo-desc repo-desc--empty">No description.</p>'
            }
            ${repo.topics && repo.topics.length
                ? `<div class="repo-topics">${repo.topics.map(t => `<span class="repo-topic">${t}</span>`).join('')}</div>`
                : ''
            }
        `;
        list.appendChild(li);
    }

    return list;
}

function renderError(msg) {
    const el = document.createElement('p');
    el.className = 'repo-error';
    el.textContent = `Failed to load repositories: ${msg}`;
    return el;
}

function renderSkeleton(count = 5) {
    const list = document.createElement('ul');
    list.className = 'repo-list';
    for (let i = 0; i < count; i++) {
        const li = document.createElement('li');
        li.className = 'repo-card repo-card--skeleton';
        li.innerHTML = `
            <div class="repo-header">
                <div class="skel skel--name"></div>
                <div class="skel skel--meta"></div>
            </div>
            <div class="skel skel--desc"></div>
        `;
        list.appendChild(li);
    }
    return list;
}

/* -- INIT ---------------------------------------------------------------------- */

async function initProjects() {
    const area = document.querySelector('.content-area');
    if (!area) return;

    area.innerHTML = '';

    const heading = document.createElement('h1');
    heading.textContent = 'Projects';
    area.appendChild(heading);

    const skeleton = renderSkeleton();
    area.appendChild(skeleton);

    try {
        const repos = await fetchRepos();
        skeleton.replaceWith(renderRepos(repos));
    } catch (err) {
        skeleton.replaceWith(renderError(err.message));
    }
}

document.addEventListener('DOMContentLoaded', initProjects);