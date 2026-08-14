(function () {
    'use strict';

    /* ---- VIDEO VISIBILITY (pause off-screen autoplay videos) ---- */
    // The hero and showreel videos are heavy to decode continuously.
    // Only play whichever one is actually on screen; pause the rest so
    // the browser isn't decoding multiple videos at once.
    const videos = document.querySelectorAll('#heroVideo, #showreelVideo');
    if (!videos.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.2 });

    videos.forEach((video) => observer.observe(video));

})();