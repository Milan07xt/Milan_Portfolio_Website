const { isAuthorized } = require('../../lib/admin-auth');
const { fetchStoredContent, saveStoredContent } = require('../../lib/portfolio-content');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ content: await fetchStoredContent() });
    }
    if (req.method === 'PUT') {
      await saveStoredContent(req.body && req.body.content);
      return res.status(200).json({ success: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Admin content API failed:', error.message);
    return res.status(error.statusCode || 502).json({ error: error.message });
  }
};
