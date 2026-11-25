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
    let result = null;
    try {
      const response = await fetch('/api/admin/content', {
        headers: authHeaders()
      });
      if (response.status === 401) {
        localStorage.removeItem(tokenKey);
        loginScreen.hidden = false;
        editorScreen.hidden = true;
        throw new Error('Your admin session expired. Please sign in again.');
      }
      if (response.ok) {
        result = await response.json();
      } else {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Could not load portfolio content.');
      }
    } catch (netErr) {
      if (netErr.message && netErr.message.includes('expired')) throw netErr;
      console.warn('API content fetch failed, checking local sync cache:', netErr.message);
    }

    // Merge or restore with localStorage cache if available
    try {
      const cached = localStorage.getItem('milan_portfolio_synced_content');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.content) {
          if (!result || !result.content) {
            result = { content: parsed.content };
          }
        }
      }
    } catch (e) {}

    if (!result || !result.content) {
      throw new Error('Could not load portfolio content. Please check network connection.');
    }

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

    if (window.syncCustomFontDropdown && content.font) {
      window.syncCustomFontDropdown(content.font);
    }
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
        createField('View / Verify URL (optional)', item.verifyUrl, 'verifyUrl', 'text', true, 'images/certificates/... or https://...'),
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
        createField('Live Demo URL (optional)', project.liveUrl, 'liveUrl', 'text', false, 'https://...'),
        createField('Code URL (optional)', project.codeUrl, 'codeUrl', 'text', false, 'https://github.com/...'),
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

  function normalizeUrl(value) {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('images/') || trimmed.startsWith('resume/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  /* Form Data Collection with smart pruning of empty cards */
  function collectContent() {
    const profile = {
      name: (document.getElementById('profileName').value || '').trim(),
      role: (document.getElementById('profileRole').value || '').trim(),
      headline: (document.getElementById('profileHeadline').value || '').trim(),
      bio: (document.getElementById('profileBio').value || '').trim(),
      aboutBio: (document.getElementById('profileAboutBio').value || '').trim(),
      location: (document.getElementById('profileLocation').value || '').trim(),
      email: (document.getElementById('profileEmail').value || '').trim(),
      phone: (document.getElementById('profilePhone').value || '').trim(),
      github: normalizeUrl(document.getElementById('profileGithub').value),
      linkedin: normalizeUrl(document.getElementById('profileLinkedin').value),
      instagram: normalizeUrl(document.getElementById('profileInstagram').value),
      profileImage: (profileImage.value || '').trim(),
      avatarImage: (profileAvatar.value || '').trim(),
      resumeUrl: (profileResumeUrl.value || '').trim()
    };

    const recruiter = {
      role: (document.getElementById('recruiterRole').value || '').trim(),
      summary: (document.getElementById('recruiterSummary').value || '').trim(),
      coreSkills: (document.getElementById('recruiterCoreSkills').value || '').trim(),
      bestProjects: (document.getElementById('recruiterBestProjects').value || '').trim(),
      educationNote: (document.getElementById('recruiterEducationNote').value || '').trim(),
      certificationsNote: (document.getElementById('recruiterCertificationsNote').value || '').trim()
    };

    const experiences = Array.from(experienceList.querySelectorAll('.card-item')).map((card, idx) => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      const role = val('role');
      const company = val('company');
      if (!role && !company) return null; // skip completely empty cards
      return {
        id: card.dataset.itemId || `exp-${Date.now()}-${idx}`,
        role: role || 'Developer Role',
        company: company || 'Company / Organization',
        period: val('period') || 'Present',
        type: val('type') || 'Experience',
        technologies: val('technologies') ? val('technologies').split(',').map(s => s.trim()).filter(Boolean) : [],
        description: val('description') || ''
      };
    }).filter(Boolean);

    const education = Array.from(educationList.querySelectorAll('.card-item')).map((card, idx) => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      const degree = val('degree');
      const institution = val('institution');
      if (!degree && !institution) return null; // skip empty
      return {
        id: card.dataset.itemId || `edu-${Date.now()}-${idx}`,
        degree: degree || 'Degree / Qualification',
        institution: institution || 'Institution / University',
        period: val('period') || 'Present',
        status: val('status') || 'COMPLETED',
        mode: val('mode') || 'Regular Mode',
        duration: val('duration') || '',
        description: val('description') || ''
      };
    }).filter(Boolean);

    const skills = Array.from(skillsList.querySelectorAll('.card-item')).map((card, idx) => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      const name = val('name');
      if (!name) return null; // skip empty
      return {
        id: card.dataset.itemId || `skill-${Date.now()}-${idx}`,
        name,
        level: val('level') || '80%',
        category: val('category') || 'Technology',
        icon: val('icon') || ''
      };
    }).filter(Boolean);

    const certificates = Array.from(certificateList.querySelectorAll('.card-item')).map((card, idx) => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      const title = val('title');
      if (!title) return null; // skip empty
      return {
        id: card.dataset.itemId || `cert-${Date.now()}-${idx}`,
        title,
        issuer: val('issuer') || 'Issuer Platform',
        category: (val('category') || 'other').toLowerCase(),
        tags: val('tags') ? val('tags').split(',').map(s => s.trim()).filter(Boolean) : [],
        verifyUrl: val('verifyUrl') || '',
        image: val('image') || ''
      };
    }).filter(Boolean);

    const projects = Array.from(projectList.querySelectorAll('.card-item')).map((card, idx) => {
      const val = k => (card.querySelector(`[data-field="${k}"]`) ? card.querySelector(`[data-field="${k}"]`).value.trim() : '');
      const title = val('title');
      if (!title) return null; // skip empty
      let projId = (card.dataset.projectId || `project-${Date.now().toString(36)}-${idx}`).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50);
      if (!projId || projId === '-') projId = `project-${idx + 1}`;
      return {
        id: projId,
        title,
        description: val('description') || 'Key technical highlights and implementation details.',
        technologies: val('technologies') ? val('technologies').split(',').map(s => s.trim()).filter(Boolean) : [],
        image: val('image') || '',
        icon: card.dataset.projectIcon || '',
        liveUrl: normalizeUrl(val('liveUrl')),
        codeUrl: normalizeUrl(val('codeUrl'))
      };
    }).filter(Boolean);

    return {
      font: document.getElementById('font').value || 'Plus Jakarta Sans',
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

  /* Recruiter Mode Auto-Fill & Clear Handlers */
  const autoFillBtn = document.getElementById('autoFillRecruiterBtn');
  if (autoFillBtn) {
    autoFillBtn.addEventListener('click', () => {
      // 1. Role subtitle
      const pRole = (document.getElementById('profileRole').value || '').trim();
      const pLoc = (document.getElementById('profileLocation').value || '').trim();
      document.getElementById('recruiterRole').value = [pRole, 'B.Sc. IT', pLoc].filter(Boolean).join(' · ');

      // 2. Professional Summary / Pitch
      const pBio = (document.getElementById('profileBio').value || '').trim();
      const pHead = (document.getElementById('profileHeadline').value || '').trim();
      document.getElementById('recruiterSummary').value = pBio || pHead || 'Specialized in Python backend, Django, and REST APIs. Building production-ready software solutions with clean architecture.';

      // 3. Core Skills Highlight
      const skillCards = Array.from(document.querySelectorAll('#skillsList .card-item [data-field="name"]'));
      const skillNames = skillCards.map(input => input.value.trim()).filter(Boolean);
      if (skillNames.length > 0) {
        document.getElementById('recruiterCoreSkills').value = skillNames.join(', ');
      }

      // 4. Best Projects Highlight
      const projectCards = Array.from(document.querySelectorAll('#projectList .card-item [data-field="title"]'));
      const projectTitles = projectCards.map(input => input.value.trim()).filter(Boolean);
      if (projectTitles.length > 0) {
        document.getElementById('recruiterBestProjects').value = projectTitles.join(', ');
      }

      // 5. Education Note
      const eduCards = Array.from(document.querySelectorAll('#educationList .card-item'));
      if (eduCards.length > 0) {
        const eduSummaries = eduCards.map(c => {
          const degree = (c.querySelector('[data-field="degree"]')?.value || '').trim();
          const inst = (c.querySelector('[data-field="institution"]')?.value || '').trim();
          return [degree, inst].filter(Boolean).join(' (');
        }).filter(Boolean).map(s => s + ')');
        document.getElementById('recruiterEducationNote').value = eduSummaries.join(' & ');
      }

      // 6. Certifications Note
      const certCount = document.querySelectorAll('#certificateList .card-item').length;
      document.getElementById('recruiterCertificationsNote').value = `${certCount || 9} certificates from NASSCOM, Udemy, Microsoft, Tata, Unstop`;

      setStatus(saveStatus, '✓ Recruiter Mode details auto-filled from your portfolio! Click "Save and publish" to apply.', 'success');
    });
  }

  const clearRecruiterBtn = document.getElementById('clearRecruiterBtn');
  if (clearRecruiterBtn) {
    clearRecruiterBtn.addEventListener('click', () => {
      document.getElementById('recruiterRole').value = '';
      document.getElementById('recruiterSummary').value = '';
      document.getElementById('recruiterCoreSkills').value = '';
      document.getElementById('recruiterBestProjects').value = '';
      document.getElementById('recruiterEducationNote').value = '';
      document.getElementById('recruiterCertificationsNote').value = '';
      setStatus(saveStatus, 'Recruiter Mode details cleared. Click "Save and publish" to remove them from your portfolio.', 'success');
    });
  }

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

  function focusNewCard(container, isLast) {
    const card = isLast ? container.lastElementChild : container.firstElementChild;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = card.querySelector('input, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 250);
    }
  }

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
    focusNewCard(experienceList, false);
    setStatus(saveStatus, 'New experience entry added. Fill in details and click "Save and publish".', 'success');
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
    focusNewCard(educationList, false);
    setStatus(saveStatus, 'New education entry added. Fill in details and click "Save and publish".', 'success');
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
    focusNewCard(skillsList, true);
    setStatus(saveStatus, 'New skill added. Enter name and proficiency and click "Save and publish".', 'success');
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
    focusNewCard(certificateList, false);
    setStatus(saveStatus, 'New certificate entry added. Upload image and click "Save and publish".', 'success');
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
    focusNewCard(projectList, true);
    setStatus(saveStatus, 'New project entry added. Enter project details and click "Save and publish".', 'success');
  });

  /* Delete Actions across all item lists */
  document.addEventListener('click', event => {
    const btn = event.target.closest('.remove-item-btn');
    if (!btn || btn.id === 'clearRecruiterBtn') return;
    const card = btn.closest('.card-item');
    if (card) {
      card.style.transition = 'all 0.25s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.96)';
      setTimeout(() => {
        card.remove();
        updateCounts();
        setStatus(saveStatus, '✓ Item removed. Click "Save and publish" to apply updates live.', 'success');
      }, 200);
    }
  });

  /* Live Card Header & Badge Sync */
  document.addEventListener('input', event => {
    const input = event.target;
    const card = input.closest('.card-item');
    if (!card) return;

    const titleEl = card.querySelector('.card-item-title');
    const badgeEl = card.querySelector('.card-item-badge');

    if (card.closest('#experienceList')) {
      const role = (card.querySelector('[data-field="role"]')?.value || '').trim();
      const company = (card.querySelector('[data-field="company"]')?.value || '').trim();
      const type = (card.querySelector('[data-field="type"]')?.value || '').trim();
      if (titleEl) titleEl.textContent = `${role || 'New Role'} @ ${company || 'Company'}`;
      if (badgeEl && type) badgeEl.textContent = type;
    } else if (card.closest('#educationList')) {
      const degree = (card.querySelector('[data-field="degree"]')?.value || '').trim();
      const status = (card.querySelector('[data-field="status"]')?.value || '').trim();
      if (titleEl) titleEl.textContent = degree || 'Degree';
      if (badgeEl && status) badgeEl.textContent = status;
    } else if (card.closest('#skillsList')) {
      const name = (card.querySelector('[data-field="name"]')?.value || '').trim();
      const level = (card.querySelector('[data-field="level"]')?.value || '').trim();
      if (titleEl) titleEl.textContent = name || 'New Skill';
      if (badgeEl && level) badgeEl.textContent = level;
    } else if (card.closest('#certificateList')) {
      const title = (card.querySelector('[data-field="title"]')?.value || '').trim();
      const cat = (card.querySelector('[data-field="category"]')?.value || '').trim();
      if (titleEl) titleEl.textContent = title || 'Certificate Title';
      if (badgeEl && cat) badgeEl.textContent = cat;
    } else if (card.closest('#projectList')) {
      const title = (card.querySelector('[data-field="title"]')?.value || '').trim();
      if (titleEl) titleEl.textContent = title || 'Project Title';
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

      // Client-side required fields check
      if (!updatedContent.profile.name || !updatedContent.profile.name.trim()) {
        const nameInput = document.getElementById('profileName');
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        throw new Error('Please enter your name in Personal Details.');
      }
      if (!updatedContent.profile.role || !updatedContent.profile.role.trim()) {
        const roleInput = document.getElementById('profileRole');
        roleInput.focus();
        roleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        throw new Error('Please enter your role / title in Personal Details.');
      }

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
