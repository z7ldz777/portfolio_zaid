(function () {
    'use strict';

    /* ============================================
       MODAL LOGIC (shared by every dynamically-rendered card)
       ------------------------------------------------
       Cards for Video Editing/Programming/Design/Songs/Courses/Events/
       Experience are all rendered at runtime by site-data.js from
       /api/content. Everything below uses event delegation on `document`
       instead of querying cards at load time, so it works no matter when
       a card actually gets added to the page.
       ============================================ */

    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');

    function openModal(card) {
        const type = card.dataset.type;
        const src = card.dataset.src;
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
        const cat = card.querySelector('.cat-tag') ? card.querySelector('.cat-tag').textContent : '';
        modalBody.innerHTML = '';

        if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.style.maxWidth = '90vw';
            video.style.maxHeight = '80vh';
            video.style.borderRadius = '12px';
            modalBody.appendChild(video);
        } else if (type === 'youtube') {
            const isShort = card.dataset.short === 'true';
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + src + '?autoplay=1&rel=0';
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.display = 'block';
            if (isShort) {
                iframe.style.width = '340px';
                iframe.style.height = '604px';
                iframe.style.maxWidth = '90vw';
                iframe.style.maxHeight = '80vh';
            } else {
                iframe.style.width = '900px';
                iframe.style.height = '506px';
                iframe.style.maxWidth = '90vw';
                iframe.style.maxHeight = '80vh';
            }
            modalBody.appendChild(iframe);
        } else if (type === 'file') {
            const filename = card.dataset.filename || src.split('/').pop();
            modalBody.innerHTML = '<div class="project-modal-file-info">' +
                '<h3>' + title + '</h3>' +
                '<p>' + cat + '</p>' +
                '</div>' +
                (window.buildDocViewerHtml ? window.buildDocViewerHtml(src, filename) : '');
        } else if (type === 'audio') {
            const cover = card.dataset.cover || '';
            modalBody.innerHTML = '<div class="modal-audio-player">' +
                '<div class="modal-audio-cover">' +
                '<img src="' + cover + '" alt="' + title + '">' +
                '</div>' +
                '<div class="modal-audio-title">' + title + '</div>' +
                '<div class="modal-audio-cat">' + cat + '</div>' +
                '<div class="modal-audio-controls">' +
                '<audio controls src="' + src + '" id="modalAudio"></audio>' +
                '</div>' +
                '</div>';
            var aud = document.getElementById('modalAudio');
            aud.play().catch(function () { });
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function openBannerModal(card) {
        const imgEl = card.querySelector('.banner-card-image img');
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
        const desc = card.querySelector('.banner-card-content p') ? card.querySelector('.banner-card-content p').textContent : '';

        // Generic: whichever action button the card actually has (GitHub,
        // Figma, or Certificate) gets carried into the modal. Works for any
        // future card type too, without needing to branch on category name.
        let actionHtml = '';
        const actionBtn = card.querySelector('.btn-github, .btn-figma, .btn-certificate');
        if (actionBtn) {
            actionHtml = '<a href="' + actionBtn.getAttribute('href') + '" class="' + actionBtn.className + '" target="_blank" rel="noopener">' + actionBtn.innerHTML + '</a>';
        }

        modalBody.innerHTML = '<div class="modal-banner">' +
            '<div class="modal-banner-image"><img src="' + (imgEl ? imgEl.src : '') + '" alt="' + title + '"></div>' +
            '<div class="modal-banner-content">' +
            '<h3>' + title + '</h3>' +
            '<p>' + desc + '</p>' +
            actionHtml +
            '</div>' +
            '</div>';

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        const vid = modalBody.querySelector('video');
        if (vid) { vid.pause(); vid.src = ''; }
        const aud = modalBody.querySelector('audio');
        if (aud) { aud.pause(); aud.src = ''; }
        modalBody.innerHTML = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    // .project-card entries (video/audio/file) open the lightbox modal.
    // Delegated: these cards are rendered dynamically by site-data.js.
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) openModal(card);
    });

    // .banner-card entries (Programming / Design / Courses) open the larger
    // banner-style modal. Clicks on a real link (GitHub/Figma/Certificate)
    // are left alone so they navigate normally; a plain <button> (e.g. the
    // Poster "View Poster" button) has no href, so it falls through and
    // explicitly triggers the modal itself. Event cards (data-event-id)
    // handle their own richer modal in site-data.js instead.
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.banner-card');
        if (!card) return;
        if (card.dataset.eventId) return;
        const link = e.target.closest('a');
        if (link) return;
        openBannerModal(card);
    });

})();