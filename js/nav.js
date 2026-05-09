/**
 * nav.js
 * Populates .breadcrumb and .sidebar based on current path.
 * To add a page: add an entry to SITEMAP and add its path to the
 * parent's children array. Nothing else needs changing.
 */

const SITEMAP = [
    {
        path: '/',
        label: 'Home',
        parent: null,
        children: ['/projects/', '/skills/', '/contact/', '/about/']
    },
    {
        path: '/projects/',
        label: 'Projects',
        parent: '/',
        children: ['/projects/highlights/', '/projects/gallery/']
    },
    {
        path: '/skills/',
        label: 'Skills',
        parent: '/',
        children: []
    },
    {
        path: '/contact/',
        label: 'Contact',
        parent: '/',
        children: []
    },
    {
        path: '/projects/highlights/',
        label: 'Highlights',
        parent: '/projects/',
        children: []
    },
    {
        path: '/projects/gallery/',
        label: 'Gallery',
        parent: '/projects/',
        children: []
    },
    {
        path: '/about/',
        label: 'About',
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
    let p = window.location.pathname.replace(/index\.html$/, '');
    if (!p.endsWith('/')) p += '/';
    return p;
}

function buildBreadcrumb(path) {
    const el = document.querySelector('.breadcrumb');
    if (!el) return;
    const ancestors = getAncestors(path);
    if (!ancestors.length) return;

    el.innerHTML = ancestors.map((node, i) => {
        const sep = i > 0 ? '<span class="sep">/</span>' : '';
        const isLast = i === ancestors.length - 1;
        return isLast
            ? `${sep}<span class="current">${node.label}</span>`
            : `${sep}<a href="${node.path}">${node.label}</a>`;
    }).join('');
}

function buildSidebar(path) {
    const el = document.querySelector('.sidebar');
    if (!el) return;
    const node = getNode(path);
    if (!node) return;

    const items = [];

    if (node.parent) {
        const parent = getNode(node.parent);
        if (parent) {
            items.push(`<li><a href="${parent.path}">&#8592; ${parent.label}</a></li>`);
        }
    }

    for (const childPath of node.children) {
        const child = getNode(childPath);
        if (child) {
            const active = childPath === path ? ' class="active"' : '';
            items.push(`<li><a href="${child.path}"${active}>${child.label}</a></li>`);
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
