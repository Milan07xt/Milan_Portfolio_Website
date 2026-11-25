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
  if (value.startsWith('//') || value.includes('..')) return false;
  if (value.startsWith('/') || /^[a-zA-Z0-9._/ -]+$/.test(value)) return true;
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
  if (value === undefined || value === null) return !!allowEmpty;
  return typeof value === 'string' &&
    value.length <= maxLength &&
    (allowEmpty || value.trim().length > 0);
}

function getValidationError(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return 'The portfolio content data must be a valid JSON object.';
  }
  const { profile, projects, font, experiences, education, skills, certificates, recruiter } = content;
  if (!font || !FONT_OPTIONS.includes(font)) {
    return `Invalid site font '${font}'. Allowed fonts: ${FONT_OPTIONS.join(', ')}`;
  }
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return 'Missing personal profile information.';
  }

  const profileFields = {
    name: [120, false, 'Name'],
    role: [140, false, 'Role / Title'],
    headline: [300, true, 'Headline'],
    bio: [2000, true, 'Short Bio'],
    location: [180, true, 'Location'],
    email: [254, false, 'Email'],
    phone: [60, true, 'Phone'],
    github: [2048, true, 'GitHub URL'],
    linkedin: [2048, true, 'LinkedIn URL'],
    instagram: [2048, true, 'Instagram URL']
  };
  for (const [field, [maxLength, allowEmpty, label]] of Object.entries(profileFields)) {
    if (!isText(profile[field], maxLength, allowEmpty)) {
      return `Profile ${label} is invalid or exceeds ${maxLength} characters.`;
    }
  }

  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    return 'Please enter a valid email address.';
  }
  if (profile.github && !isPublicUrl(profile.github)) return 'Invalid GitHub URL format.';
  if (profile.linkedin && !isPublicUrl(profile.linkedin)) return 'Invalid LinkedIn URL format.';
  if (profile.instagram && !isPublicUrl(profile.instagram)) return 'Invalid Instagram URL format.';
  if (profile.profileImage && !isImageUrl(profile.profileImage)) return 'Invalid Profile Image URL.';
  if (profile.avatarImage && !isImageUrl(profile.avatarImage)) return 'Invalid Recruiter Avatar Image URL.';

  if (!Array.isArray(projects)) return 'Projects must be an array.';
  if (projects.length > 50) return 'Maximum 50 projects allowed.';
  const ids = new Set();
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    if (!project || typeof project !== 'object' || Array.isArray(project)) {
      return `Project #${i + 1} is invalid.`;
    }
    const id = project.id || `project-${i + 1}`;
    if (ids.has(id)) {
      project.id = `${id}-${Date.now().toString(36)}`;
    }
    ids.add(project.id || id);

    if (!isText(project.title, 140, false)) return `Project #${i + 1} requires a valid title.`;
    if (!isText(project.description, 2000, true)) return `Project #${i + 1} description is too long.`;
    if (project.technologies && !Array.isArray(project.technologies)) return `Project #${i + 1} technologies must be an array.`;
    if (!isImageUrl(project.image)) return `Project #${i + 1} image URL is invalid.`;
    if (!isPublicUrl(project.liveUrl)) return `Project #${i + 1} live demo URL is invalid.`;
    if (!isPublicUrl(project.codeUrl)) return `Project #${i + 1} code repository URL is invalid.`;
  }

  if (experiences && Array.isArray(experiences)) {
    if (experiences.length > 50) return 'Maximum 50 experiences allowed.';
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      if (!exp || typeof exp !== 'object' || Array.isArray(exp)) return `Experience #${i + 1} is invalid.`;
      if (!isText(exp.role, 140, false) && !isText(exp.company, 140, false)) {
        return `Experience #${i + 1} requires a role or company name.`;
      }
    }
  }

  if (education && Array.isArray(education)) {
    if (education.length > 30) return 'Maximum 30 education entries allowed.';
    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      if (!edu || typeof edu !== 'object' || Array.isArray(edu)) return `Education #${i + 1} is invalid.`;
      if (!isText(edu.degree, 160, false) && !isText(edu.institution, 160, false)) {
        return `Education #${i + 1} requires a degree or institution name.`;
      }
    }
  }

  if (skills && Array.isArray(skills)) {
    if (skills.length > 60) return 'Maximum 60 skills allowed.';
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      if (!skill || typeof skill !== 'object' || Array.isArray(skill)) return `Skill #${i + 1} is invalid.`;
      if (!isText(skill.name, 80, false)) return `Skill #${i + 1} requires a name.`;
    }
  }

  if (certificates && Array.isArray(certificates)) {
    if (certificates.length > 60) return 'Maximum 60 certificates allowed.';
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      if (!cert || typeof cert !== 'object' || Array.isArray(cert)) return `Certificate #${i + 1} is invalid.`;
      if (!isText(cert.title, 160, false)) return `Certificate #${i + 1} requires a title.`;
      if (!isImageUrl(cert.image)) return `Certificate #${i + 1} image URL is invalid.`;
    }
  }

  if (recruiter && (typeof recruiter !== 'object' || Array.isArray(recruiter))) {
    return 'Recruiter mode settings must be an object.';
  }

  return null;
}

function validateContent(content) {
  return getValidationError(content) === null;
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
    const { profile, recruiter } = content;
    if (profile) {
      if (profile.name) {
        html = html.replace(/(<span class="gradient-name" data-profile-field="name">)[^<]*(<\/span>)/g, `$1${profile.name}$2`);
        html = html.replace(/(<h2 data-profile-field="name">)[^<]*(<\/h2>)/g, `$1${profile.name}$2`);
      }
      if (profile.headline) {
        const formattedHeadline = profile.headline.replace(/(clean,\s*scalable)/gi, '<em>$1</em>');
        html = html.replace(/(<p class="hero-headline[^"]*" data-profile-field="headline"[^>]*>)[^<]*(?:<em[^>]*>[^<]*<\/em>)?[^<]*(<\/p>)/g, `$1\n                ${formattedHeadline}\n            $2`);
      }
      if (profile.bio) {
        html = html.replace(/(<p class="hero-bio[^"]*" data-profile-field="bio"[^>]*>)[\s\S]*?(<\/p>)/g, `$1\n                ${profile.bio}\n            $2`);
      }
      if (profile.avatarImage) {
        html = html.replace(/(<div class="recruiter-avatar">\s*<img src=")[^"]*(")/g, `$1${profile.avatarImage}$2`);
      }
      if (profile.resumeUrl) {
        html = html.replace(/(<a href=")[^"]*(" class="btn-primary-pill" download)/g, `$1${profile.resumeUrl}$2`);
      }
    }
    if (recruiter) {
      if (recruiter.role) {
        html = html.replace(/(<p class="recruiter-role">)[^<]*(<\/p>)/g, `$1${recruiter.role}$2`);
      }
      if (recruiter.summary) {
        html = html.replace(/(<p class="recruiter-summary-text" id="recruiterSummaryText">)[^<]*(<\/p>)/g, `$1${recruiter.summary}$2`);
      }
      if (recruiter.educationNote) {
        html = html.replace(/(<p id="recruiterEducationText">)[^<]*(<\/p>)/g, `$1${recruiter.educationNote}$2`);
      }
      if (recruiter.certificationsNote) {
        html = html.replace(/(<p id="recruiterCertificationsText">)[^<]*(<\/p>)/g, `$1${recruiter.certificationsNote}$2`);
      }
    }
    fs.writeFileSync(indexPath, html, 'utf-8');
  } catch (e) {
    console.warn('Index sync notice:', e.message);
  }
}

async function saveStoredContent(content) {
  const valError = getValidationError(content);
  if (valError) {
    const error = new Error(valError);
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
  validateContent,
  getValidationError
};
