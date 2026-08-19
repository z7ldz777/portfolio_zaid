// api/contact.js
// Public. The "Send a Message" form on the live site posts here.
// No auth required — this is what a logged-out visitor is supposed to
// be able to do. Basic validation only, no rate limiting yet (fine for
// a personal portfolio's traffic level; revisit if it ever gets spammed).

const { sql } = require('./_db');

const MAX_LEN = 4000; // generous cap so a huge paste can't bloat the table

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { name, email, message } = req.body || {};

        if (!name || !email || !message) {
            res.status(400).json({ error: 'Name, email, and message are all required' });
            return;
        }
        if (name.length > 200 || email.length > 200 || message.length > MAX_LEN) {
            res.status(400).json({ error: 'One of the fields is too long' });
            return;
        }
        // Very basic shape check — not trying to be a full email validator,
        // just catching obviously-wrong input.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'That email address doesn\'t look right' });
            return;
        }

        await sql`INSERT INTO contact_messages (name, email, message) VALUES (${name}, ${email}, ${message})`;

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not send your message. Please try again.' });
    }
};