(function () {
    // ----- DOM elements -----
    const lightbox = document.getElementById('gallery-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbTitle = document.getElementById('lightbox-title');
    const lbDesc = document.getElementById('lightbox-desc');
    const lbCopy = document.getElementById('lightbox-copy');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    // ----- collect gallery items from cards -----
    const cards = document.querySelectorAll('.gallery-card');
    let currentIndex = 0;

    // Function to update lightbox content from a card element OR index
    function updateLightboxFromCard(card, index) {
        if (!card) return;
        lbImg.src = card.dataset.src || '';
        lbImg.alt = card.dataset.title || '';
        lbTitle.textContent = card.dataset.title || '';
        lbDesc.textContent = card.dataset.desc || '';
        lbCopy.innerHTML = card.dataset.copy || '';
        currentIndex = index;
        // Update arrow disabled states
        if (prevBtn) prevBtn.disabled = (currentIndex === 0);
        if (nextBtn) nextBtn.disabled = (currentIndex === cards.length - 1);
    }

    // Show item by index
    function showItem(index) {
        if (index < 0) index = 0;
        if (index >= cards.length) index = cards.length - 1;
        if (!cards[index]) return;
        updateLightboxFromCard(cards[index], index);
    }

    // Next / prev handlers
    function nextImage() {
        if (currentIndex + 1 < cards.length) {
            showItem(currentIndex + 1);
        }
    }

    function prevImage() {
        if (currentIndex - 1 >= 0) {
            showItem(currentIndex - 1);
        }
    }

    // Open lightbox from a specific card (triggered by click)
    function openLightbox(card, index) {
        updateLightboxFromCard(card, index);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Attach click listeners to each gallery card
    cards.forEach((card, idx) => {
        card.addEventListener('click', () => openLightbox(card, idx));
    });

    // Button listeners
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);

    // Close on backdrop click
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    // Escape key
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
    // Keyboard left/right navigation when lightbox open
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevImage();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextImage();
        }
    });

    // Initialize disabled states
    if (cards.length > 0) {
        // set initial disabled states based on first card (though not open)
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = (cards.length === 1);
    }
})();