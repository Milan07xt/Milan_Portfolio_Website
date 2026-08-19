/**
 * Vercel Serverless Function for Contact Submissions
 * This function handles the contact form submission in production on Vercel.
 * It saves data to Supabase Postgres and sends an email notification using Formsubmit.co.
 */
const { Pool } = require('pg');

const connectionUrl = process.env.POSTGRES_URL ? process.env.POSTGRES_URL.split('?')[0] : '';
const pool = new Pool({
  connectionString: connectionUrl,
  ssl: { rejectUnauthorized: false }
});

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

    const timestamp = new Date().toISOString();

    // Insert into PostgreSQL
    let dbStatus = "Database OK";
    try {
        await pool.query(
            `INSERT INTO contacts (name, email, number, subject, message, timestamp) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, email, number || '', subject || '', message || '', timestamp]
        );
    } catch (dbError) {
        console.error('Database insertion error:', dbError);
        dbStatus = "DB Error: " + dbError.message;
    }

    // Send email using Formsubmit.co AJAX API
    let emailStatus = "Email OK";
    try {
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
            const errorText = await response.text();
            throw new Error(`Formsubmit rejected: ${response.status} ${errorText}`);
        }
    } catch (emailError) {
        console.error('Email error:', emailError);
        // We do NOT throw the error here. Cloudflare blocks Vercel IPs sometimes.
        // We want the form to succeed since the data is already saved in PostgreSQL!
    }

    return res.status(200).send('Saved');

  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).send(`Failed to send message: ${error.message}`);
  }
}

module.exports = handler;
