// api/upload.js
// Protected. The admin dashboard sends a file here (as raw bytes, with
// the target filename in a query param) and gets back a public URL to
// store in the database (e.g. as a banner_url or logo_url).
//
// Only small images (banners/logos) are meant to go through this —
// videos, audio, and PDFs stay on your existing static host as before.
//
// Required env var: BLOB_READ_WRITE_TOKEN — added automatically once you
// create a Blob store in Vercel → Storage → Create Database → Blob.

const { put } = require('@vercel/blob');
const { requireAuth } = require('./_auth');

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — plenty for a banner/logo image

module.exports = async (req, res) => {
    if (!requireAuth(req, res)) return;

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const filename = req.query.filename;
    if (!filename) {
        res.status(400).json({ error: 'Missing ?filename=' });
        return;
    }

    try {
        const chunks = [];
        let total = 0;
        for await (const chunk of req) {
            total += chunk.length;
            if (total > MAX_BYTES) {
                res.status(413).json({ error: 'File too large (8MB max)' });
                return;
            }
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const blob = await put(filename, buffer, {
            access: 'public',
            addRandomSuffix: true, // avoids overwriting a file with the same name
        });

        res.status(200).json({ url: blob.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
};

// Vercel needs raw body access here (we're reading the stream ourselves
// above), so turn off the default JSON body parsing for this route.
module.exports.config = {
    api: {
        bodyParser: false,
    },
};