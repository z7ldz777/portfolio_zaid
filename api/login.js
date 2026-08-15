// api/login.js
// POST { email, password } -> sets a signed session cookie if correct.
// Phase 4 is where we actually insert your admin row into the database;
// this endpoint just checks against whatever's there.

const { sql } = require('./_db');
const { verifyPassword, createSessionCookie } = require('./_auth');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const rows = await sql`SELECT email, password_hash FROM admin_user WHERE email = ${email} LIMIT 1`;
        const user = rows[0];

        // Same generic error whether the email doesn't exist or the password
        // is wrong — don't give an attacker a way to enumerate valid emails.
        if (!user || !verifyPassword(password, user.password_hash)) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        res.setHeader('Set-Cookie', createSessionCookie(user.email));
        res.status(200).json({ ok: true, email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};