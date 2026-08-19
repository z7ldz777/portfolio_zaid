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

// Support projects that use a custom env var prefix for their Blob store
// (Vercel can create env names like MYAPP_BLOB_READ_WRITE_TOKEN). If a
// standard `BLOB_READ_WRITE_TOKEN` isn't set we'll search for any
// environment variable that ends with `_READ_WRITE_TOKEN` and use that.
function resolveBlobToken() {
    // Prefer a custom-prefixed token (e.g. PORTFOLIO_BLOB_READ_WRITE_TOKEN)
    // over a managed `BLOB_READ_WRITE_TOKEN` so projects can keep the
    // old store connection while using a new public store via a prefixed
    // env var created by the Blob UI.
    for (const k of Object.keys(process.env)) {
        if (k.endsWith('_READ_WRITE_TOKEN') && k !== 'BLOB_READ_WRITE_TOKEN') {
            return process.env[k];
        }
    }
    // Fallback to the canonical var if no prefixed token found.
    return process.env.BLOB_READ_WRITE_TOKEN;
}

const RESOLVED_BLOB_TOKEN = resolveBlobToken();
if (RESOLVED_BLOB_TOKEN && !process.env.BLOB_READ_WRITE_TOKEN) {
    // set the canonical env var so @vercel/blob can pick it up
    process.env.BLOB_READ_WRITE_TOKEN = RESOLVED_BLOB_TOKEN;
}

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
        // Ensure Vercel Blob token is configured — helps diagnose misconfiguration
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('BLOB_READ_WRITE_TOKEN is not set in environment');
            res.status(500).json({ error: 'Server misconfiguration: blob storage token missing' });
            return;
        }
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

        try {
            const blob = await put(filename, buffer, {
                access: 'public',
                addRandomSuffix: true, // avoids overwriting a file with the same name
                contentType: contentType || undefined,
            });
            res.status(200).json({ url: blob.url });
        } catch (innerErr) {
            console.error('Blob upload error:', innerErr && innerErr.message ? innerErr.message : innerErr);
            res.status(502).json({ error: 'Blob upload failed: ' + (innerErr && innerErr.message ? innerErr.message : 'unknown error') });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err && err.message ? err.message : 'Upload failed' });
    }
};