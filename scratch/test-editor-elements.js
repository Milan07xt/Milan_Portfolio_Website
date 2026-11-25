const fs = require('fs');

const html = fs.readFileSync('portfolio-editor.html', 'utf8');
const ids = [
  'font', 'profileName', 'profileRole', 'profileHeadline', 'profileBio', 'profileAboutBio',
  'profileLocation', 'profileEmail', 'profilePhone', 'profileGithub', 'profileLinkedin', 'profileInstagram',
  'profileImage', 'profilePreview', 'profileAvatar', 'avatarPreview', 'profileResumeUrl',
  'recruiterRole', 'recruiterSummary', 'recruiterCoreSkills', 'recruiterBestProjects',
  'recruiterEducationNote', 'recruiterCertificationsNote',
  'experienceList', 'educationList', 'skillsList', 'certificateList', 'projectList',
  'countExp', 'countEdu', 'countSkills', 'countCerts', 'countProjects',
  'addExpButton', 'addEduButton', 'addSkillButton', 'addCertButton', 'addProjectButton',
  'autoFillRecruiterBtn', 'clearRecruiterBtn',
  'uploadProfileButton', 'profileImageFile', 'uploadAvatarButton', 'avatarImageFile', 'uploadResumeButton', 'resumeFile'
];

const missing = [];
ids.forEach(id => {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missing.push(id);
  }
});

console.log('Missing IDs:', missing);
console.log('Total checked:', ids.length);

