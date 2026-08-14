(function () {
    'use strict';

    /* ============================================
       IN-BROWSER DOCUMENT VIEWER
       ------------------------------------------------
       PDFs render natively via <iframe>. Office formats
       (pptx/docx/xlsx/etc.) can't render in a browser on
       their own, so those go through Microsoft's Office
       Online viewer — which needs a real public URL to
       fetch the file from. That means Office-file preview
       only works once this site is deployed live; on
       localhost/127.0.0.1 it will show an error, which is
       expected (PDF preview works fine locally either way).
       ============================================ */
    const OFFICE_EXTS = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'];

    window.buildDocViewerHtml = function (src, filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const isLocal = /^(localhost|127\.0\.0\.1)/.test(window.location.hostname) || window.location.protocol === 'file:';
        let frameHtml;

        if (ext === 'pdf') {
            frameHtml = '<iframe src="' + src + '" class="doc-viewer-frame"></iframe>';
        } else if (OFFICE_EXTS.indexOf(ext) !== -1) {
            if (isLocal) {
                frameHtml = '<div class="doc-viewer-fallback">' +
                    '<p>Live preview for .' + ext.toUpperCase() + ' files only works once this site is deployed to a public URL ' +
                    '(Office Online needs to fetch the file over the internet). Use Download for now.</p>' +
                    '</div>';
            } else {
                const absoluteUrl = new URL(src, window.location.href).href;
                frameHtml = '<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=' +
                    encodeURIComponent(absoluteUrl) + '" class="doc-viewer-frame"></iframe>';
            }
        } else {
            frameHtml = '<div class="doc-viewer-fallback"><p>Preview not available for this file type.</p></div>';
        }

        return '<div class="doc-viewer">' +
            frameHtml +
            '<a href="' + src + '" download class="btn-download-file">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            'Download ' + filename +
            '</a>' +
            '</div>';
    };

    /* ---- RESUME "VIEW CV" BUTTON ---- */
    const viewBtn = document.getElementById('viewCvBtn');
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    if (!viewBtn || !modal || !modalBody) return;

    viewBtn.addEventListener('click', () => {
        modalBody.innerHTML = window.buildDocViewerHtml(viewBtn.dataset.src, viewBtn.dataset.filename);
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

})();