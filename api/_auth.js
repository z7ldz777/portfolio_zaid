// api/_auth.js
// Minimal, dependency-free auth for a single admin account.
//
// Password hashing: Node's built-in scrypt (no bcryptjs needed).
// Sessions: a signed cookie (HMAC-SHA256 over "expiry.email", using
// SESSION_SECRET) — not a JWT library, just enough to prove the cookie
// wasn't tampered with and hasn't expired. Stateless, nothing stored
// server-side, which is exactly what you want on serverless functions.
//
// Required env var: SESSION_SECRET — any long random string.
// Set it in Vercel → Project → Settings → Environment Variables.

const crypto = require('crypto');

const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function assertSecret() {
    if (!SESSION_SECRET) {
        throw new Error('SESSION_SECRET is not set. Add it in Vercel → Settings → Environment Variables.');
    }
}

// ---- Password hashing ----

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const check = crypto.scryptSync(password, salt, 64).toString('hex');
    // timing-safe compare
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(check, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- Session cookie ----

function sign(value) {
    assertSecret();
    return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function createSessionCookie(email) {
    const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
    const payload = `${expires}.${email}`;
    const signature = sign(payload);
    const token = Buffer.from(`${payload}.${signature}`).toString('base64url');
    return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

function clearSessionCookie() {
    return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(header) {
    const out = {};
    if (!header) return out;
    header.split(';').forEach((pair) => {
        const idx = pair.indexOf('=');
        if (idx === -1) return;
        out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
    });
    return out;
}

// Returns the admin email if the request has a valid, unexpired session
// cookie — otherwise null. Use this to gate every admin-only endpoint.
function getSessionEmail(req) {
    try {
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies[SESSION_COOKIE];
        if (!token) return null;

        const decoded = Buffer.from(token, 'base64url').toString('utf8');
        const lastDot = decoded.lastIndexOf('.');
        const payload = decoded.slice(0, lastDot);
        const signature = decoded.slice(lastDot + 1);

        if (sign(payload) !== signature) return null;

        const [expiresStr, email] = payload.split('.');
        if (Date.now() > Number(expiresStr)) return null;

        return email;
    } catch {
        return null;
    }
}

// Call at the top of any admin-only handler. Sends 401 and returns false
// if not authenticated; returns true (and you continue) if it's fine.
function requireAuth(req, res) {
    const email = getSessionEmail(req);
    if (!email) {
        res.status(401).json({ error: 'Not authenticated' });
        return false;
    }
    return true;
}

module.exports = {
    hashPassword,
    verifyPassword,
    createSessionCookie,
    clearSessionCookie,
    getSessionEmail,
    requireAuth,
};