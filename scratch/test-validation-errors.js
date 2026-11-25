const { defaultContent } = require('../lib/portfolio-content');

console.log('Testing getValidationError logic...');
function getValidationError(content) {
  const FONT_OPTIONS = ['Plus Jakarta Sans', 'Inter', 'Poppins', 'Roboto', 'Space Grotesk'];
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return 'Invalid portfolio data format.';
  }
  const { profile, projects, font, experiences, education, skills, certificates } = content;
  if (!FONT_OPTIONS.includes(font)) {
    return `Invalid site font '${font}'. Allowed fonts: ${FONT_OPTIONS.join(', ')}`;
  }
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return 'Missing personal profile information.';
  }
  if (!profile.name || !profile.name.trim()) return 'Please provide your name in Personal Details.';
  if (!profile.role || !profile.role.trim()) return 'Please provide your role/title in Personal Details.';

  if (!Array.isArray(projects)) return 'Projects must be an array.';
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (!p || typeof p !== 'object') return `Project #${i + 1} is invalid.`;
    if (!p.title || !p.title.trim()) return `Project #${i + 1} requires a title.`;
  }

  if (experiences && Array.isArray(experiences)) {
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      if (!exp || typeof exp !== 'object') return `Experience #${i + 1} is invalid.`;
      if (!exp.role && !exp.company) return `Experience #${i + 1} requires a role or company name.`;
    }
  }

  if (education && Array.isArray(education)) {
    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      if (!edu || typeof edu !== 'object') return `Education #${i + 1} is invalid.`;
      if (!edu.degree && !edu.institution) return `Education #${i + 1} requires a degree or institution name.`;
    }
  }

  if (skills && Array.isArray(skills)) {
    for (let i = 0; i < skills.length; i++) {
      const sk = skills[i];
      if (!sk || typeof sk !== 'object') return `Skill #${i + 1} is invalid.`;
      if (!sk.name || !sk.name.trim()) return `Skill #${i + 1} requires a name.`;
    }
  }

  if (certificates && Array.isArray(certificates)) {
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      if (!cert || typeof cert !== 'object') return `Certificate #${i + 1} is invalid.`;
      if (!cert.title || !cert.title.trim()) return `Certificate #${i + 1} requires a title.`;
    }
  }

  return null;
}

console.log('Default content error:', getValidationError(defaultContent));
