// api/admin/[table].js
// Protected CRUD for every "list of items" table (videos, programming
// projects, design projects, songs, courses, events, experience, tools,
// categories). One file handles all of them via a whitelist below, so
// adding a brand new content type later is a config change here, not a
// new file.
//
// GET    /api/admin/videos            -> list all rows
// POST   /api/admin/videos            -> create a row (body = column values)
// PUT    /api/admin/videos?id=5       -> update row 5 (body = column values to change)
// DELETE /api/admin/videos?id=5       -> delete row 5
//
// Every request here requires a valid admin session cookie.

const { sql } = require('../_db');
const { requireAuth } = require('../_auth');

// Table name -> which columns admin requests are allowed to write,
// plus an optional custom sort order (defaults to sort_order, id).
// This whitelist is what keeps this generic endpoint safe: column/table
// identifiers NEVER come from the request, only from here.
const TABLES = {
    categories: { columns: ['section', 'slug', 'label', 'sort_order'] },
    videos: { columns: ['category_id', 'title', 'youtube_id', 'is_short', 'sort_order'] },
    programming_projects: { columns: ['category_id', 'title', 'description', 'banner_url', 'github_url', 'file_url', 'file_type', 'sort_order'] },
    design_projects: { columns: ['category_id', 'title', 'description', 'banner_url', 'link_url', 'sort_order'] },
    songs: { columns: ['title', 'audio_url', 'cover_url', 'sort_order'] },
    skills_tools: { columns: ['title', 'tags', 'note', 'sort_order'] },
    skills_courses: { columns: ['title', 'description', 'image_url', 'cert_url', 'sort_order'] },
    skills_events: { columns: ['title', 'description', 'main_image_url', 'gallery_urls', 'sort_order'] },
    skills_experience: { columns: ['company', 'exp_type', 'description', 'logo_url', 'sort_order'] },
    // Rows here are created by the public /api/contact endpoint, not by
    // the admin — only is_read is writable from this side (marking a
    // message read/unread). Newest messages first, not by sort_order.
    contact_messages: { columns: ['is_read'], orderBy: 'created_at DESC' },
};

module.exports = async (req, res) => {
    if (!requireAuth(req, res)) return;

    const { table, id } = req.query;
    const tableConfig = TABLES[table];

    if (!tableConfig) {
        res.status(404).json({ error: `Unknown table "${table}"` });
        return;
    }
    const allowedColumns = tableConfig.columns;
    const orderBy = tableConfig.orderBy || 'sort_order, id';

    try {
        if (req.method === 'GET') {
            const rows = await sql.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
            res.status(200).json(rows);
            return;
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            const columns = Object.keys(body).filter((k) => allowedColumns.includes(k));
            if (columns.length === 0) {
                res.status(400).json({ error: 'No valid fields provided' });
                return;
            }
            const values = columns.map((c) => body[c]);
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const rows = await sql.query(
                `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
                values
            );
            res.status(201).json(rows[0]);
            return;
        }

        if (req.method === 'PUT') {
            if (!id) {
                res.status(400).json({ error: 'Missing ?id=' });
                return;
            }
            const body = req.body || {};
            const columns = Object.keys(body).filter((k) => allowedColumns.includes(k));
            if (columns.length === 0) {
                res.status(400).json({ error: 'No valid fields provided' });
                return;
            }
            const values = columns.map((c) => body[c]);
            const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(', ');
            const rows = await sql.query(
                `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`,
                [...values, id]
            );
            if (rows.length === 0) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            res.status(200).json(rows[0]);
            return;
        }

        if (req.method === 'DELETE') {
            if (!id) {
                res.status(400).json({ error: 'Missing ?id=' });
                return;
            }
            await sql.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
            res.status(204).end();
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};