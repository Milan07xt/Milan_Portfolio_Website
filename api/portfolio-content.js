const { defaultContent, fetchStoredContent } = require('../lib/portfolio-content');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_URL === 'https://your-project.supabase.co' ||
      process.env.SUPABASE_SERVICE_ROLE_KEY === 'your-supabase-service-role-key') {
    return res.status(200).json(defaultContent);
  }

  try {
    return res.status(200).json(await fetchStoredContent());
  } catch (error) {
    console.error('Public portfolio content API failed:', error.message);
    return res.status(502).json({ error: 'Unable to load portfolio content.' });
  }
};
