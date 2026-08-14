(function () {
    'use strict';

    /* ---- SHOWREEL ERROR GUARD ---- */
    // Playback itself is started/stopped by video-visibility.js, based on
    // whether the showreel is actually on screen. This just guards against
    // a broken/missing file retrying forever.
    const showreelVideo = document.getElementById('showreelVideo');

    let errorCount = 0;
    showreelVideo.addEventListener('error', () => {
        errorCount++;
        if (errorCount >= 2) {
            showreelVideo.removeAttribute('loop');
            showreelVideo.pause();
            console.warn('Showreel video failed to load — check that assets/showreel/showreelll.mp4 exists and is a valid, non-corrupt MP4.');
        }
    });

})();