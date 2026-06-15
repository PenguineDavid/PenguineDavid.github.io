/**
 * nav.js
 * Populates .breadcrumb and .sidebar based on current path.
 * Separates icons from labels for clean architectural rendering.
 */

const SITEMAP = [
    {
        path: '/',
        label: 'Home',
        icon: 'fa-home',
        parent: null,
        children: ['/projects/', '/skills/', '/contact/', '/about/']
    },
    {
        path: '/projects/',
        label: 'Projects',
        icon: 'fa-code',
        parent: '/',
        children: ['/projects/highlights/', '/projects/gallery/']
    },
    {
        path: '/skills/',
        label: 'Skills',
        icon: 'fa-laptop-code',
        parent: '/',
        children: []
    },
    {
        path: '/contact/',
        label: 'Contact',
        icon: 'fa-briefcase',
        parent: '/',
        children: []
    },
    {
        path: '/projects/highlights/',
        label: 'Highlights',
        icon: 'fa-thumbtack',
        parent: '/projects/',
        children: []
    },
    {
        path: '/projects/gallery/',
        label: 'Gallery',
        icon: 'fa-images',
        parent: '/projects/',
        children: []
    },
    {
        path: '/about/',
        label: 'About',
        icon: 'fa-user',
        parent: '/',
        children: []
    }
];

function getNode(path) {
    return SITEMAP.find(n => n.path === path) || null;
}

function getAncestors(path) {
    const chain = [];
    let node = getNode(path);
    while (node) {
        chain.unshift(node);
        node = node.parent ? getNode(node.parent) : null;
    }
    return chain;
}

function currentPath() {
    let p = window.location.pathname;

    // 1. Clean up file extensions to standardize the string
    p = p.replace(/index\.html$/, '').replace(/\.html$/, '');
    if (!p.endsWith('/')) p += '/';

    // 2. If it's an exact match (you are running a clean root web server)
    if (SITEMAP.find(n => n.path === p)) return p;

    // 3. Bulletproof fallback for local hard drive files (file:///) or subfolders
    // We sort by length descending so deeper paths match before the root '/' matches everything
    const sortedPaths = SITEMAP.map(n => n.path).sort((a, b) => b.length - a.length);
    for (const sPath of sortedPaths) {
        if (p.endsWith(sPath)) return sPath;
    }

    // 4. Ultimate fallback to the Home node so the sidebar never goes completely blank
    return '/';
}

function buildBreadcrumb(path) {
    const el = document.querySelector('.breadcrumb');
    if (!el) return;
    const ancestors = getAncestors(path);
    if (!ancestors.length) return;

    el.innerHTML = ancestors.map((node, i) => {
        const sep = i > 0 ? '<span class="sep">/</span>' : '';
        const isLast = i === ancestors.length - 1;

        // Dynamically build the modern Font Awesome tag if an icon is defined
        const iconHtml = node.icon ? `<span class="fa-solid ${node.icon}"></span> ` : '';

        return isLast
            ? `${sep}<span class="current">${iconHtml}${node.label}</span>`
            : `${sep}<a href="${node.path}">${iconHtml}${node.label}</a>`;
    }).join('');
}

function buildSidebar(path) {
    const el = document.querySelector('.sidebar');
    if (!el) return;
    const node = getNode(path);
    if (!node) return;

    const items = [];

    // Parent back button
    if (node.parent) {
        const parent = getNode(node.parent);
        if (parent) {
            // Uses a clean left-arrow icon instead of breaking layouts with duplicated labels
            items.push(`<li><a href="${parent.path}"><span class="fa-solid fa-arrow-left"></span> Back to ${parent.label}</a></li>`);
        }
    }

    // Target section child pages
    for (const childPath of node.children) {
        const child = getNode(childPath);
        if (child) {
            const active = childPath === path ? ' class="active"' : '';
            const iconHtml = child.icon ? `<span class="fa-solid ${child.icon}"></span> ` : '';
            items.push(`<li><a href="${child.path}"${active}>${iconHtml}${child.label}</a></li>`);
        }
    }

    if (!items.length) return;
    el.innerHTML = `<p class="sidebar-label">In this section</p><ul>${items.join('')}</ul>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const path = currentPath();
    buildBreadcrumb(path);
    buildSidebar(path);
});