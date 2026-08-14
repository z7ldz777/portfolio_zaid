(function () {
    'use strict';

    /* ---- ZOOMABLE IMAGE VIEWER ---- */
    const viewer = document.getElementById('imageViewer');
    const stage = document.getElementById('imageViewerStage');
    const img = document.getElementById('imageViewerImg');
    const closeBtn = document.getElementById('imageViewerClose');
    const zoomInBtn = document.getElementById('imgZoomIn');
    const zoomOutBtn = document.getElementById('imgZoomOut');
    const zoomResetBtn = document.getElementById('imgZoomReset');
    if (!viewer || !img) return;

    const MIN_SCALE = 1;
    const MAX_SCALE = 4;
    let scale = 1;
    let tx = 0;
    let ty = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startTx = 0;
    let startTy = 0;

    function applyTransform() {
        img.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
        zoomResetBtn.textContent = Math.round(scale * 100) + '%';
    }

    function setScale(next) {
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
        if (scale === MIN_SCALE) { tx = 0; ty = 0; }
        applyTransform();
    }

    function openViewer(src, alt) {
        img.src = src;
        img.alt = alt || '';
        scale = 1; tx = 0; ty = 0;
        applyTransform();
        viewer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeViewer() {
        viewer.classList.remove('open');
        document.body.style.overflow = '';
        img.src = '';
    }

    // Open whenever a banner-modal image is clicked (event delegation,
    // since that image is created dynamically inside #modalBody).
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.modal-banner-image img');
        if (target) openViewer(target.src, target.alt);
    });

    closeBtn.addEventListener('click', closeViewer);
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) closeViewer();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && viewer.classList.contains('open')) closeViewer();
    });

    zoomInBtn.addEventListener('click', () => setScale(scale + 0.5));
    zoomOutBtn.addEventListener('click', () => setScale(scale - 0.5));
    zoomResetBtn.addEventListener('click', () => setScale(1));

    // Scroll wheel zoom
    stage.addEventListener('wheel', (e) => {
        if (!viewer.classList.contains('open')) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setScale(scale + delta);
    }, { passive: false });

    // Drag to pan (mouse + touch via Pointer Events)
    stage.addEventListener('pointerdown', (e) => {
        if (scale <= MIN_SCALE) return;
        dragging = true;
        stage.classList.add('grabbing', 'panning');
        startX = e.clientX;
        startY = e.clientY;
        startTx = tx;
        startTy = ty;
        stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        tx = startTx + (e.clientX - startX);
        ty = startTy + (e.clientY - startY);
        applyTransform();
    });

    function endDrag() {
        dragging = false;
        stage.classList.remove('grabbing', 'panning');
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // Double-click / double-tap to toggle zoom
    stage.addEventListener('dblclick', () => {
        setScale(scale > MIN_SCALE ? 1 : 2);
    });

})();