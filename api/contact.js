/**
 * Vercel Serverless Function for Contact Submissions
 * This function handles the contact form submission in production on Vercel.
 * It sends an email notification using nodemailer.
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email credentials missing in environment variables.');
        return res.status(500).send('Email configuration missing on server');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: `New Portfolio Contact: ${subject || 'No Subject'}`,
        text: `You have received a new contact submission from your portfolio:\n\nName: ${name}\nEmail: ${email}\nPhone: ${number || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message || 'N/A'}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Note: Vercel has a read-only filesystem, so we don't write to contact.csv in production.
    // The email serves as the primary notification and storage.

    return res.status(200).send('Saved');

  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).send('Failed to send message');
  }
}

module.exports = handler;
