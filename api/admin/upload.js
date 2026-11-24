const { isAuthorized } = require('../../lib/admin-auth');
const { uploadImage } = require('../../lib/portfolio-content');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,X-Requested-With');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized.' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { data, mimeType } = req.body || {};
    const imageUrl = await uploadImage(data, mimeType);
    return res.status(201).json({ imageUrl });
  } catch (error) {
    console.error('Admin image upload failed:', error.message);
    return res.status(error.statusCode || 502).json({ error: error.message });
  }
};
