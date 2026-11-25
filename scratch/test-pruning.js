const { validateContent, getValidationError, defaultContent } = require('../lib/portfolio-content');

// Simulate collectContent() pruning:
const sampleUserAdded = [
  { role: '', company: '' }, // empty, pruned
  { role: 'Python Backend Engineer', company: 'Tech Innovators' } // kept
];

const prunedExp = sampleUserAdded.map((item, idx) => {
  const role = item.role.trim();
  const company = item.company.trim();
  if (!role && !company) return null;
  return {
    id: `exp-${idx}`,
    role: role || 'Developer Role',
    company: company || 'Company',
    period: '2026 – Present',
    type: 'Full-time',
    technologies: ['Python', 'FastAPI'],
    description: 'Built APIs'
  };
}).filter(Boolean);

console.log('Pruned count (should be 1):', prunedExp.length);

const testContent = JSON.parse(JSON.stringify(defaultContent));
testContent.experiences = prunedExp;
console.log('Validates:', validateContent(testContent));
console.log('Validation Error:', getValidationError(testContent));
