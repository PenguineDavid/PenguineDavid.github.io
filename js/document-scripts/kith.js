// Grab the raw markdown text from the script tag. Using textContent
// rather than innerText avoids layout-dependent whitespace handling,
// which matters here since marked cares about leading whitespace
// for list items and code blocks.
const sourceEl = document.getElementById('markdown-source');
const rawMarkdown = sourceEl.textContent;

const homeEl = document.getElementById('home');

// Slugify a heading's text the same way GitHub's markdown renderer
// does: strip punctuation (keeping word chars, hyphens, and spaces),
// lowercase, then turn each individual space into a hyphen. This
// matters for headings like "Build & Test" -> "build--test" (the
// removed "&" leaves behind two spaces, which become two hyphens).
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\- ]+/g, '')
        .replace(/ /g, '-');
}

// Walk the rendered h2 headings inside #home, assign them ids (since
// current marked.js no longer does this automatically), and build a
// matching link list in the page's #table TOC section. This replaces
// a hand-maintained list that goes stale whenever a section is added
// or renamed.
function buildPageToc() {
    const listEl = document.getElementById('page-toc');
    if (!listEl) {
        return;
    }
    const headings = homeEl.querySelectorAll('h2');
    const seenSlugs = {};
    headings.forEach(function (heading) {
        let slug = slugify(heading.textContent);
        if (seenSlugs[slug] !== undefined) {
            seenSlugs[slug] += 1;
            slug = slug + '-' + seenSlugs[slug];
        } else {
            seenSlugs[slug] = 0;
        }
        heading.id = slug;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + slug;
        a.textContent = heading.textContent;
        li.appendChild(a);
        listEl.appendChild(li);
    });
}

// Prism has no built-in grammar for Kith (it's your own language), so
// define one. Keyword list is pulled directly from the lexer's
// TokenType table in this doc: control flow, types, and the
// word-form logical operators (and/or/xor/not) all need to be
// listed explicitly since Prism has no way to infer them.
Prism.languages.kith = {
    'comment': /\/\/.*/,
    'string': {
        pattern: /(?:\$|r)?"""[\s\S]*?"""|(?:\$|r)?"(?:\\.|[^"\\])*"/,
        greedy: true
    },
    'keyword': /\b(?:func|int|str|float|bool|if|else|while|do|for|foreach|switch|case|default|break|struct|try|catch|throw|finally|include|return|stop|true|false|and|or|xor|not|typeof|instanceof|in|delete)\b/,
    'function': /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/,
    'number': /\b\d+(?:\.\d+)?\b/,
    'operator': /\*\*|>>>|<<|>>|===|!==|==|!=|<=|>=|&&|\|\||\^\^|\?\?|->|\+\+|--|[+\-*/%=<>!&|^~?:]/,
    'punctuation': /[{}[\];(),.:]/
};

// Wrap every rendered code block in a .github-dark container so it
// picks up the theme's background, font, and token colors, then
// hand off to Prism to tokenize whatever language each fence
// declared. Plain fences with no language (the ASCII diagrams in
// this doc) still get the themed box, just without token coloring,
// since there's nothing for Prism to detect.
function themeCodeBlocks() {
    const blocks = homeEl.querySelectorAll('pre');
    blocks.forEach(function (pre) {
        const wrapper = document.createElement('div');
        wrapper.className = 'github-dark';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
    });
    Prism.highlightAllUnder(homeEl);
}

if (typeof marked === 'undefined') {
    // marked failed to load (CDN blocked, offline, typo in the URL).
    // Fail loudly instead of silently leaving #home empty, and fall
    // back to showing the raw markdown so the page is still readable.
    console.error('marked.js did not load: check the <script src> URL and network tab');
    homeEl.textContent = rawMarkdown;
} else {
    homeEl.innerHTML = marked.parse(rawMarkdown);
    buildPageToc();
    themeCodeBlocks();
}