/**
 * Vercel Serverless Function for Admin Contacts
 * Handles retrieving, deleting, and clearing contact form submissions.
 */

const { isAuthorized } = require('../../lib/admin-auth');
const path = require('path');
const fs = require('fs');

async function getPostgresPool() {
  if (!process.env.POSTGRES_URL) return null;
  try {
    const { Pool } = require('pg');
    const connectionUrl = process.env.POSTGRES_URL.split('?')[0];
    return new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('Postgres connection failed:', err.message);
    return null;
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Require admin authentication
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const pool = await getPostgresPool();
  const action = req.query.action || (req.body && req.body.action);

  try {
    // 1. GET Contacts
    if (req.method === 'GET') {
      if (pool) {
        const result = await pool.query('SELECT * FROM contacts ORDER BY id ASC');
        await pool.end();
        const contacts = result.rows.map(row => ({
          ...row,
          index: row.id
        }));
        return res.status(200).json(contacts);
      }

      // Fallback: If running in local environment with SQLite
      const dbPath = path.join(process.cwd(), 'portfolio.db');
      if (fs.existsSync(dbPath)) {
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database(dbPath);
        return new Promise((resolve) => {
          db.all('SELECT * FROM contacts ORDER BY id ASC', [], (err, rows) => {
            db.close();
            if (err) {
              return resolve(res.status(500).json({ error: 'Failed to read database' }));
            }
            const contacts = (rows || []).map(row => ({
              ...row,
              index: row.id
            }));
            return resolve(res.status(200).json(contacts));
          });
        });
      }

      return res.status(200).json([]);
    }

    // 2. DELETE single contact or CLEAR all contacts
    if (req.method === 'POST' || req.method === 'DELETE') {
      const isClear = action === 'clear' || (req.url && req.url.includes('/clear'));
      const isDelete = action === 'delete' || (req.url && req.url.includes('/delete'));

      if (isClear) {
        if (pool) {
          await pool.query('DELETE FROM contacts');
          await pool.end();
          return res.status(200).send('Cleared all contacts');
        }

        const dbPath = path.join(process.cwd(), 'portfolio.db');
        if (fs.existsSync(dbPath)) {
          const sqlite3 = require('sqlite3').verbose();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve) => {
            db.run('DELETE FROM contacts', [], (err) => {
              db.close();
              if (err) return resolve(res.status(500).send('Failed to clear'));
              return resolve(res.status(200).send('Cleared all contacts'));
            });
          });
        }

        return res.status(200).send('Cleared all contacts');
      }

      if (isDelete || (req.body && req.body.index !== undefined)) {
        const index = req.body && req.body.index !== undefined ? req.body.index : req.query.index;
        if (index === undefined) {
          return res.status(400).send('Index is required');
        }

        if (pool) {
          await pool.query('DELETE FROM contacts WHERE id = $1', [index]);
          await pool.end();
          return res.status(200).send('Deleted successfully');
        }

        const dbPath = path.join(process.cwd(), 'portfolio.db');
        if (fs.existsSync(dbPath)) {
          const sqlite3 = require('sqlite3').verbose();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve) => {
            db.run('DELETE FROM contacts WHERE id = ?', [index], (err) => {
              db.close();
              if (err) return resolve(res.status(500).send('Failed to delete'));
              return resolve(res.status(200).send('Deleted successfully'));
            });
          });
        }

        return res.status(200).send('Deleted successfully');
      }
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });

  } catch (error) {
    console.error('Admin contacts error:', error);
    if (pool) await pool.end().catch(() => {});
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

