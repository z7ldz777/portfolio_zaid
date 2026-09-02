(function () {
    'use strict';

    /* ============================================
       CONFIG — one entry per content table. This is the
       client-side mirror of the whitelist in api/admin/[table].js.
       Adding a brand-new content type later means adding one
       entry here (plus the matching table in the DB) — the rest
       of this file (list rendering, forms, save/delete) is generic.
       ============================================ */
    const SECTIONS = {
        videos: {
            label: 'Video Editing',
            group: 'Content',
            table: 'videos',
            fields: [
                { key: 'category_id', label: 'Category', type: 'category-select', section: 'video_editing' },
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'youtube_id', label: 'YouTube Video ID', type: 'text', required: true, hint: 'The part after v= in the YouTube URL' },
                { key: 'is_short', label: 'This is a YouTube Short', type: 'checkbox' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => r.youtube_id,
            imageOf: (r) => 'https://img.youtube.com/vi/' + r.youtube_id + '/default.jpg',
        },
        programming_projects: {
            label: 'Programming',
            group: 'Content',
            table: 'programming_projects',
            fields: [
                { key: 'category_id', label: 'Category', type: 'category-select', section: 'programming' },
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'banner_url', label: 'Banner Image', type: 'image' },
                { key: 'github_url', label: 'GitHub Link', type: 'url' },
                { key: 'file_url', label: 'File path (only for a Graduation doc/pptx entry)', type: 'text' },
                { key: 'file_type', label: 'File type — "pptx" or "docx" (leave blank otherwise)', type: 'text' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => r.category,
            imageOf: (r) => r.banner_url,
        },
        design_projects: {
            label: 'Design',
            group: 'Content',
            table: 'design_projects',
            fields: [
                { key: 'category_id', label: 'Category', type: 'category-select', section: 'design' },
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'banner_url', label: 'Banner Image', type: 'image' },
                { key: 'link_url', label: 'Figma Link (Figma category only)', type: 'url' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => r.category,
            imageOf: (r) => r.banner_url,
        },
        songs: {
            label: 'Songs',
            group: 'Content',
            table: 'songs',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'audio_url', label: 'Audio file path (in assets/, not uploaded here)', type: 'text', required: true },
                { key: 'cover_url', label: 'Cover Image', type: 'image' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => r.audio_url,
            imageOf: (r) => r.cover_url,
        },
        skills_tools: {
            label: 'Skills — Tools',
            group: 'Skills',
            table: 'skills_tools',
            fields: [
                { key: 'title', label: 'Title (e.g. "Design")', type: 'text', required: true },
                { key: 'tags', label: 'Tags — comma separated', type: 'tags' },
                { key: 'note', label: 'Note (optional)', type: 'text' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => (r.tags || []).join(', '),
        },
        skills_courses: {
            label: 'Skills — Courses',
            group: 'Skills',
            table: 'skills_courses',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'image_url', label: 'Course Image', type: 'image' },
                { key: 'cert_url', label: 'Certificate Link', type: 'url' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => r.description,
            imageOf: (r) => r.image_url,
        },
        skills_events: {
            label: 'Skills — Events',
            group: 'Skills',
            table: 'skills_events',
            fields: [
                { key: 'title', label: 'Title', type: 'text', required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'main_image_url', label: 'Main Image', type: 'image' },
                { key: 'gallery_urls', label: 'Extra gallery images', type: 'gallery' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.title,
            subOf: (r) => r.description,
            imageOf: (r) => r.main_image_url,
        },
        skills_experience: {
            label: 'Skills — Experience',
            group: 'Skills',
            table: 'skills_experience',
            fields: [
                { key: 'company', label: 'Company Name', type: 'text', required: true },
                { key: 'exp_type', label: 'Experience Type (e.g. Internship)', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'logo_url', label: 'Company Logo', type: 'image' },
                { key: 'sort_order', label: 'Order', type: 'number' },
            ],
            titleOf: (r) => r.company,
            subOf: (r) => r.exp_type,
            imageOf: (r) => r.logo_url,
        },
    };

    const CATEGORY_SECTION_LABELS = {
        video_editing: 'Video Editing',
        programming: 'Programming',
        design: 'Design',
    };

    /* ============================================
       STATE + DOM
       ============================================ */
    let categoriesCache = null; // all rows from the categories table, fetched once and reused
    let currentKey = null;

    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const dashboard = document.getElementById('dashboard');
    const sidebarNav = document.getElementById('sidebarNav');
    const logoutBtn = document.getElementById('logoutBtn');
    const panelTitle = document.getElementById('panelTitle');
    const addNewBtn = document.getElementById('addNewBtn');
    const itemList = document.getElementById('itemList');
    const statusMessage = document.getElementById('statusMessage');
    const formOverlay = document.getElementById('formOverlay');
    const formTitle = document.getElementById('formTitle');
    const formCloseBtn = document.getElementById('formCloseBtn');
    const itemForm = document.getElementById('itemForm');

    function esc(str) {
        return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]); // strip the "data:<mime>;base64," prefix
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        statusMessage.hidden = false;
        setTimeout(() => { statusMessage.hidden = true; }, 3500);
    }

    /* ============================================
       AUTH
       ============================================ */
    async function checkAuth() {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.authenticated) {
            loginScreen.hidden = true;
            dashboard.hidden = false;
            buildSidebar();
            loadSection(Object.keys(SECTIONS)[0]);
        } else {
            loginScreen.hidden = false;
            dashboard.hidden = true;
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.hidden = true;
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                loginError.textContent = data.error || 'Login failed';
                loginError.hidden = false;
                return;
            }
            checkAuth();
        } catch {
            loginError.textContent = 'Could not reach the server. Try again.';
            loginError.hidden = false;
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        checkAuth();
    });

    /* ============================================
       SIDEBAR
       ============================================ */
    function buildSidebar() {
        const groups = { Content: [], Skills: [] };
        Object.entries(SECTIONS).forEach(([key, cfg]) => groups[cfg.group].push(key));

        let html = '';
        Object.entries(groups).forEach(([groupName, keys]) => {
            html += '<div class="nav-group-label">' + esc(groupName) + '</div>';
            keys.forEach((key) => {
                html += '<button data-key="' + key + '">' + esc(SECTIONS[key].label) + '</button>';
            });
        });
        html += '<div class="nav-group-label">Site</div>';
        html += '<button data-key="messages">Messages</button>';
        html += '<button data-key="categories">Categories</button>';
        html += '<button data-key="site_content">Site Text & Contact Info</button>';

        sidebarNav.innerHTML = html;
        sidebarNav.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('click', () => loadSection(btn.dataset.key));
        });
    }

    function setActiveNav(key) {
        sidebarNav.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.key === key));
    }

    /* ============================================
       CATEGORIES CACHE (used by category-select fields
       and by the Categories management screen itself)
       ============================================ */
    async function loadCategories(force) {
        if (categoriesCache && !force) return categoriesCache;
        const res = await fetch('/api/admin/categories');
        categoriesCache = await res.json();
        return categoriesCache;
    }

    /* ============================================
       ROUTING
       ============================================ */
    function loadSection(key) {
        currentKey = key;
        setActiveNav(key);
        if (key === 'categories') return renderCategoriesScreen();
        if (key === 'site_content') return renderSiteContentScreen();
        if (key === 'messages') return renderMessagesScreen();
        return renderTableScreen(key);
    }

    /* ============================================
       GENERIC TABLE SCREEN (list + add/edit/delete)
       ============================================ */
    async function renderTableScreen(key) {
        const cfg = SECTIONS[key];
        panelTitle.textContent = cfg.label;
        addNewBtn.hidden = false;
        addNewBtn.onclick = () => openForm(key, null);
        itemList.innerHTML = '<div class="empty-state">Loading…</div>';

        const res = await fetch('/api/admin/' + cfg.table);
        const rows = await res.json();
        await loadCategories(false);

        if (!rows.length) {
            itemList.innerHTML = '<div class="empty-state">Nothing here yet — click "+ Add New" to create the first one.</div>';
            return;
        }

        itemList.innerHTML = rows.map((row) => {
            const img = cfg.imageOf ? cfg.imageOf(row) : null;
            return '<div class="item-row" data-id="' + row.id + '">' +
                (img ? '<img src="' + esc(img) + '" alt="">' : '') +
                '<div class="item-row-main">' +
                '<div class="item-row-title">' + esc(cfg.titleOf(row)) + '</div>' +
                '<div class="item-row-sub">' + esc(cfg.subOf ? cfg.subOf(row) : '') + '</div>' +
                '</div>' +
                '<div class="item-row-actions">' +
                '<button class="edit-btn">Edit</button>' +
                '<button class="btn-danger delete-btn">Delete</button>' +
                '</div></div>';
        }).join('');

        itemList.querySelectorAll('.item-row').forEach((rowEl) => {
            const id = rowEl.dataset.id;
            const row = rows.find((r) => String(r.id) === id);
            rowEl.querySelector('.edit-btn').addEventListener('click', () => openForm(key, row));
            rowEl.querySelector('.delete-btn').addEventListener('click', () => deleteItem(key, id));
        });
    }

    async function deleteItem(key, id) {
        if (!confirm('Delete this item? This can\'t be undone.')) return;
        const cfg = SECTIONS[key];
        const res = await fetch('/api/admin/' + cfg.table + '?id=' + id, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            showStatus('Deleted.', 'success');
            renderTableScreen(key);
        } else {
            showStatus('Failed to delete.', 'error');
        }
    }

    /* ============================================
       FORM (add/edit) — built from the section's field schema
       ============================================ */
    async function openForm(key, existing) {
        const cfg = SECTIONS[key];
        formTitle.textContent = existing ? 'Edit' : 'Add New';
        itemForm.innerHTML = '<div class="empty-state">Loading…</div>';
        formOverlay.hidden = false;

        const cats = await loadCategories(false);

        let html = '';
        for (const field of cfg.fields) {
            html += renderField(field, existing);
        }
        html += '<div class="form-actions">' +
            '<button type="submit" class="btn-primary">' + (existing ? 'Save Changes' : 'Create') + '</button>' +
            '<button type="button" class="btn-secondary" id="formCancelBtn">Cancel</button>' +
            '</div>';

        itemForm.innerHTML = html;

        // Populate category-select options now that the <select> exists
        cfg.fields.filter((f) => f.type === 'category-select').forEach((f) => {
            const select = itemForm.querySelector('[name="' + f.key + '"]');
            const options = cats.filter((c) => c.section === f.section);
            select.innerHTML = options.map((c) =>
                '<option value="' + c.id + '"' + (existing && existing[f.key] === c.id ? ' selected' : '') + '>' + esc(c.label) + '</option>'
            ).join('');
        });

        // Wire image upload inputs
        itemForm.querySelectorAll('input[type="file"][data-image-field]').forEach((fileInput) => {
            const targetKey = fileInput.dataset.imageField;
            const hiddenInput = itemForm.querySelector('input[name="' + targetKey + '"]');
            const preview = itemForm.querySelector('[data-preview-for="' + targetKey + '"]');
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files[0];
                if (!file) return;
                if (file.size > 3 * 1024 * 1024) {
                    showStatus('That file is over 3MB — please use a smaller image.', 'error');
                    fileInput.value = '';
                    return;
                }
                fileInput.disabled = true;
                try {
                    const dataBase64 = await fileToBase64(file);
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: file.name, dataBase64, contentType: file.type }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Upload failed');
                    hiddenInput.value = data.url;
                    if (preview) { preview.src = data.url; preview.classList.add('visible'); }
                    showStatus('Image uploaded.', 'success');
                } catch (err) {
                    showStatus(err.message || 'Upload failed', 'error');
                } finally {
                    fileInput.disabled = false;
                }
            });
        });

        itemForm.querySelectorAll('input[type="file"][data-gallery-field]').forEach((fileInput) => {
            const galleryKey = fileInput.dataset.galleryField;
            const valueInput = itemForm.querySelector('input[data-gallery-value="' + galleryKey + '"]');
            const galleryList = itemForm.querySelector('[data-gallery-list="' + galleryKey + '"]');
            fileInput.addEventListener('change', async () => {
                const files = Array.from(fileInput.files || []);
                if (!files.length) return;
                if (files.some((file) => file.size > 3 * 1024 * 1024)) {
                    showStatus('Each image must be under 3MB.', 'error');
                    fileInput.value = '';
                    return;
                }
                fileInput.disabled = true;
                try {
                    const uploadedUrls = [];
                    for (const file of files) {
                        const dataBase64 = await fileToBase64(file);
                        const res = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename: file.name, dataBase64, contentType: file.type }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Upload failed');
                        uploadedUrls.push(data.url);
                    }
                    const urls = readGalleryUrls(valueInput);
                    valueInput.value = JSON.stringify(urls.concat(uploadedUrls));
                    renderGalleryPreviews(galleryList, valueInput);
                    showStatus(uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' uploaded.', 'success');
                } catch (err) {
                    showStatus(err.message || 'Upload failed', 'error');
                } finally {
                    fileInput.disabled = false;
                    fileInput.value = '';
                }
            });
        });

        itemForm.querySelector('#formCancelBtn').addEventListener('click', closeForm);

        itemForm.onsubmit = async (e) => {
            e.preventDefault();
            const body = {};
            for (const field of cfg.fields) {
                body[field.key] = readFieldValue(field);
            }
            const submitBtn = itemForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            try {
                const url = existing
                    ? '/api/admin/' + cfg.table + '?id=' + existing.id
                    : '/api/admin/' + cfg.table;
                const res = await fetch(url, {
                    method: existing ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Save failed');
                showStatus(existing ? 'Saved.' : 'Created.', 'success');
                closeForm();
                renderTableScreen(key);
            } catch (err) {
                showStatus(err.message || 'Save failed', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        };
    }

    function renderField(field, existing) {
        const val = existing ? existing[field.key] : '';
        const req = field.required ? ' required' : '';
        const hint = field.hint ? '<div class="form-field-hint">' + esc(field.hint) + '</div>' : '';

        if (field.type === 'category-select') {
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<select name="' + field.key + '"></select>' + hint + '</div>';
        }
        if (field.type === 'textarea') {
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<textarea name="' + field.key + '"' + req + '>' + esc(val) + '</textarea>' + hint + '</div>';
        }
        if (field.type === 'checkbox') {
            return '<div class="form-field form-field-checkbox">' +
                '<label>' + esc(field.label) + '</label>' +
                '<input type="checkbox" name="' + field.key + '"' + (val ? ' checked' : '') + '>' + '</div>';
        }
        if (field.type === 'number') {
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<input type="number" name="' + field.key + '" value="' + esc(val || 0) + '">' + hint + '</div>';
        }
        if (field.type === 'url') {
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<input type="url" name="' + field.key + '" value="' + esc(val) + '">' + hint + '</div>';
        }
        if (field.type === 'tags') {
            const joined = Array.isArray(val) ? val.join(', ') : '';
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<input type="text" name="' + field.key + '" value="' + esc(joined) + '">' + hint + '</div>';
        }
        if (field.type === 'lines') {
            const joined = Array.isArray(val) ? val.join('\n') : '';
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<textarea name="' + field.key + '">' + esc(joined) + '</textarea>' + hint + '</div>';
        }
        if (field.type === 'gallery') {
            const urls = readGalleryUrlsValue(val);
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<div class="gallery-previews" data-gallery-list="' + field.key + '">' +
                urls.map((url) => galleryPreviewHtml(url)).join('') + '</div>' +
                '<input type="file" accept="image/*" multiple data-gallery-field="' + field.key + '">' +
                '<input type="hidden" name="' + field.key + '" data-gallery-value="' + field.key + '" value="' + esc(JSON.stringify(urls)) + '">' +
                '<div class="form-field-hint">Select one or more images. They will be uploaded and added to this gallery.</div>' + hint + '</div>';
        }
        if (field.type === 'image') {
            return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
                '<img class="image-preview' + (val ? ' visible' : '') + '" data-preview-for="' + field.key + '" src="' + esc(val) + '">' +
                '<input type="file" accept="image/*" data-image-field="' + field.key + '">' +
                '<input type="text" name="' + field.key + '" value="' + esc(val) + '" placeholder="or paste an image path/URL directly">' +
                hint + '</div>';
        }
        // default: plain text
        return '<div class="form-field"><label>' + esc(field.label) + '</label>' +
            '<input type="text" name="' + field.key + '" value="' + esc(val) + '"' + req + '>' + hint + '</div>';
    }

    function readFieldValue(field) {
        if (field.type === 'category-select') {
            const el = itemForm.querySelector('[name="' + field.key + '"]');
            return el.value ? Number(el.value) : null;
        }
        if (field.type === 'checkbox') {
            return itemForm.querySelector('[name="' + field.key + '"]').checked;
        }
        if (field.type === 'number') {
            return Number(itemForm.querySelector('[name="' + field.key + '"]').value || 0);
        }
        if (field.type === 'tags') {
            const raw = itemForm.querySelector('[name="' + field.key + '"]').value;
            return raw.split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (field.type === 'lines') {
            const raw = itemForm.querySelector('[name="' + field.key + '"]').value;
            return raw.split('\n').map((s) => s.trim()).filter(Boolean);
        }
        if (field.type === 'gallery') {
            return readGalleryUrls(itemForm.querySelector('input[data-gallery-value="' + field.key + '"]'));
        }
        const el = itemForm.querySelector('[name="' + field.key + '"]');
        const value = el.value.trim();
        return value === '' ? null : value;
    }

    function readGalleryUrlsValue(value) {
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value !== 'string' || !value.trim()) return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return value.split('\n').map((url) => url.trim()).filter(Boolean);
        }
    }

    function readGalleryUrls(input) {
        return readGalleryUrlsValue(input ? input.value : '');
    }

    function galleryPreviewHtml(url) {
        return '<div class="gallery-preview" data-gallery-url="' + esc(url) + '">' +
            '<img src="' + esc(url) + '" alt="">' +
            '<button type="button" class="gallery-remove" aria-label="Remove image">Remove</button></div>';
    }

    function renderGalleryPreviews(galleryList, valueInput) {
        if (!galleryList) return;
        galleryList.innerHTML = readGalleryUrls(valueInput).map((url) => galleryPreviewHtml(url)).join('');
        galleryList.querySelectorAll('.gallery-remove').forEach((removeButton) => {
            removeButton.addEventListener('click', () => {
                const preview = removeButton.closest('[data-gallery-url]');
                const url = preview.dataset.galleryUrl;
                valueInput.value = JSON.stringify(readGalleryUrls(valueInput).filter((item) => item !== url));
                preview.remove();
            });
        });
    }

    function closeForm() {
        formOverlay.hidden = true;
        itemForm.innerHTML = '';
    }

    formCloseBtn.addEventListener('click', closeForm);
    formOverlay.addEventListener('click', (e) => { if (e.target === formOverlay) closeForm(); });

    /* ============================================
       CATEGORIES SCREEN
       ============================================ */
    async function renderCategoriesScreen() {
        panelTitle.textContent = 'Categories';
        addNewBtn.hidden = false;
        addNewBtn.onclick = openCategoryForm;
        itemList.innerHTML = '<div class="empty-state">Loading…</div>';

        const cats = await loadCategories(true);
        if (!cats.length) {
            itemList.innerHTML = '<div class="empty-state">No categories yet.</div>';
            return;
        }

        itemList.innerHTML = cats.map((c) =>
            '<div class="item-row" data-id="' + c.id + '">' +
            '<div class="item-row-main">' +
            '<div class="item-row-title">' + esc(c.label) + '</div>' +
            '<div class="item-row-sub">' + esc(CATEGORY_SECTION_LABELS[c.section] || c.section) + ' &middot; slug: ' + esc(c.slug) + '</div>' +
            '</div>' +
            '<div class="item-row-actions">' +
            '<button class="edit-btn">Edit</button>' +
            '<button class="btn-danger delete-btn">Delete</button>' +
            '</div></div>'
        ).join('');

        itemList.querySelectorAll('.item-row').forEach((rowEl) => {
            const id = rowEl.dataset.id;
            const row = cats.find((r) => String(r.id) === id);
            rowEl.querySelector('.edit-btn').addEventListener('click', () => openCategoryForm(row));
            rowEl.querySelector('.delete-btn').addEventListener('click', async () => {
                if (!confirm('Delete this category? Items using it will keep showing but lose their category tag.')) return;
                const res = await fetch('/api/admin/categories?id=' + id, { method: 'DELETE' });
                if (res.ok || res.status === 204) {
                    showStatus('Deleted.', 'success');
                    renderCategoriesScreen();
                } else {
                    showStatus('Failed to delete.', 'error');
                }
            });
        });
    }

    function openCategoryForm(existing) {
        formTitle.textContent = existing ? 'Edit Category' : 'Add New Category';
        formOverlay.hidden = false;

        itemForm.innerHTML =
            '<div class="form-field"><label>Section</label>' +
            '<select name="section">' +
            Object.entries(CATEGORY_SECTION_LABELS).map(([val, label]) =>
                '<option value="' + val + '"' + (existing && existing.section === val ? ' selected' : '') + '>' + esc(label) + '</option>'
            ).join('') +
            '</select></div>' +
            '<div class="form-field"><label>Slug (no spaces, used internally as the filter value)</label>' +
            '<input type="text" name="slug" value="' + esc(existing ? existing.slug : '') + '" required></div>' +
            '<div class="form-field"><label>Display Label (shown on the filter button)</label>' +
            '<input type="text" name="label" value="' + esc(existing ? existing.label : '') + '" required></div>' +
            '<div class="form-field"><label>Order</label>' +
            '<input type="number" name="sort_order" value="' + esc(existing ? existing.sort_order : 0) + '"></div>' +
            '<div class="form-actions">' +
            '<button type="submit" class="btn-primary">' + (existing ? 'Save Changes' : 'Create') + '</button>' +
            '<button type="button" class="btn-secondary" id="formCancelBtn">Cancel</button>' +
            '</div>';

        itemForm.querySelector('#formCancelBtn').addEventListener('click', closeForm);

        itemForm.onsubmit = async (e) => {
            e.preventDefault();
            const body = {
                section: itemForm.querySelector('[name="section"]').value,
                slug: itemForm.querySelector('[name="slug"]').value.trim(),
                label: itemForm.querySelector('[name="label"]').value.trim(),
                sort_order: Number(itemForm.querySelector('[name="sort_order"]').value || 0),
            };
            try {
                const url = existing ? '/api/admin/categories?id=' + existing.id : '/api/admin/categories';
                const res = await fetch(url, {
                    method: existing ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Save failed');
                showStatus(existing ? 'Saved.' : 'Created.', 'success');
                closeForm();
                renderCategoriesScreen();
            } catch (err) {
                showStatus(err.message || 'Save failed', 'error');
            }
        };
    }

    /* ============================================
       SITE CONTENT (key-value) SCREEN
       ============================================ */
    const SITE_CONTENT_FIELDS = [
        { key: 'education_text', label: 'Education blurb (Skills → Education)' },
        { key: 'hero_tagline', label: 'Contact section tagline' },
        { key: 'contact_email', label: 'Contact email' },
        { key: 'contact_whatsapp', label: 'WhatsApp number (digits only, with country code)' },
        { key: 'contact_instagram', label: 'Instagram handle (no @)' },
        { key: 'contact_linkedin', label: 'LinkedIn profile slug' },
    ];

    async function renderSiteContentScreen() {
        panelTitle.textContent = 'Site Text & Contact Info';
        addNewBtn.hidden = true;
        itemList.innerHTML = '<div class="empty-state">Loading…</div>';

        const res = await fetch('/api/admin/site-content');
        const values = await res.json();

        itemList.innerHTML = SITE_CONTENT_FIELDS.map((f) =>
            '<div class="kv-row" data-key="' + f.key + '">' +
            '<div class="form-field"><label>' + esc(f.label) + '</label>' +
            '<input type="text" value="' + esc(values[f.key] || '') + '"></div>' +
            '<button class="btn-primary save-kv-btn" type="button">Save</button>' +
            '</div>'
        ).join('');

        itemList.querySelectorAll('.kv-row').forEach((row) => {
            const key = row.dataset.key;
            const input = row.querySelector('input');
            row.querySelector('.save-kv-btn').addEventListener('click', async () => {
                try {
                    const res = await fetch('/api/admin/site-content', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key, value: input.value }),
                    });
                    if (!res.ok) throw new Error('Save failed');
                    showStatus('Saved.', 'success');
                } catch {
                    showStatus('Failed to save.', 'error');
                }
            });
        });
    }

    /* ============================================
       MESSAGES SCREEN (submitted via the public contact form)
       ============================================ */
    async function renderMessagesScreen() {
        panelTitle.textContent = 'Messages';
        addNewBtn.hidden = true;
        itemList.innerHTML = '<div class="empty-state">Loading…</div>';

        const res = await fetch('/api/admin/contact_messages');
        const rows = await res.json();

        if (!rows.length) {
            itemList.innerHTML = '<div class="empty-state">No messages yet.</div>';
            return;
        }

        itemList.innerHTML = rows.map((m) => {
            const date = new Date(m.created_at).toLocaleString();
            return '<div class="item-row" data-id="' + m.id + '" style="align-items:flex-start;flex-direction:column;gap:8px;">' +
                '<div style="display:flex;justify-content:space-between;width:100%;gap:12px;">' +
                '<div class="item-row-main">' +
                '<div class="item-row-title">' + esc(m.name) + (m.is_read ? '' : ' &middot; <span style="color:var(--accent3)">new</span>') + '</div>' +
                '<div class="item-row-sub">' + esc(m.email) + ' &middot; ' + esc(date) + '</div>' +
                '</div>' +
                '<div class="item-row-actions">' +
                (m.is_read ? '' : '<button class="mark-read-btn">Mark Read</button>') +
                '<button class="btn-danger delete-msg-btn">Delete</button>' +
                '</div></div>' +
                '<div style="font-size:14px;color:var(--text);white-space:pre-wrap;">' + esc(m.message) + '</div>' +
                '</div>';
        }).join('');

        itemList.querySelectorAll('.item-row').forEach((rowEl) => {
            const id = rowEl.dataset.id;
            const markBtn = rowEl.querySelector('.mark-read-btn');
            if (markBtn) {
                markBtn.addEventListener('click', async () => {
                    await fetch('/api/admin/contact_messages?id=' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_read: true }),
                    });
                    renderMessagesScreen();
                });
            }
            rowEl.querySelector('.delete-msg-btn').addEventListener('click', async () => {
                if (!confirm('Delete this message?')) return;
                await fetch('/api/admin/contact_messages?id=' + id, { method: 'DELETE' });
                showStatus('Deleted.', 'success');
                renderMessagesScreen();
            });
        });
    }

    checkAuth();
})();