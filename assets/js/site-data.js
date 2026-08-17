(function () {
    'use strict';

    const API_BASE = ''; // same-origin: works once this file is served from the Vercel-deployed domain

    /* ============================================
       SMALL SHARED SVG ICONS (not stored in the DB —
       these are just UI chrome, same as before)
       ============================================ */
    const ICON_GITHUB = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.68.42.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.2.66.79.55A10.52 10.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>';
    const ICON_FIGMA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4zM4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4zM4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4zM12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0zM20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/></svg>';
    const ICON_CERT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/></svg>';
    const ICON_POSTER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

    const TOOL_ICONS = {
        'Design': { color: '#8E1616', svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 12h6m6 0h6"/>' },
        'Video Editing': { color: '#B31F1F', svg: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>' },
        'Programming': { color: '#E8C999', svg: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' },
    };

    function fileIcon(fileType) {
        const isPptx = fileType === 'pptx';
        const color = isPptx ? '#e86c30' : '#2b7cd3';
        const inner = isPptx
            ? '<rect x="8" y="13" width="8" height="3" rx="0.5" stroke="' + color + '" stroke-width="1"/>'
            : '<line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>';
        return '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5">' +
            '<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>' + inner + '</svg>';
    }

    function esc(str) {
        return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ============================================
       FETCH
       ============================================ */
    fetch(API_BASE + '/api/content')
        .then((r) => r.json())
        .then((data) => {
            renderVideoEditing(data);
            renderProgramming(data);
            renderDesign(data);
            renderSongs(data);
            renderSkillsTools(data);
            renderSkillsCourses(data);
            renderSkillsEvents(data);
            renderSkillsExperience(data);
            renderEducation(data);
            renderContactLinks(data);

            // scroll-reveal.js already ran before this fetch resolved, so mark
            // everything we just injected as visible directly instead of it
            // being stuck at opacity:0 forever.
            document.querySelectorAll(
                '#videoEditingGrid .reveal, #videoEditingFilters .reveal, ' +
                '#programmingGrid .reveal, #programmingFilters .reveal, ' +
                '#designGrid .reveal, #designFilters .reveal, ' +
                '#songsGrid .reveal, #skillsToolsGrid .reveal, ' +
                '#coursesGrid .reveal, #eventsGrid .reveal, #experienceGrid .reveal, ' +
                '#educationText.reveal'
            ).forEach((el) => el.classList.add('visible'));
        })
        .catch((err) => {
            console.error('Failed to load site content from /api/content:', err);
        });

    /* ============================================
       FILTER TABS (shared by Video Editing / Programming / Design)
       ============================================ */
    function buildFilterTabs(container, categories, onChange) {
        const buttons = [{ slug: 'all', label: 'All' }].concat(
            categories.map((c) => ({ slug: c.slug, label: c.label }))
        );
        container.innerHTML = buttons.map((b, i) =>
            '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" data-filter="' + esc(b.slug) + '">' + esc(b.label) + '</button>'
        ).join('');

        const btns = container.querySelectorAll('.filter-btn');
        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                btns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                onChange(btn.dataset.filter);
            });
        });
    }

    function applyCardFilter(grid, filter) {
        grid.querySelectorAll('[data-cat]').forEach((card) => {
            card.classList.toggle('hidden', !(filter === 'all' || card.dataset.cat === filter));
        });
    }

    /* ============================================
       VIDEO EDITING
       ============================================ */
    function renderVideoEditing(data) {
        const grid = document.getElementById('videoEditingGrid');
        const filters = document.getElementById('videoEditingFilters');
        if (!grid || !filters) return;

        grid.innerHTML = data.videos.map((v, i) => {
            const thumb = 'https://img.youtube.com/vi/' + v.youtube_id + '/hqdefault.jpg';
            return '<div class="project-card reveal" data-cat="' + esc(v.category) + '" style="--i:' + (i % 8) + '" ' +
                'data-type="youtube" data-src="' + esc(v.youtube_id) + '" data-short="' + (v.is_short ? 'true' : 'false') + '">' +
                '<img src="' + thumb + '" alt="' + esc(v.title) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;">' +
                '<div class="project-card-overlay"><span class="cat-tag">' + esc(v.category) + '</span><h3>' + esc(v.title) + '</h3></div>' +
                '</div>';
        }).join('');

        buildFilterTabs(filters, data.categories.video_editing || [], (filter) => applyCardFilter(grid, filter));
    }

    /* ============================================
       PROGRAMMING (mix of file cards + banner cards)
       ============================================ */
    function renderProgramming(data) {
        const grid = document.getElementById('programmingGrid');
        const filters = document.getElementById('programmingFilters');
        if (!grid || !filters) return;

        grid.innerHTML = data.programmingProjects.map((p, i) => {
            if (p.file_type) {
                return '<div class="project-card reveal" data-cat="' + esc(p.category) + '" style="--i:' + i + '" ' +
                    'data-type="file" data-src="' + esc(p.file_url) + '" data-filename="' + esc(p.title) + '.' + esc(p.file_type) + '">' +
                    '<div class="project-card-file">' + fileIcon(p.file_type) + '<span class="file-ext">.' + p.file_type.toUpperCase() + '</span></div>' +
                    '<div class="project-card-overlay" style="opacity:1;"><span class="cat-tag">' + esc(p.category) + '</span><h3>' + esc(p.title) + '</h3></div>' +
                    '</div>';
            }
            const githubBtn = p.github_url
                ? '<a href="' + esc(p.github_url) + '" class="btn-github" target="_blank" rel="noopener">' + ICON_GITHUB + 'View on GitHub</a>'
                : '';
            return '<div class="banner-card reveal" data-cat="' + esc(p.category) + '" style="--i:' + i + '">' +
                '<div class="banner-card-image"><img src="' + esc(p.banner_url) + '" alt="' + esc(p.title) + '" loading="lazy"></div>' +
                '<div class="banner-card-content"><span class="cat-tag">' + esc(p.category) + '</span>' +
                '<h3>' + esc(p.title) + '</h3><p>' + esc(p.description) + '</p>' + githubBtn +
                '</div></div>';
        }).join('');

        buildFilterTabs(filters, data.categories.programming || [], (filter) => applyCardFilter(grid, filter));
    }

    /* ============================================
       DESIGN
       ============================================ */
    function renderDesign(data) {
        const grid = document.getElementById('designGrid');
        const filters = document.getElementById('designFilters');
        if (!grid || !filters) return;

        grid.innerHTML = data.designProjects.map((d, i) => {
            // Whichever design item actually has a Figma link gets the Figma
            // button — not tied to the category's slug staying exactly
            // "figma", since that's admin-editable now and would silently
            // break this if renamed. Anything without a link falls back to
            // the generic "View" button that opens the image in the modal.
            const actionBtn = d.link_url
                ? '<a href="' + esc(d.link_url) + '" class="btn-figma" target="_blank" rel="noopener">' + ICON_FIGMA + 'View on Figma</a>'
                : '<button type="button" class="btn-poster">' + ICON_POSTER + 'View Poster</button>';
            return '<div class="banner-card reveal" data-cat="' + esc(d.category) + '" style="--i:' + i + '">' +
                '<div class="banner-card-image"><img src="' + esc(d.banner_url) + '" alt="' + esc(d.title) + '" loading="lazy"></div>' +
                '<div class="banner-card-content"><span class="cat-tag">' + esc(d.category) + '</span>' +
                '<h3>' + esc(d.title) + '</h3><p>' + esc(d.description) + '</p>' + actionBtn +
                '</div></div>';
        }).join('');

        buildFilterTabs(filters, data.categories.design || [], (filter) => applyCardFilter(grid, filter));
    }

    /* ============================================
       SONGS (no filter)
       ============================================ */
    function renderSongs(data) {
        const grid = document.getElementById('songsGrid');
        if (!grid) return;
        grid.innerHTML = data.songs.map((s, i) =>
            '<div class="project-card reveal" data-cat="songs" style="--i:' + i + '" data-type="audio" ' +
            'data-src="' + esc(s.audio_url) + '" data-cover="' + esc(s.cover_url) + '">' +
            '<img src="' + esc(s.cover_url) + '" alt="' + esc(s.title) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;">' +
            '<div class="project-card-overlay"><span class="cat-tag">Song</span><h3>' + esc(s.title) + '</h3></div>' +
            '</div>'
        ).join('');
    }

    /* ============================================
       SKILLS — Tools
       ============================================ */
    function renderSkillsTools(data) {
        const grid = document.getElementById('skillsToolsGrid');
        if (!grid) return;
        grid.innerHTML = data.skillsTools.map((t, i) => {
            const icon = TOOL_ICONS[t.title] || TOOL_ICONS['Programming'];
            const note = t.note ? '<p class="skill-tag-note">' + esc(t.note) + '</p>' : '';
            const tags = (t.tags || []).map((tag) => '<span class="skill-tag">' + esc(tag) + '</span>').join('');
            return '<div class="skill-card reveal" style="--i:' + i + '">' +
                '<div class="skill-card-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + icon.color + '" stroke-width="1.5">' + icon.svg + '</svg></div>' +
                '<h3>' + esc(t.title) + '</h3><div class="skill-tags">' + tags + '</div>' + note +
                '</div>';
        }).join('');
    }

    /* ============================================
       SKILLS — Courses (uses the same .banner-card modal as Programming/Design)
       ============================================ */
    function renderSkillsCourses(data) {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;
        grid.innerHTML = data.skillsCourses.map((c, i) => {
            const certBtn = c.cert_url
                ? '<a href="' + esc(c.cert_url) + '" class="btn-certificate" target="_blank" rel="noopener">' + ICON_CERT + 'View Certificate</a>'
                : '';
            return '<div class="banner-card reveal" style="--i:' + i + '">' +
                '<div class="banner-card-image"><img src="' + esc(c.image_url) + '" alt="' + esc(c.title) + '" loading="lazy"></div>' +
                '<div class="banner-card-content"><h3>' + esc(c.title) + '</h3><p>' + esc(c.description) + '</p>' + certBtn +
                '</div></div>';
        }).join('');
    }

    /* ============================================
       SKILLS — Events (custom modal: gallery left, text right)
       ============================================ */
    function renderSkillsEvents(data) {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;
        grid.innerHTML = data.skillsEvents.map((ev, i) =>
            '<div class="banner-card reveal" data-event-id="' + ev.id + '" style="--i:' + i + '">' +
            '<div class="banner-card-image"><img src="' + esc(ev.main_image_url) + '" alt="' + esc(ev.title) + '" loading="lazy"></div>' +
            '<div class="banner-card-content"><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.description) + '</p>' +
            '<button type="button" class="btn-view-details">View Details</button></div></div>'
        ).join('');

        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.banner-card[data-event-id]');
            if (!card) return;
            const ev = data.skillsEvents.find((x) => String(x.id) === card.dataset.eventId);
            if (!ev || !modal || !modalBody) return;
            const gallery = [ev.main_image_url].concat(ev.gallery_urls || []);
            modalBody.innerHTML = '<div class="modal-event">' +
                '<div class="modal-event-gallery">' + gallery.map((src) => '<img src="' + esc(src) + '" alt="' + esc(ev.title) + '">').join('') + '</div>' +
                '<div class="modal-event-text"><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.description) + '</p></div>' +
                '</div>';
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    /* ============================================
       SKILLS — Experience (custom modal: logo, company, type, description)
       ============================================ */
    function renderSkillsExperience(data) {
        const grid = document.getElementById('experienceGrid');
        if (!grid) return;
        grid.innerHTML = data.skillsExperience.map((exp, i) =>
            '<div class="experience-card reveal" data-exp-id="' + exp.id + '" style="--i:' + i + '">' +
            '<div class="experience-card-logo"><img src="' + esc(exp.logo_url) + '" alt="' + esc(exp.company) + '" loading="lazy"></div>' +
            '<div class="experience-card-text"><h3>' + esc(exp.company) + '</h3><p>' + esc(exp.exp_type) + '</p></div>' +
            '<button type="button" class="btn-view-details">View Details</button></div>'
        ).join('');

        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.experience-card[data-exp-id]');
            if (!card) return;
            const exp = data.skillsExperience.find((x) => String(x.id) === card.dataset.expId);
            if (!exp || !modal || !modalBody) return;
            modalBody.innerHTML = '<div class="modal-experience">' +
                '<div class="modal-experience-logo"><img src="' + esc(exp.logo_url) + '" alt="' + esc(exp.company) + '"></div>' +
                '<h3>' + esc(exp.company) + '</h3><span class="modal-experience-type">' + esc(exp.exp_type) + '</span>' +
                '<p>' + esc(exp.description) + '</p></div>';
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    /* ============================================
       SKILLS — Education (plain text from site_content)
       ============================================ */
    function renderEducation(data) {
        const el = document.getElementById('educationText');
        if (!el) return;
        el.textContent = data.siteContent.education_text || '';
    }

    /* ============================================
       CONTACT — social links (from site_content)
       ============================================ */
    function renderContactLinks(data) {
        const sc = data.siteContent;
        const email = document.getElementById('socialEmail');
        const whatsapp = document.getElementById('socialWhatsapp');
        const instagram = document.getElementById('socialInstagram');
        const linkedin = document.getElementById('socialLinkedin');

        if (email && sc.contact_email) email.href = 'mailto:' + sc.contact_email;
        if (whatsapp && sc.contact_whatsapp) whatsapp.href = 'https://wa.me/' + sc.contact_whatsapp;
        if (instagram && sc.contact_instagram) instagram.href = 'https://instagram.com/' + sc.contact_instagram;
        if (linkedin && sc.contact_linkedin) linkedin.href = 'https://www.linkedin.com/in/' + sc.contact_linkedin;
    }

})();