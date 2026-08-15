// api/me.js
// GET -> { authenticated: true, email } or { authenticated: false }.
// The admin dashboard calls this on page load to decide whether to show
// the login form or the dashboard itself.

const { getSessionEmail } = require('./_auth');

module.exports = async (req, res) => {
    const email = getSessionEmail(req);
    res.status(200).json(email ? { authenticated: true, email } : { authenticated: false });
};