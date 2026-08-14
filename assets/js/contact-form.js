(function () {
    'use strict';

    /* ---- CONTACT MESSAGE FORM ---- */
    // No backend yet, so this opens the visitor's email client with the
    // message prefilled. Swap this for a real endpoint later without
    // touching the HTML — just change what happens on submit.
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();

        const subject = 'Portfolio message from ' + name;
        const body = message + '\n\n— ' + name + ' (' + email + ')';

        window.location.href = 'mailto:zaidshareef1852@gmail.com'
            + '?subject=' + encodeURIComponent(subject)
            + '&body=' + encodeURIComponent(body);
    });

})();