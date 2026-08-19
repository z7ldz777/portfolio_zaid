// api/upload.js
// Protected. The admin dashboard sends a file here as base64 JSON and
// gets back a public Vercel Blob URL to store in the database (e.g. as
// a banner_url or logo_url).
//
// Why base64 JSON instead of a raw file stream: Vercel Functions have a
// hard, non-configurable 4.5MB request body limit either way, and raw
// stream reading depends on disabling the platform's automatic body
// parsing — a mechanism that's well-documented for Next.js but not
// reliably confirmed for plain (non-Next.js) Vercel functions like this
// one. Using the default JSON body parsing (which Vercel guarantees
// works) is simpler and more reliable, at the cost of the ~33% size
// overhead base64 adds — acceptable for banner/logo images.
//
// Only small images (banners/logos) are meant to go through this —
// videos, audio, and PDFs stay on your existing static host as before.
//
// Required env var: BLOB_READ_WRITE_TOKEN — added automatically once you
// create a Blob store in Vercel → Storage → Create Database → Blob.

const { put } = require('@vercel/blob');
const { requireAuth } = require('./_auth');

// Original file size cap. Base64-encoded, this stays comfortably under
// Vercel's fixed 4.5MB request body limit.
const MAX_BYTES = 3 * 1024 * 1024; // 3MB

module.exports = async (req, res) => {
    if (!requireAuth(req, res)) return;

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { filename, dataBase64, contentType } = req.body || {};
        if (!filename || !dataBase64) {
            res.status(400).json({ error: 'Missing filename or file data' });
            return;
        }

        const buffer = Buffer.from(dataBase64, 'base64');
        if (buffer.length > MAX_BYTES) {
            res.status(413).json({ error: 'File too large — please use an image under 3MB' });
            return;
        }

        const blob = await put(filename, buffer, {
            access: 'public',
            addRandomSuffix: true, // avoids overwriting a file with the same name
            contentType: contentType || undefined,
        });

        res.status(200).json({ url: blob.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
};