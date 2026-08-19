(function () {
    'use strict';

    /* ---- CONTACT MESSAGE FORM ---- */
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Small inline status line, inserted once, right after the submit button.
    const statusEl = document.createElement('p');
    statusEl.className = 'contact-form-status';
    statusEl.setAttribute('aria-live', 'polite');
    form.appendChild(statusEl);

    const submitBtn = form.querySelector('.btn-send-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();

        statusEl.textContent = '';
        statusEl.className = 'contact-form-status';
        if (submitBtn) { submitBtn.disabled = true; }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');

            statusEl.textContent = 'Message sent — thanks for reaching out!';
            statusEl.classList.add('success');
            form.reset();
        } catch (err) {
            statusEl.textContent = err.message || 'Could not send your message. Please try again.';
            statusEl.classList.add('error');
        } finally {
            if (submitBtn) { submitBtn.disabled = false; }
        }
    });

})();