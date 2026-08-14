(function () {
    'use strict';

    /* ============================================
       SKILLS SECTION — CONTENT DATA
       ------------------------------------------------
       This is the single source of truth for Courses,
       Events, and Experience. A future admin dashboard
       just needs to read/write these arrays (or load
       them from a JSON file / API instead) — the render
       functions below rebuild the DOM from whatever is
       in here, nothing is hardcoded in the HTML.
       ============================================ */

    const COURSES = [
        {
            id: 'course-1',
            image: 'assets/skills/courses/course-1-banner.jpg', // PUT COURSE IMAGE HERE
            title: '[Course Title]', // PUT COURSE TITLE HERE
            description: '[Course description goes here.]', // PUT COURSE DESCRIPTION HERE
            certLink: '#' // PUT CERTIFICATE LINK HERE
        }
    ];

    const EVENTS = [
        {
            id: 'event-1',
            image: 'assets/skills/events/event-1-banner.jpg', // PUT MAIN EVENT IMAGE HERE
            title: '[Event Title]', // PUT EVENT TITLE HERE
            description: '[Event description goes here.]', // PUT EVENT DESCRIPTION HERE
            gallery: [
                'assets/skills/events/event-1-photo-1.jpg', // PUT ADDITIONAL EVENT IMAGES HERE
                'assets/skills/events/event-1-photo-2.jpg'
            ]
        }
    ];

    const EXPERIENCE = [
        {
            id: 'exp-1',
            logo: 'assets/skills/experience/exp-1-logo.png', // PUT COMPANY LOGO HERE
            company: '[Company Name]', // PUT COMPANY NAME HERE
            type: '[Experience Type — e.g. Internship]', // PUT EXPERIENCE TYPE HERE
            description: '[Experience description goes here.]' // PUT EXPERIENCE DESCRIPTION HERE
        }
    ];

    /* ============================================
       RENDER
       ============================================ */
    function renderCourses() {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;
        grid.innerHTML = COURSES.map((c, i) => (
            '<div class="banner-card reveal" data-course-id="' + c.id + '" style="--i:' + i + '">' +
            '<div class="banner-card-image"><img src="' + c.image + '" alt="' + c.title + '" loading="lazy"></div>' +
            '<div class="banner-card-content">' +
            '<h3>' + c.title + '</h3>' +
            '<p>' + c.description + '</p>' +
            '<a href="' + c.certLink + '" class="btn-certificate" target="_blank" rel="noopener">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/></svg>' +
            'View Certificate</a>' +
            '</div></div>'
        )).join('');
    }

    function renderEvents() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;
        grid.innerHTML = EVENTS.map((ev, i) => (
            '<div class="banner-card reveal" data-event-id="' + ev.id + '" style="--i:' + i + '">' +
            '<div class="banner-card-image"><img src="' + ev.image + '" alt="' + ev.title + '" loading="lazy"></div>' +
            '<div class="banner-card-content">' +
            '<h3>' + ev.title + '</h3>' +
            '<p>' + ev.description + '</p>' +
            '<button type="button" class="btn-view-details" data-event-id="' + ev.id + '">View Details</button>' +
            '</div></div>'
        )).join('');
    }

    function renderExperience() {
        const grid = document.getElementById('experienceGrid');
        if (!grid) return;
        grid.innerHTML = EXPERIENCE.map((exp, i) => (
            '<div class="experience-card reveal" data-exp-id="' + exp.id + '" style="--i:' + i + '">' +
            '<div class="experience-card-logo"><img src="' + exp.logo + '" alt="' + exp.company + '" loading="lazy"></div>' +
            '<div class="experience-card-text">' +
            '<h3>' + exp.company + '</h3>' +
            '<p>' + exp.type + '</p>' +
            '</div>' +
            '<button type="button" class="btn-view-details" data-exp-id="' + exp.id + '">View Details</button>' +
            '</div>'
        )).join('');
    }

    renderCourses();
    renderEvents();
    renderExperience();

    // scroll-reveal.js already ran and observed whatever .reveal elements
    // existed at page load — these cards were injected afterward (and
    // start out inside a hidden category anyway), so mark them visible
    // directly instead of leaving them permanently stuck at opacity:0.
    document.querySelectorAll('#coursesGrid .reveal, #eventsGrid .reveal, #experienceGrid .reveal')
        .forEach(el => el.classList.add('visible'));

    /* ============================================
       MODALS — reuse the existing #projectModal shell
       ============================================ */
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    function openModalWith(html) {
        modalBody.innerHTML = html;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    document.addEventListener('click', (e) => {
        const eventCard = e.target.closest('.banner-card[data-event-id]');
        if (eventCard) {
            const ev = EVENTS.find(x => x.id === eventCard.dataset.eventId);
            if (!ev) return;
            const gallery = [ev.image].concat(ev.gallery || []);
            openModalWith(
                '<div class="modal-event">' +
                '<div class="modal-event-gallery">' +
                gallery.map(src => '<img src="' + src + '" alt="' + ev.title + '">').join('') +
                '</div>' +
                '<div class="modal-event-text">' +
                '<h3>' + ev.title + '</h3>' +
                '<p>' + ev.description + '</p>' +
                '</div>' +
                '</div>'
            );
            return;
        }

        const expBtn = e.target.closest('.btn-view-details[data-exp-id]');
        if (expBtn) {
            const exp = EXPERIENCE.find(x => x.id === expBtn.dataset.expId);
            if (!exp) return;
            openModalWith(
                '<div class="modal-experience">' +
                '<div class="modal-experience-logo"><img src="' + exp.logo + '" alt="' + exp.company + '"></div>' +
                '<h3>' + exp.company + '</h3>' +
                '<span class="modal-experience-type">' + exp.type + '</span>' +
                '<p>' + exp.description + '</p>' +
                '</div>'
            );
            return;
        }

        // Course cards open the same banner-style modal used by Programming/Design,
        // via the generic .banner-card click handler in projects.js — no extra
        // wiring needed here since course cards use the same .banner-card markup.
    });

})();