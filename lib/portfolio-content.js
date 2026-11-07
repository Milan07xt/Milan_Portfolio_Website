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
    throw new Error('SUPABASE_URL must be a valid HTTPS URL.');
  }
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('SUPABASE_URL must use HTTPS.');
  }
  return { url: parsedUrl.toString().replace(/\/+$/, ''), serviceKey };
}

function assertSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config) {
    const error = new Error('Supabase storage is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }
  return config;
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
  return !value || (
    typeof value === 'string' &&
    value.length <= 2048 &&
    !value.startsWith('//') &&
    !value.toLowerCase().startsWith('data:') &&
    !value.includes('..') &&
    (/^[a-zA-Z0-9._/-]+$/.test(value) || isPublicUrl(value))
  );
}

function isText(value, maxLength, allowEmpty) {
  return typeof value === 'string' &&
    value.length <= maxLength &&
    (allowEmpty || value.trim().length > 0);
}

function validateContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return false;
  const { profile, projects, font } = content;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile) ||
      !Array.isArray(projects) || projects.length > 30 ||
      !FONT_OPTIONS.includes(font)) return false;

  const profileFields = {
    name: 100,
    role: 120,
    headline: 240,
    bio: 1200,
    location: 160,
    email: 254,
    phone: 50,
    github: 2048,
    linkedin: 2048,
    instagram: 2048,
    profileImage: 2048
  };
  for (const [field, maxLength] of Object.entries(profileFields)) {
    if (!isText(profile[field], maxLength, false)) return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ||
      !isPublicUrl(profile.github) ||
      !isPublicUrl(profile.linkedin) ||
      !isPublicUrl(profile.instagram) ||
      !isImageUrl(profile.profileImage)) return false;

  const ids = new Set();
  for (const project of projects) {
    if (!project || typeof project !== 'object' || Array.isArray(project) ||
        !/^[a-z0-9-]{1,60}$/.test(project.id || '') ||
        ids.has(project.id) ||
        !isText(project.title, 120, false) ||
        !isText(project.description, 1200, false) ||
        !Array.isArray(project.technologies) ||
        project.technologies.length > 15 ||
        !project.technologies.every(tag => isText(tag, 40, false)) ||
        !isImageUrl(project.image) ||
        !isPublicUrl(project.liveUrl) ||
        !isPublicUrl(project.codeUrl) ||
        !isText(project.icon, 50, true)) return false;
    ids.add(project.id);
  }
  return true;
}

async function fetchStoredContent() {
  const config = getSupabaseConfig();
  if (!config) {
    const filePath = path.join(process.cwd(), 'portfolio-content.json');
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (e) {
        console.warn('Could not parse local portfolio-content.json:', e.message);
      }
    }
    return defaultContent;
  }

  const response = await fetch(
    `${config.url}/rest/v1/portfolio_content?id=eq.1&select=content`,
    {
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`
      }
    }
  );
  if (!response.ok) {
    throw new Error(`Supabase content read failed (${response.status}).`);
  }
  const rows = await response.json();
  return rows.length ? rows[0].content : defaultContent;
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

  const config = getSupabaseConfig();
  if (!config) {
    // Local fallback: save directly to portfolio-content.json on disk
    const filePath = path.join(process.cwd(), 'portfolio-content.json');
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
    syncIndexHtml(content);
    return;
  }

  const response = await fetch(`${config.url}/rest/v1/portfolio_content?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({ id: 1, content, updated_at: new Date().toISOString() })
  });
  if (!response.ok) {
    throw new Error(`Supabase content save failed (${response.status}).`);
  }
}

async function uploadImage(data, mimeType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  const extension = extensions[mimeType];
  if (!extension || typeof data !== 'string') {
    const error = new Error('Choose a PNG, JPEG, WebP, or GIF image.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length || buffer.length > 3 * 1024 * 1024) {
    const error = new Error('Image files must be smaller than 3 MB.');
    error.statusCode = 413;
    throw error;
  }

  const signatures = {
    'image/jpeg': buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    'image/png': buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/webp': buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
    'image/gif': ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6))
  };
  if (!signatures[mimeType]) {
    const error = new Error('The image data does not match its file type.');
    error.statusCode = 400;
    throw error;
  }

  const config = getSupabaseConfig();
  if (!config) {
    // Local fallback: save directly to images directory
    const fileName = `upload-${Date.now()}.${extension}`;
    const localDir = path.join(process.cwd(), 'images');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    fs.writeFileSync(path.join(localDir, fileName), buffer);
    return `images/${fileName}`;
  }

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
  if (!response.ok) {
    throw new Error(`Supabase image upload failed (${response.status}).`);
  }
  return `${config.url}/storage/v1/object/public/portfolio-media/${objectPath}`;
}

module.exports = {
  defaultContent,
  fetchStoredContent,
  saveStoredContent,
  uploadImage,
  validateContent
};
