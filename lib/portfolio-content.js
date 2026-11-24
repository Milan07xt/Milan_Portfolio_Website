const fs = require('fs');
const path = require('path');
const defaultContent = require('../portfolio-content.json');

const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Inter',
  'Poppins',
  'Roboto',
  'Space Grotesk'
];

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey ||
      url === 'https://your-project.supabase.co' ||
      serviceKey === 'your-supabase-service-role-key') return null;
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return null;
  }
  if (parsedUrl.protocol !== 'https:') {
    return null;
  }
  return { url: parsedUrl.toString().replace(/\/+$/, ''), serviceKey };
}

function getPostgresUrl() {
  const conn = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!conn || conn.includes('placeholder') || conn.includes('your-database')) return null;
  return conn;
}

async function getPostgresPool() {
  const connUrl = getPostgresUrl();
  if (!connUrl) return null;
  try {
    const { Pool } = require('pg');
    const cleanUrl = connUrl.split('?')[0];
    return new Pool({
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('Postgres connection pool error:', err.message);
    return null;
  }
}

function isPublicUrl(value) {
  if (!value) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('..')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (error) {
    return false;
  }
}

function isImageUrl(value) {
  if (!value) return true;
  if (typeof value !== 'string') return false;
  if (value.startsWith('data:image/') && value.length <= 6 * 1024 * 1024) return true;
  if (value.length > 2048 || value.startsWith('//') || value.includes('..')) return false;
  if (/^[a-zA-Z0-9._/ -]+$/.test(value)) return true;
  return isPublicUrl(value);
}

function isText(value, maxLength, allowEmpty) {
  return typeof value === 'string' &&
    value.length <= maxLength &&
    (allowEmpty || value.trim().length > 0);
}

function validateContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return false;
  const { profile, projects, font, experiences, education, skills, certificates, recruiter } = content;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile) ||
      !Array.isArray(projects) || projects.length > 50 ||
      !FONT_OPTIONS.includes(font)) return false;

  const profileFields = {
    name: 120,
    role: 140,
    headline: 300,
    bio: 2000,
    location: 180,
    email: 254,
    phone: 60,
    github: 2048,
    linkedin: 2048,
    instagram: 2048
  };
  for (const [field, maxLength] of Object.entries(profileFields)) {
    if (!isText(profile[field], maxLength, false)) return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ||
      !isPublicUrl(profile.github) ||
      !isPublicUrl(profile.linkedin) ||
      !isPublicUrl(profile.instagram) ||
      !isImageUrl(profile.profileImage)) return false;

  if (profile.avatarImage && !isImageUrl(profile.avatarImage)) return false;
  if (profile.aboutBio && typeof profile.aboutBio !== 'string') return false;
  if (profile.resumeUrl && typeof profile.resumeUrl !== 'string') return false;

  const ids = new Set();
  for (const project of projects) {
    if (!project || typeof project !== 'object' || Array.isArray(project) ||
        !/^[a-z0-9-]{1,60}$/.test(project.id || '') ||
        ids.has(project.id) ||
        !isText(project.title, 140, false) ||
        !isText(project.description, 2000, false) ||
        !Array.isArray(project.technologies) ||
        project.technologies.length > 20 ||
        !project.technologies.every(tag => isText(tag, 60, false)) ||
        !isImageUrl(project.image) ||
        !isPublicUrl(project.liveUrl) ||
        !isPublicUrl(project.codeUrl) ||
        !isText(project.icon, 80, true)) return false;
    ids.add(project.id);
  }

  if (experiences && Array.isArray(experiences)) {
    if (experiences.length > 50) return false;
    for (const exp of experiences) {
      if (!exp || typeof exp !== 'object' || Array.isArray(exp) ||
          !isText(exp.role, 140, false) ||
          !isText(exp.company, 140, false) ||
          !isText(exp.period, 80, false) ||
          !isText(exp.description, 2000, true)) return false;
    }
  }

  if (education && Array.isArray(education)) {
    if (education.length > 30) return false;
    for (const edu of education) {
      if (!edu || typeof edu !== 'object' || Array.isArray(edu) ||
          !isText(edu.degree, 160, false) ||
          !isText(edu.institution, 160, false) ||
          !isText(edu.period, 80, false)) return false;
    }
  }

  if (skills && Array.isArray(skills)) {
    if (skills.length > 60) return false;
    for (const skill of skills) {
      if (!skill || typeof skill !== 'object' || Array.isArray(skill) ||
          !isText(skill.name, 80, false)) return false;
    }
  }

  if (certificates && Array.isArray(certificates)) {
    if (certificates.length > 60) return false;
    for (const cert of certificates) {
      if (!cert || typeof cert !== 'object' || Array.isArray(cert) ||
          !isText(cert.title, 160, false) ||
          !isImageUrl(cert.image)) return false;
    }
  }

  if (recruiter && (typeof recruiter !== 'object' || Array.isArray(recruiter))) return false;

  return true;
}

async function fetchStoredContent() {
  // 1. Supabase REST API if configured
  const supabaseConfig = getSupabaseConfig();
  if (supabaseConfig) {
    try {
      const response = await fetch(
        `${supabaseConfig.url}/rest/v1/portfolio_content?id=eq.1&select=content`,
        {
          headers: {
            apikey: supabaseConfig.serviceKey,
            Authorization: `Bearer ${supabaseConfig.serviceKey}`
          }
        }
      );
      if (response.ok) {
        const rows = await response.json();
        if (rows && rows.length && rows[0].content && validateContent(rows[0].content)) {
          global.__cachedPortfolioContent = rows[0].content;
          return rows[0].content;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch notice:', e.message);
    }
  }

  // 2. Postgres if configured
  const pool = await getPostgresPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT content FROM portfolio_content WHERE id = 1');
      await pool.end();
      if (res && res.rows && res.rows.length && res.rows[0].content) {
        const dbContent = res.rows[0].content;
        if (validateContent(dbContent)) {
          global.__cachedPortfolioContent = dbContent;
          return dbContent;
        }
      }
    } catch (dbErr) {
      console.warn('Postgres fetch notice:', dbErr.message);
      try { await pool.end(); } catch (e) {}
    }
  }

  // 3. In-memory cache
  if (global.__cachedPortfolioContent && validateContent(global.__cachedPortfolioContent)) {
    return global.__cachedPortfolioContent;
  }

  // 4. /tmp/portfolio-content.json (writable in serverless execution environments)
  try {
    const tmpPath = path.join('/tmp', 'portfolio-content.json');
    if (fs.existsSync(tmpPath)) {
      const parsed = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (validateContent(parsed)) {
        global.__cachedPortfolioContent = parsed;
        return parsed;
      }
    }
  } catch (tmpErr) {}

  // 5. Local portfolio-content.json
  try {
    const filePath = path.join(process.cwd(), 'portfolio-content.json');
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (validateContent(parsed)) {
        global.__cachedPortfolioContent = parsed;
        return parsed;
      }
    }
  } catch (fsErr) {}

  return defaultContent;
}

function syncIndexHtml(content) {
  try {
    const indexPath = path.join(process.cwd(), 'index.html');
    if (!fs.existsSync(indexPath)) return;
    let html = fs.readFileSync(indexPath, 'utf-8');
    const { profile } = content;
    if (profile) {
      if (profile.name) {
        html = html.replace(/(<span class="gradient-name" data-profile-field="name">)[^<]*(<\/span>)/g, `$1${profile.name}$2`);
      }
      if (profile.headline) {
        const formattedHeadline = profile.headline.replace(/(clean,\s*scalable)/gi, '<em>$1</em>');
        html = html.replace(/(<p class="hero-headline[^"]*" data-profile-field="headline"[^>]*>)[^<]*(?:<em[^>]*>[^<]*<\/em>)?[^<]*(<\/p>)/g, `$1\n                ${formattedHeadline}\n            $2`);
      }
      if (profile.bio) {
        html = html.replace(/(<p class="hero-bio[^"]*" data-profile-field="bio"[^>]*>)[\s\S]*?(<\/p>)/g, `$1\n                ${profile.bio}\n            $2`);
      }
    }
    fs.writeFileSync(indexPath, html, 'utf-8');
  } catch (e) {
    console.warn('Index sync notice:', e.message);
  }
}

async function saveStoredContent(content) {
  if (!validateContent(content)) {
    const error = new Error('The portfolio content has invalid or unsupported fields.');
    error.statusCode = 400;
    throw error;
  }

  // Always update in-memory cache
  global.__cachedPortfolioContent = content;

  // 1. Save to Supabase REST API if configured
  const supabaseConfig = getSupabaseConfig();
  if (supabaseConfig) {
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/portfolio_content?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: supabaseConfig.serviceKey,
          Authorization: `Bearer ${supabaseConfig.serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ id: 1, content, updated_at: new Date().toISOString() })
      });
      if (!response.ok) {
        console.warn(`Supabase save returned status ${response.status}`);
      }
    } catch (e) {
      console.warn('Supabase save notice:', e.message);
    }
  }

  // 2. Save to Postgres if configured
  const pool = await getPostgresPool();
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS portfolio_content (
          id SMALLINT PRIMARY KEY,
          content JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`
        INSERT INTO portfolio_content (id, content, updated_at)
        VALUES (1, $1, NOW())
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();
      `, [content]);
      await pool.end();
    } catch (dbErr) {
      console.warn('Postgres save notice:', dbErr.message);
      try { await pool.end(); } catch (e) {}
    }
  }

  // 3. Save to local filesystem if writable
  try {
    const filePath = path.join(process.cwd(), 'portfolio-content.json');
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
    syncIndexHtml(content);
  } catch (fsErr) {
    // EROFS or permission error on read-only serverless environment (e.g. AWS Lambda / Vercel /var/task)
    // Fallback safely to /tmp without throwing an error
    try {
      const tmpPath = path.join('/tmp', 'portfolio-content.json');
      fs.writeFileSync(tmpPath, JSON.stringify(content, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Tmp directory save notice:', tmpErr.message);
    }
  }

  return { success: true };
}

async function uploadImage(data, mimeType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf'
  };
  const extension = extensions[mimeType];
  if (!extension || typeof data !== 'string') {
    const error = new Error('Choose a PNG, JPEG, WebP, GIF, or PDF file.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length || buffer.length > 6 * 1024 * 1024) {
    const error = new Error('File must be smaller than 6 MB.');
    error.statusCode = 413;
    throw error;
  }

  const signatures = {
    'image/jpeg': buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    'image/png': buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/webp': buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
    'image/gif': ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6)),
    'application/pdf': buffer.subarray(0, 4).toString('ascii') === '%PDF'
  };
  if (!signatures[mimeType]) {
    const error = new Error('The file data does not match its file type.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Try Supabase storage if configured
  const config = getSupabaseConfig();
  if (config) {
    try {
      const objectPath = `portfolio/${require('crypto').randomUUID()}.${extension}`;
      const response = await fetch(
        `${config.url}/storage/v1/object/portfolio-media/${objectPath}`,
        {
          method: 'POST',
          headers: {
            apikey: config.serviceKey,
            Authorization: `Bearer ${config.serviceKey}`,
            'Content-Type': mimeType,
            'x-upsert': 'false'
          },
          body: buffer
        }
      );
      if (response.ok) {
        return `${config.url}/storage/v1/object/public/portfolio-media/${objectPath}`;
      }
    } catch (e) {
      console.warn('Supabase image upload failed, falling back:', e.message);
    }
  }

  // 2. Try saving to local images directory
  try {
    const fileName = `upload-${Date.now()}.${extension}`;
    const localDir = path.join(process.cwd(), 'images');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    fs.writeFileSync(path.join(localDir, fileName), buffer);
    return `images/${fileName}`;
  } catch (fsErr) {
    // Read-only filesystem on Vercel: safely fallback to inline base64 Data URL!
    return `data:${mimeType};base64,${data}`;
  }
}

module.exports = {
  defaultContent,
  fetchStoredContent,
  saveStoredContent,
  uploadImage,
  validateContent
};
