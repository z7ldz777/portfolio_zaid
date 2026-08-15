// api/admin/site-content.js
// Protected. Handles the key-value site_content table separately since it
// uses "key" as its primary key instead of an auto-incrementing id.
//
// GET  /api/admin/site-content          -> { key: value, key: value, ... }
// PUT  /api/admin/site-content          -> body: { key: "...", value: "..." } (upsert)

const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async (req, res) => {
    if (!requireAuth(req, res)) return;

    try {
        if (req.method === 'GET') {
            const rows = await sql`SELECT key, value FROM site_content`;
            const out = {};
            for (const r of rows) out[r.key] = r.value;
            res.status(200).json(out);
            return;
        }

        if (req.method === 'PUT') {
            const { key, value } = req.body || {};
            if (!key) {
                res.status(400).json({ error: 'Missing "key"' });
                return;
            }
            const rows = await sql`
        INSERT INTO site_content (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        RETURNING key, value
      `;
            res.status(200).json(rows[0]);
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};