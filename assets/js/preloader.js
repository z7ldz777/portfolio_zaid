(function () {
    'use strict';

    /* ---- PRELOADER ---- */
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loaderProgress');
    let loaded = 0;
    const loadInterval = setInterval(() => {
        loaded += Math.random() * 25;
        if (loaded > 100) loaded = 100;
        loaderBar.style.width = loaded + '%';
        if (loaded >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => preloader.classList.add('done'), 400);
        }
    }, 200);

})();