// api/content.js
// Public, read-only. The live portfolio site calls this once to get
// everything it needs to render Video Editing / Programming / Design /
// Songs / Skills. No auth required — this is exactly what a logged-out
// visitor is supposed to see.

const { sql } = require('./_db');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const [
            categories,
            videos,
            programmingProjects,
            designProjects,
            songs,
            skillsTools,
            skillsCourses,
            skillsEvents,
            skillsExperience,
            siteContentRows,
        ] = await Promise.all([
            sql`SELECT id, section, slug, label, sort_order FROM categories ORDER BY section, sort_order`,
            sql`
        SELECT v.id, v.title, v.youtube_id, v.is_short, v.sort_order, c.slug AS category
        FROM videos v LEFT JOIN categories c ON c.id = v.category_id
        ORDER BY c.sort_order, v.sort_order
      `,
            sql`
        SELECT p.id, p.title, p.description, p.banner_url, p.github_url, p.file_url, p.file_type, p.sort_order, c.slug AS category
        FROM programming_projects p LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY c.sort_order, p.sort_order
      `,
            sql`
        SELECT d.id, d.title, d.description, d.banner_url, d.link_url, d.sort_order, c.slug AS category
        FROM design_projects d LEFT JOIN categories c ON c.id = d.category_id
        ORDER BY c.sort_order, d.sort_order
      `,
            sql`SELECT id, title, audio_url, cover_url, sort_order FROM songs ORDER BY sort_order`,
            sql`SELECT id, title, tags, note, sort_order FROM skills_tools ORDER BY sort_order`,
            sql`SELECT id, title, description, image_url, cert_url, sort_order FROM skills_courses ORDER BY sort_order`,
            sql`SELECT id, title, description, main_image_url, gallery_urls, sort_order FROM skills_events ORDER BY sort_order`,
            sql`SELECT id, company, exp_type, description, logo_url, sort_order FROM skills_experience ORDER BY sort_order`,
            sql`SELECT key, value FROM site_content`,
        ]);

        // Group categories by section for convenience on the front end.
        const categoriesBySection = {};
        for (const c of categories) {
            (categoriesBySection[c.section] ||= []).push(c);
        }

        const siteContent = {};
        for (const row of siteContentRows) {
            siteContent[row.key] = row.value;
        }

        res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=30');
        res.status(200).json({
            categories: categoriesBySection,
            videos,
            programmingProjects,
            designProjects,
            songs,
            skillsTools,
            skillsCourses,
            skillsEvents,
            skillsExperience,
            siteContent,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load content' });
    }
};