(function () {
    const btn = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    const sidebar = document.querySelector('.sidebar');
    if (!btn) return;

    function open() {
        document.body.classList.add('sidebar-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = '\u2715';
    }

    function close() {
        document.body.classList.remove('sidebar-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '\u2630';
    }

    btn.addEventListener('click', () =>
        document.body.classList.contains('sidebar-open') ? close() : open()
    );

    // Only close when clicking the overlay itself, not anything inside the sidebar
    overlay.addEventListener('click', close);
    sidebar.addEventListener('click', e => e.stopPropagation());

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });
})();