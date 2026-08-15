/**
 * Vercel Serverless Function for Contact Submissions
 * This function handles the contact form submission in production on Vercel.
 * It sends an email notification using Formsubmit.co (no passwords required).
 */

async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, number, subject, message } = req.body || {};
    
    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }

    // Send email using Formsubmit.co AJAX API
    const response = await fetch('https://formsubmit.co/ajax/rathodmilan216@gmail.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            email: email,
            phone: number || 'N/A',
            subject: subject || 'New Portfolio Contact',
            message: message || 'N/A',
            _subject: `New Portfolio Contact from ${name}`
        })
    });

    if (!response.ok) {
        throw new Error('Failed to send email via Formsubmit');
    }
    
    // Note: Vercel has a read-only filesystem, so we don't write to contact.csv in production.
    // The email serves as the primary notification and storage.

    return res.status(200).send('Saved');

  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).send('Failed to send message');
  }
}

module.exports = handler;
