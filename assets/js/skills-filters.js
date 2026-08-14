(function () {
    'use strict';

    /* ---- SKILLS CATEGORY SWITCHING ---- */
    const filterBar = document.getElementById('skillsFilters');
    if (!filterBar) return;

    const btns = filterBar.querySelectorAll('.filter-btn');
    const categories = document.querySelectorAll('.skills-category');

    function showCategory(cat) {
        categories.forEach(block => {
            block.hidden = block.dataset.skillsCat !== cat;
        });
    }

    const initialBtn = filterBar.querySelector('.filter-btn.active') || btns[0];
    if (initialBtn) showCategory(initialBtn.dataset.skillsFilter);

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showCategory(btn.dataset.skillsFilter);
        });
    });

})();