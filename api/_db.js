// api/_db.js
// Shared Neon connection. Uses the HTTP-based serverless driver, which is
// what you want in Vercel Functions — no persistent connection pool to
// manage, works cleanly with scale-to-zero.
//
// DATABASE_URL is already set automatically by the Vercel + Neon
// integration from Phase 1 — nothing to configure here.

const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Check Vercel → Project → Settings → Environment Variables.');
}

const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };