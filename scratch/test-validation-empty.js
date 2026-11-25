const { validateContent } = require('../lib/portfolio-content');
const fs = require('fs');
const path = require('path');

const defaultContent = JSON.parse(fs.readFileSync(path.join(__dirname, '../portfolio-content.json'), 'utf8'));
console.log('Default content validates:', validateContent(defaultContent));

// Now let's simulate adding an empty project like the editor does!
// In portfolio-editor.js:
// projects.push({ id, title: '', description: '', technologies: [], image: '', icon: '', liveUrl: '', codeUrl: '' });
const contentWithEmptyProject = JSON.parse(JSON.stringify(defaultContent));
contentWithEmptyProject.projects.push({
  id: 'project-test123',
  title: '',
  description: '',
  technologies: [],
  image: '',
  icon: '',
  liveUrl: '',
  codeUrl: ''
});

console.log('Content with empty project validates:', validateContent(contentWithEmptyProject));

// What about adding an empty certificate?
const contentWithEmptyCert = JSON.parse(JSON.stringify(defaultContent));
contentWithEmptyCert.certificates.push({
  id: 'cert-test123',
  title: '',
  issuer: '',
  category: 'nasscom',
  tags: [],
  verifyUrl: '',
  image: ''
});
console.log('Content with empty cert validates:', validateContent(contentWithEmptyCert));

// What about adding an empty experience?
const contentWithEmptyExp = JSON.parse(JSON.stringify(defaultContent));
contentWithEmptyExp.experiences.push({
  id: 'exp-test123',
  role: '',
  company: '',
  period: '2026 – Present',
  type: 'Internship',
  technologies: [],
  description: ''
});
console.log('Content with empty exp validates:', validateContent(contentWithEmptyExp));

// What about adding an empty education?
const contentWithEmptyEdu = JSON.parse(JSON.stringify(defaultContent));
contentWithEmptyEdu.education.push({
  id: 'edu-test123',
  degree: '',
  institution: '',
  period: '2026 – Present',
  status: 'PURSUING',
  mode: 'Regular Mode',
  duration: '',
  description: ''
});
console.log('Content with empty edu validates:', validateContent(contentWithEmptyEdu));

// What about adding an empty skill?
const contentWithEmptySkill = JSON.parse(JSON.stringify(defaultContent));
contentWithEmptySkill.skills.push({
  id: 'skill-test123',
  name: '',
  level: '80%',
  category: 'Web Framework',
  icon: ''
});
console.log('Content with empty skill validates:', validateContent(contentWithEmptySkill));
