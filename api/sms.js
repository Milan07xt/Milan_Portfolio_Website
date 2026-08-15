async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, number, subject, message } = req.body || {};
    
    const smsText = `Portfolio Contact!\nName: ${name}\nEmail: ${email}\nPhone: ${number}\nMsg: ${message}`;

    // Using Textbelt API for free SMS delivery to India (+91)
    const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phone: '+919327599254',
            message: smsText,
            key: 'textbelt'
        })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('SMS API Error:', error);
    return res.status(500).send('Failed to send SMS');
  }
}

module.exports = handler;
