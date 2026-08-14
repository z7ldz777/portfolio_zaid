(function () {
    'use strict';

    /* ---- HERO NAME CHARACTER ANIMATION ---- */
    const name = 'Zaid Shareef';
    const heroName = document.getElementById('heroName');
    name.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.animationDelay = (0.8 + i * 0.035) + 's';
        span.textContent = char === ' ' ? '\u00A0' : char;
        heroName.appendChild(span);
    });

})();