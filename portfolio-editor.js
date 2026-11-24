(function () {
  'use strict';

  const tokenKey = 'adminToken';
  const loginScreen = document.getElementById('loginScreen');
  const editorScreen = document.getElementById('editorScreen');
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const loginContact = document.getElementById('loginContact');
  const contentForm = document.getElementById('contentForm');
  const saveStatus = document.getElementById('saveStatus');

  // List containers
  const experienceList = document.getElementById('experienceList');
  const educationList = document.getElementById('educationList');
  const skillsList = document.getElementById('skillsList');
  const certificateList = document.getElementById('certificateList');
  const projectList = document.getElementById('projectList');

  // Image inputs
  const profileImage = document.getElementById('profileImage');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileResumeUrl = document.getElementById('profileResumeUrl');

  let content = null;

  function setStatus(element, message, type) {
    element.textContent = message;
    element.className = `form-status${type ? ` ${type}` : ''}`;
  }

  function authHeaders(extra) {
    return Object.assign({ Authorization: `Bearer ${localStorage.getItem(tokenKey) || ''}` }, extra || {});
  }

  function updateCounts() {
    const elExp = document.getElementById('countExp');
    const elEdu = document.getElementById('countEdu');
    const elSkills = document.getElementById('countSkills');
    const elCerts = document.getElementById('countCerts');
    const elProjects = document.getElementById('countProjects');
    if (elExp) elExp.textContent = experienceList.children.length;
    if (elEdu) elEdu.textContent = educationList.children.length;
    if (elSkills) elSkills.textContent = skillsList.children.length;
    if (elCerts) elCerts.textContent = certificateList.children.length;
    if (elProjects) elProjects.textContent = projectList.children.length;
  }

  async function loadContent() {
    const response = await fetch('/api/admin/content', {
      headers: authHeaders()
    });
    if (response.status === 401) {
      localStorage.removeItem(tokenKey);
      throw new Error('Your admin session expired. Please sign in again.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load portfolio content.');
    content = result.content;

    fillProfile(content);
    fillRecruiter(content);
    renderExperiences(content.experiences || []);
    renderEducation(content.education || []);
    renderSkills(content.skills || []);
    renderCertificates(content.certificates || []);
    renderProjects(content.projects || []);

    updateCounts();
    loginScreen.hidden = true;
    editorScreen.hidden = false;
  }

  function fillProfile(data) {
    const p = data.profile || {};
    document.getElementById('font').value = data.font || 'Plus Jakarta Sans';
    if (window.syncCustomFontDropdown) {
      window.syncCustomFontDropdown(data.font || 'Plus Jakarta Sans');
    }
    document.getElementById('profileName').value = p.name || '';
    document.getElementById('profileRole').value = p.role || '';
    document.getElementById('profileHeadline').value = p.headline || '';
    document.getElementById('profileBio').value = p.bio || '';
    document.getElementById('profileAboutBio').value = p.aboutBio || '';
    document.getElementById('profileLocation').value = p.location || '';
    document.getElementById('profileEmail').value = p.email || '';
    document.getElementById('profilePhone').value = p.phone || '';
    document.getElementById('profileGithub').value = p.github || '';
    document.getElementById('profileLinkedin').value = p.linkedin || '';
    document.getElementById('profileInstagram').value = p.instagram || '';

    profileImage.value = p.profileImage || '';
    showPreview('profilePreview', p.profileImage);

    profileAvatar.value = p.avatarImage || '';
    showPreview('avatarPreview', p.avatarImage);

    profileResumeUrl.value = p.resumeUrl || '';
  }

  function fillRecruiter(data) {
    const r = data.recruiter || {};
    document.getElementById('recruiterRole').value = r.role || '';
    document.getElementById('recruiterSummary').value = r.summary || '';
    document.getElementById('recruiterCoreSkills').value = r.coreSkills || '';
    document.getElementById('recruiterBestProjects').value = r.bestProjects || '';
    document.getElementById('recruiterEducationNote').value = r.educationNote || '';
    document.getElementById('recruiterCertificationsNote').value = r.certificationsNote || '';
  }

  function showPreview(elementId, url) {
    const preview = document.getElementById(elementId);
    if (!preview) return;
    preview.hidden = !url;
    if (url) preview.src = url;
  }

  function createField(labelText, value, key, type, wide, placeholder) {
    const label = document.createElement('label');
    if (wide) label.className = 'wide-field';
    label.append(document.createTextNode(labelText));
    const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    input.dataset.field = key;
    if (type === 'textarea') input.rows = 2;
    else input.type = type || 'text';
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;
    label.appendChild(input);
    return label;
  }

  /* 1. Professional Experience */
  function renderExperiences(items) {
    experienceList.replaceChildren();
    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card-item';
      card.dataset.itemId = item.id || `exp-${Date.now()}-${index}`;

      const header = document.createElement('div');
      header.className = 'card-item-header';
      header.innerHTML = `
        <div class="card-item-title-wrap">
          <span class="card-item-badge">${item.type || 'Experience'}</span>
          <strong class="card-item-title">${item.role || 'New Role'} @ ${item.company || 'Company'}</strong>
        </div>
        <button type="button" class="remove-item-btn" data-action="remove-exp"><i class="fa-solid fa-trash"></i> Delete</button>
      `;

      const fields = document.createElement('div');
      fields.className = 'field-grid';
      fields.append(
        createField('Role / Title', item.role, 'role', 'text', false, 'Python Developer Intern'),
        createField('Company / Organization', item.company, 'company', 'text', false, 'Nityam Webtech'),
        createField('Period (Timeframe)', item.period, 'period', 'text', false, '2026 – Present'),
        createField('Type (Internship / Freelance / Academic / Full-time)', item.type, 'type', 'text', false, 'Internship'),
        createField('Technologies (comma-separated)', (item.technologies || []).join(', '), 'technologies', 'text', true, 'Python, Django, REST API, Git'),
        createField('Description', item.description, 'description', 'textarea', true, 'Briefly describe your role and contributions...')
      );

      card.append(header, fields);
      experienceList.appendChild(card);
    });
    updateCounts();
  }

  /* 2. Education & Qualifications */
  function renderEducation(items) {
    educationList.replaceChildren();
    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card-item';
      card.dataset.itemId = item.id || `edu-${Date.now()}-${index}`;

      const header = document.createElement('div');
      header.className = 'card-item-header';
      header.innerHTML = `
        <div class="card-item-title-wrap">
          <span class="card-item-badge">${item.status || 'Education'}</span>
          <strong class="card-item-title">${item.degree || 'Degree'}</strong>
        </div>
        <button type="button" class="remove-item-btn" data-action="remove-edu"><i class="fa-solid fa-trash"></i> Delete</button>
      `;

      const fields = document.createElement('div');
      fields.className = 'field-grid';
      fields.append(
        createField('Degree Name', item.degree, 'degree', 'text', false, 'Master of Science in Information Technology'),
        createField('Institution / University', item.institution, 'institution', 'text', false, 'Noble University, Junagadh'),
        createField('Period (Years)', item.period, 'period', 'text', false, '2023 – 2026'),
        createField('Status (e.g. PURSUING or COMPLETED)', item.status, 'status', 'text', false, 'COMPLETED'),
        createField('Mode / Type (e.g. Regular Mode or External Mode)', item.mode, 'mode', 'text', false, 'Regular Mode'),
        createField('Duration or Score / CGPA', item.duration, 'duration', 'text', false, 'CGPA: 6.35'),
        createField('Description', item.description, 'description', 'textarea', true, 'Focus areas and key learnings...')
      );

      card.append(header, fields);
      educationList.appendChild(card);
    });
    updateCounts();
  }

  /* 3. Python Skills Galaxy */
  function renderSkills(items) {
    skillsList.replaceChildren();
    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card-item';
      card.dataset.itemId = item.id || `skill-${Date.now()}-${index}`;

      const header = document.createElement('div');
      header.className = 'card-item-header';
      header.innerHTML = `
        <div class="card-item-title-wrap">
          <strong class="card-item-title">${item.name || 'New Skill'}</strong>
          <span class="card-item-badge">${item.level || '80%'}</span>
        </div>
        <button type="button" class="remove-item-btn" data-action="remove-skill"><i class="fa-solid fa-trash"></i> Delete</button>
      `;

      const fields = document.createElement('div');
      fields.className = 'field-grid';
      fields.append(
        createField('Skill Name', item.name, 'name', 'text', false, 'Django'),
        createField('Proficiency Level (%)', item.level, 'level', 'text', false, '85%'),
        createField('Category / Subtitle', item.category, 'category', 'text', false, 'Web Framework'),
        createField('Icon (URL or fa-icon class)', item.icon, 'icon', 'text', false, 'https://cdn.jsdelivr.net/... or fa-solid fa-database')
      );

      card.append(header, fields);
      skillsList.appendChild(card);
    });
    updateCounts();
  }

  /* 4. Certifications & Achievements */
  function renderCertificates(items) {
    certificateList.replaceChildren();
    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card-item';
      card.dataset.itemId = item.id || `cert-${Date.now()}-${index}`;

      const header = document.createElement('div');
      header.className = 'card-item-header';
      header.innerHTML = `
        <div class="card-item-title-wrap">
          <span class="card-item-badge">${item.category || 'Certificate'}</span>
          <strong class="card-item-title">${item.title || 'Certificate Title'}</strong>
        </div>
        <button type="button" class="remove-item-btn" data-action="remove-cert"><i class="fa-solid fa-trash"></i> Delete</button>
      `;

      const fields = document.createElement('div');
      fields.className = 'field-grid';
      fields.append(
        createField('Certificate Name / Title', item.title, 'title', 'text', false, 'QuizOff 2026: AI Quiz'),
        createField('Issuer / Organization', item.issuer, 'issuer', 'text', false, 'Unstop · CampusCrew'),
        createField('Category Filter (unstop / udemy / forage / nasscom / other)', item.category, 'category', 'text', false, 'nasscom'),
        createField('Tags (comma-separated)', (item.tags || []).join(', '), 'tags', 'text', false, 'AI Quiz, CampusCrew'),
        createField('View / Verify URL (optional)', item.verifyUrl, 'verifyUrl', 'url', true, 'images/certificates/...'),
        createField('Certificate Image URL', item.image, 'image', 'text', true, 'images/certificates/...')
      );

      const uploadLabel = document.createElement('label');
      uploadLabel.className = 'wide-field image-field';
      uploadLabel.innerHTML = `
        <span>Upload Certificate Image</span>
        <div class="image-input-row" style="margin-top:6px">
          <button type="button" class="secondary-button" data-action="trigger-cert-upload"><i class="fa-solid fa-upload"></i> Choose file</button>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-action="upload-cert" hidden>
        </div>
        ${item.image ? `<img src="${item.image}" class="image-preview" style="margin-top:10px" alt="Cert preview">` : ''}
      `;

      card.append(header, fields, uploadLabel);
      certificateList.appendChild(card);
    });
    updateCounts();
  }

  /* 5. Featured Projects */
  function renderProjects(projects) {
    projectList.replaceChildren();
    projects.forEach((project, index) => {
      const card = document.createElement('article');
      card.className = 'card-item';
      card.dataset.projectId = project.id || `proj-${Date.now()}-${index}`;
      card.dataset.projectIcon = project.icon || '';

      const header = document.createElement('div');
      header.className = 'card-item-header';
      header.innerHTML = `
        <div class="card-item-title-wrap">
          <span class="card-item-badge">Project</span>
          <strong class="card-item-title">${project.title || `Project ${index + 1}`}</strong>
        </div>
        <button type="button" class="remove-item-btn" data-action="remove-project"><i class="fa-solid fa-trash"></i> Delete</button>
      `;

      const fields = document.createElement('div');
      fields.className = 'field-grid';
      fields.append(
        createField('Project Title', project.title, 'title', 'text', false, 'Face Recognition Attendance'),
        createField('Technologies (comma-separated)', (project.technologies || []).join(', '), 'technologies', 'text', false, 'Python, Django, OpenCV, REST API'),
        createField('Description', project.description, 'description', 'textarea', true, 'Key technical highlights and implementation details...'),
        createField('Live Demo URL (optional)', project.liveUrl, 'liveUrl', 'url', false, 'https://...'),
        createField('Code URL (optional)', project.codeUrl, 'codeUrl', 'url', false, 'https://github.com/...'),
        createField('Project Image URL (optional)', project.image, 'image', 'text', true, 'images/...')
      );

      const uploadLabel = document.createElement('label');
      uploadLabel.className = 'wide-field image-field';
      uploadLabel.innerHTML = `
        <span>Upload Project Image</span>
        <div class="image-input-row" style="margin-top:6px">
          <button type="button" class="secondary-button" data-action="trigger-project-upload"><i class="fa-solid fa-upload"></i> Choose file</button>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-action="upload-project" hidden>
        </div>
        ${project.image ? `<img src="${project.image}" class="image-preview" style="margin-top:10px" alt="Project preview">` : ''}
      `;

      card.append(header, fields, uploadLabel);
      projectList.appendChild(card);
    });
    updateCounts();
  }

  /* Form Data Collection */
  function collectContent() {
    const profile = {
      name: document.getElementById('profileName').value.trim(),
      role: document.getElementById('profileRole').value.trim(),
      headline: document.getElementById('profileHeadline').value.trim(),
      bio: document.getElementById('profileBio').value.trim(),
      aboutBio: document.getElementById('profileAboutBio').value.trim(),
      location: document.getElementById('profileLocation').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      phone: document.getElementById('profilePhone').value.trim(),
      github: document.getElementById('profileGithub').value.trim(),
      linkedin: document.getElementById('profileLinkedin').value.trim(),
      instagram: document.getElementById('profileInstagram').value.trim(),
      profileImage: profileImage.value.trim(),
      avatarImage: profileAvatar.value.trim(),
      resumeUrl: profileResumeUrl.value.trim()
    };

    const recruiter = {
      role: document.getElementById('recruiterRole').value.trim(),
      summary: document.getElementById('recruiterSummary').value.trim(),
      coreSkills: document.getElementById('recruiterCoreSkills').value.trim(),
      bestProjects: document.getElementById('recruiterBestProjects').value.trim(),
      educationNote: document.getElementById('recruiterEducationNote').value.trim(),
      certificationsNote: document.getElementById('recruiterCertificationsNote').value.trim()
    };

    const experiences = Array.from(experienceList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId || `exp-${Date.now()}`,
        role: val('role'),
        company: val('company'),
        period: val('period'),
        type: val('type') || 'Experience',
        technologies: val('technologies').split(',').map(s => s.trim()).filter(Boolean),
        description: val('description')
      };
    });

    const education = Array.from(educationList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId || `edu-${Date.now()}`,
        degree: val('degree'),
        institution: val('institution'),
        period: val('period'),
        status: val('status') || 'COMPLETED',
        mode: val('mode') || 'Regular Mode',
        duration: val('duration'),
        description: val('description')
      };
    });

    const skills = Array.from(skillsList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId || `skill-${Date.now()}`,
        name: val('name'),
        level: val('level') || '80%',
        category: val('category') || 'Technology',
        icon: val('icon')
      };
    });

    const certificates = Array.from(certificateList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId || `cert-${Date.now()}`,
        title: val('title'),
        issuer: val('issuer'),
        category: val('category').toLowerCase() || 'other',
        tags: val('tags').split(',').map(s => s.trim()).filter(Boolean),
        verifyUrl: val('verifyUrl'),
        image: val('image')
      };
    });

    const projects = Array.from(projectList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.projectId || `proj-${Date.now()}`,
        title: val('title'),
        description: val('description'),
        technologies: val('technologies').split(',').map(s => s.trim()).filter(Boolean),
        image: val('image'),
        icon: card.dataset.projectIcon || '',
        liveUrl: val('liveUrl'),
        codeUrl: val('codeUrl')
      };
    });

    return {
      font: document.getElementById('font').value,
      profile,
      recruiter,
      experiences,
      education,
      skills,
      certificates,
      projects
    };
  }

  /* File Upload Utility */
  async function uploadFile(file, onUploaded) {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) throw new Error('Choose a file smaller than 6 MB.');
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsDataURL(file);
    });
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ data: base64, mimeType: file.type })
    });
    const result = await response.json();
    if (response.status === 401) {
      localStorage.removeItem(tokenKey);
      throw new Error('Your admin session expired. Please sign in again.');
    }
    if (!response.ok) throw new Error(result.error || 'Upload failed.');
    onUploaded(result.imageUrl);
  }

  async function openEditor(token) {
    localStorage.setItem(tokenKey, token);
    await loadContent();
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginContact.hidden = true;
    setStatus(loginStatus, 'Checking admin credentials…');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (response.status === 401) {
        loginContact.hidden = false;
        throw new Error('Incorrect admin username or password.');
      }
      if (!response.ok) throw new Error(result.error || 'Admin sign-in is unavailable.');
      document.getElementById('password').value = '';
      await openEditor(result.token);
    } catch (error) {
      setStatus(loginStatus, error.message, 'error');
    }
  });

  document.getElementById('closeContact').addEventListener('click', () => {
    loginContact.hidden = true;
  });

  document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    window.location.reload();
  });

  /* Profile Image Upload */
  document.getElementById('uploadProfileButton').addEventListener('click', () => {
    document.getElementById('profileImageFile').click();
  });
  document.getElementById('profileImageFile').addEventListener('change', async event => {
    try {
      setStatus(saveStatus, 'Uploading profile image…');
      await uploadFile(event.target.files[0], url => {
        profileImage.value = url;
        showPreview('profilePreview', url);
      });
      setStatus(saveStatus, 'Image uploaded. Save to publish your changes.', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    } finally {
      event.target.value = '';
    }
  });
  profileImage.addEventListener('input', () => showPreview('profilePreview', profileImage.value.trim()));

  /* Recruiter Avatar Upload */
  document.getElementById('uploadAvatarButton').addEventListener('click', () => {
    document.getElementById('avatarImageFile').click();
  });
  document.getElementById('avatarImageFile').addEventListener('change', async event => {
    try {
      setStatus(saveStatus, 'Uploading avatar image…');
      await uploadFile(event.target.files[0], url => {
        profileAvatar.value = url;
        showPreview('avatarPreview', url);
      });
      setStatus(saveStatus, 'Avatar uploaded. Save to publish your changes.', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    } finally {
      event.target.value = '';
    }
  });
  profileAvatar.addEventListener('input', () => showPreview('avatarPreview', profileAvatar.value.trim()));

  /* Resume PDF Upload */
  document.getElementById('uploadResumeButton').addEventListener('click', () => {
    document.getElementById('resumeFile').click();
  });
  document.getElementById('resumeFile').addEventListener('change', async event => {
    try {
      setStatus(saveStatus, 'Uploading resume PDF…');
      await uploadFile(event.target.files[0], url => {
        profileResumeUrl.value = url;
      });
      setStatus(saveStatus, 'Resume uploaded successfully. Save & publish to apply live.', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    } finally {
      event.target.value = '';
    }
  });

  /* Add Item Buttons */
  document.getElementById('addExpButton').addEventListener('click', () => {
    const experiences = Array.from(experienceList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId,
        role: val('role'),
        company: val('company'),
        period: val('period'),
        type: val('type'),
        technologies: val('technologies').split(',').map(s => s.trim()).filter(Boolean),
        description: val('description')
      };
    });
    experiences.unshift({
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      period: '2026 – Present',
      type: 'Internship',
      technologies: [],
      description: ''
    });
    renderExperiences(experiences);
  });

  document.getElementById('addEduButton').addEventListener('click', () => {
    const education = Array.from(educationList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId,
        degree: val('degree'),
        institution: val('institution'),
        period: val('period'),
        status: val('status'),
        mode: val('mode'),
        duration: val('duration'),
        description: val('description')
      };
    });
    education.unshift({
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      period: '2026 – Present',
      status: 'PURSUING',
      mode: 'Regular Mode',
      duration: '',
      description: ''
    });
    renderEducation(education);
  });

  document.getElementById('addSkillButton').addEventListener('click', () => {
    const skills = Array.from(skillsList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId,
        name: val('name'),
        level: val('level'),
        category: val('category'),
        icon: val('icon')
      };
    });
    skills.push({
      id: `skill-${Date.now()}`,
      name: '',
      level: '80%',
      category: 'Web Framework',
      icon: ''
    });
    renderSkills(skills);
  });

  document.getElementById('addCertButton').addEventListener('click', () => {
    const certificates = Array.from(certificateList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.itemId,
        title: val('title'),
        issuer: val('issuer'),
        category: val('category'),
        tags: val('tags').split(',').map(s => s.trim()).filter(Boolean),
        verifyUrl: val('verifyUrl'),
        image: val('image')
      };
    });
    certificates.unshift({
      id: `cert-${Date.now()}`,
      title: '',
      issuer: '',
      category: 'nasscom',
      tags: [],
      verifyUrl: '',
      image: ''
    });
    renderCertificates(certificates);
  });

  document.getElementById('addProjectButton').addEventListener('click', () => {
    const projects = Array.from(projectList.querySelectorAll('.card-item')).map(card => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      return {
        id: card.dataset.projectId,
        title: val('title'),
        description: val('description'),
        technologies: val('technologies').split(',').map(s => s.trim()).filter(Boolean),
        image: val('image'),
        icon: card.dataset.projectIcon || '',
        liveUrl: val('liveUrl'),
        codeUrl: val('codeUrl')
      };
    });
    let id = `project-${Date.now().toString(36)}`;
    while (projects.some(project => project.id === id)) id += '-new';
    projects.push({
      id,
      title: '',
      description: '',
      technologies: [],
      image: '',
      icon: '',
      liveUrl: '',
      codeUrl: ''
    });
    renderProjects(projects);
  });

  /* Delete Actions across all item lists */
  document.addEventListener('click', event => {
    const btn = event.target.closest('.remove-item-btn');
    if (!btn) return;
    const card = btn.closest('.card-item');
    if (card) {
      card.remove();
      updateCounts();
    }
  });

  /* Image Upload Trigger and Change Delegations for dynamic cards */
  document.addEventListener('click', event => {
    const trig = event.target.closest('[data-action="trigger-cert-upload"], [data-action="trigger-project-upload"]');
    if (!trig) return;
    const fileInput = trig.parentElement.querySelector('input[type="file"]');
    if (fileInput) fileInput.click();
  });

  document.addEventListener('change', async event => {
    const input = event.target;
    if (!input.files || !input.files[0]) return;

    if (input.dataset.action === 'upload-cert') {
      const card = input.closest('.card-item');
      const imageField = card.querySelector('[data-field="image"]');
      try {
        setStatus(saveStatus, 'Uploading certificate image…');
        await uploadFile(input.files[0], url => {
          if (imageField) imageField.value = url;
          let img = card.querySelector('.image-preview');
          if (!img) {
            img = document.createElement('img');
            img.className = 'image-preview';
            img.style.marginTop = '10px';
            input.closest('.image-field').appendChild(img);
          }
          img.src = url;
          img.hidden = false;
        });
        setStatus(saveStatus, 'Certificate image uploaded. Save to publish your changes.', 'success');
      } catch (err) {
        setStatus(saveStatus, err.message, 'error');
      } finally {
        input.value = '';
      }
    }

    if (input.dataset.action === 'upload-project') {
      const card = input.closest('.card-item');
      const imageField = card.querySelector('[data-field="image"]');
      try {
        setStatus(saveStatus, 'Uploading project image…');
        await uploadFile(input.files[0], url => {
          if (imageField) imageField.value = url;
          let img = card.querySelector('.image-preview');
          if (!img) {
            img = document.createElement('img');
            img.className = 'image-preview';
            img.style.marginTop = '10px';
            input.closest('.image-field').appendChild(img);
          }
          img.src = url;
          img.hidden = false;
        });
        setStatus(saveStatus, 'Project image uploaded. Save to publish your changes.', 'success');
      } catch (err) {
        setStatus(saveStatus, err.message, 'error');
      } finally {
        input.value = '';
      }
    }
  });

  /* Smooth Section Pill Navigation & Active Scrollspy */
  const navPills = Array.from(document.querySelectorAll('.editor-nav-bar .nav-pill'));
  const sectionIds = navPills.map(p => p.getAttribute('href')).filter(Boolean);
  const sections = sectionIds.map(id => document.querySelector(id)).filter(Boolean);

  navPills.forEach(pill => {
    pill.addEventListener('click', e => {
      e.preventDefault();
      navPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const target = document.querySelector(pill.getAttribute('href'));
      if (target) {
        const navBar = document.querySelector('.editor-nav-bar');
        const offset = (navBar ? navBar.offsetHeight : 0) + 24;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // Scrollspy via IntersectionObserver
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navPills.forEach(pill => {
            if (pill.getAttribute('href') === id) {
              pill.classList.add('active');
              pill.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            } else {
              pill.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });
    sections.forEach(sec => observer.observe(sec));
  }

  /* Content Form Submit */
  contentForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(saveStatus, 'Saving portfolio changes…');
    try {
      const updatedContent = collectContent();
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ content: updatedContent })
      });
      const result = await response.json();
      if (response.status === 401) {
        localStorage.removeItem(tokenKey);
        window.location.reload();
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Could not save your portfolio.');
      content = updatedContent;
      setStatus(saveStatus, '✓ Saved and published! Changes have automatically updated on your portfolio live.', 'success');

      // Auto-broadcast update across all open portfolio tabs in real time
      try {
        const syncChannel = new BroadcastChannel('milan_portfolio_sync');
        syncChannel.postMessage({ type: 'PORTFOLIO_UPDATED', content: updatedContent });
      } catch (bcErr) {}
      try {
        localStorage.setItem('milan_portfolio_synced_content', JSON.stringify({
          content: updatedContent,
          timestamp: Date.now()
        }));
      } catch (lsErr) {}
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    }
  });

  /* Custom Animated Font Dropdown */
  function setupCustomFontDropdown() {
    const dropdown = document.getElementById('customFontDropdown');
    const trigger = document.getElementById('customFontTrigger');
    const menu = document.getElementById('customFontMenu');
    const nativeSelect = document.getElementById('font');
    const label = document.getElementById('selectedFontLabel');
    if (!dropdown || !trigger || !menu || !nativeSelect) return;

    function showFontToast(fontName) {
      const existing = document.querySelector('.font-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'font-toast';
      toast.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Font switched to <strong>${fontName}</strong>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -10px)';
        setTimeout(() => toast.remove(), 320);
      }, 2200);
    }

    function selectFont(fontName, isUserAction = true) {
      nativeSelect.value = fontName;
      if (label) {
        label.textContent = fontName;
        label.style.fontFamily = `'${fontName}', sans-serif`;
      }
      trigger.style.fontFamily = `'${fontName}', sans-serif`;

      menu.querySelectorAll('.font-option').forEach(opt => {
        const isActive = opt.dataset.font === fontName;
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      document.documentElement.style.setProperty('--font', `'${fontName}', system-ui, sans-serif`);
      document.body.style.fontFamily = `'${fontName}', system-ui, sans-serif`;

      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

      if (isUserAction) {
        showFontToast(fontName);
      }
    }

    window.syncCustomFontDropdown = function(fontName) {
      if (fontName) selectFont(fontName, false);
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.addEventListener('click', (e) => {
      const option = e.target.closest('.font-option');
      if (!option) return;
      const font = option.dataset.font;
      selectFont(font, true);
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });

    if (nativeSelect.value) {
      selectFont(nativeSelect.value, false);
    }
  }

  setupCustomFontDropdown();

  const savedToken = localStorage.getItem(tokenKey);
  if (savedToken) {
    loadContent().catch(error => {
      localStorage.removeItem(tokenKey);
      setStatus(loginStatus, error.message, 'error');
    });
  }
})();
