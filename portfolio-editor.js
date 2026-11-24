(function () {
  'use strict';

  const tokenKey = 'adminToken';
  const loginScreen = document.getElementById('loginScreen');
  const editorScreen = document.getElementById('editorScreen');
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const loginContact = document.getElementById('loginContact');
  const contentForm = document.getElementById('contentForm');
  const projectList = document.getElementById('projectList');
  const saveStatus = document.getElementById('saveStatus');
  const profileImage = document.getElementById('profileImage');
  let content = null;

  function setStatus(element, message, type) {
    element.textContent = message;
    element.className = `form-status${type ? ` ${type}` : ''}`;
  }

  function authHeaders(extra) {
    return Object.assign({ Authorization: `Bearer ${localStorage.getItem(tokenKey) || ''}` }, extra || {});
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
    renderProjects(content.projects);
    loginScreen.hidden = true;
    editorScreen.hidden = false;
  }

  function fillProfile(data) {
    document.getElementById('font').value = data.font;
    if (window.syncCustomFontDropdown) {
      window.syncCustomFontDropdown(data.font);
    }
    document.getElementById('profileName').value = data.profile.name;
    document.getElementById('profileRole').value = data.profile.role;
    document.getElementById('profileHeadline').value = data.profile.headline;
    document.getElementById('profileBio').value = data.profile.bio;
    document.getElementById('profileLocation').value = data.profile.location;
    document.getElementById('profileEmail').value = data.profile.email;
    document.getElementById('profilePhone').value = data.profile.phone;
    document.getElementById('profileGithub').value = data.profile.github;
    document.getElementById('profileLinkedin').value = data.profile.linkedin;
    document.getElementById('profileInstagram').value = data.profile.instagram;
    profileImage.value = data.profile.profileImage;
    showPreview(data.profile.profileImage);
  }

  function showPreview(url) {
    const preview = document.getElementById('profilePreview');
    preview.hidden = !url;
    if (url) preview.src = url;
  }

  function createField(labelText, value, key, type, wide) {
    const label = document.createElement('label');
    if (wide) label.className = 'wide-field';
    label.append(document.createTextNode(labelText));
    const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    input.dataset.projectField = key;
    if (type === 'textarea') input.rows = 3;
    else input.type = type || 'text';
    input.value = value || '';
    label.appendChild(input);
    return label;
  }

  function renderProjects(projects) {
    projectList.replaceChildren();
    projects.forEach((project, index) => {
      const card = document.createElement('article');
      card.className = 'project-item';
      card.dataset.projectId = project.id;
      card.dataset.projectIcon = project.icon || '';

      const header = document.createElement('div');
      header.className = 'project-item-header';
      const title = document.createElement('strong');
      title.textContent = project.title || `Project ${index + 1}`;
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-project';
      removeButton.dataset.action = 'remove';
      removeButton.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';
      header.append(title, removeButton);

      const fields = document.createElement('div');
      fields.className = 'project-fields';
      fields.append(
        createField('Project title', project.title, 'title', 'text'),
        createField('Technologies (comma separated)', (project.technologies || []).join(', '), 'technologies', 'text'),
        createField('Description', project.description, 'description', 'textarea', true),
        createField('Live demo URL (optional)', project.liveUrl, 'liveUrl', 'url'),
        createField('Code URL (optional)', project.codeUrl, 'codeUrl', 'url'),
        createField('Project image URL (optional)', project.image, 'image', 'text', true)
      );

      const uploadLabel = document.createElement('label');
      uploadLabel.className = 'wide-field';
      uploadLabel.append(document.createTextNode('Upload project image'));
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/png,image/jpeg,image/webp,image/gif';
      fileInput.dataset.action = 'upload-project';
      uploadLabel.appendChild(fileInput);
      fields.appendChild(uploadLabel);
      card.append(header, fields);
      projectList.appendChild(card);
    });
  }

  function collectContent() {
    const profile = {
      name: document.getElementById('profileName').value.trim(),
      role: document.getElementById('profileRole').value.trim(),
      headline: document.getElementById('profileHeadline').value.trim(),
      bio: document.getElementById('profileBio').value.trim(),
      location: document.getElementById('profileLocation').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      phone: document.getElementById('profilePhone').value.trim(),
      github: document.getElementById('profileGithub').value.trim(),
      linkedin: document.getElementById('profileLinkedin').value.trim(),
      instagram: document.getElementById('profileInstagram').value.trim(),
      profileImage: profileImage.value.trim()
    };
    const projects = Array.from(projectList.querySelectorAll('.project-item')).map(card => {
      const value = key => card.querySelector(`[data-project-field="${key}"]`).value.trim();
      return {
        id: card.dataset.projectId,
        title: value('title'),
        description: value('description'),
        technologies: value('technologies').split(',').map(item => item.trim()).filter(Boolean),
        image: value('image'),
        icon: card.dataset.projectIcon || '',
        liveUrl: value('liveUrl'),
        codeUrl: value('codeUrl')
      };
    });
    return { font: document.getElementById('font').value, profile, projects };
  }

  async function uploadFile(file, onUploaded) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) throw new Error('Choose an image smaller than 3 MB.');
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
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
    if (!response.ok) throw new Error(result.error || 'Image upload failed.');
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

  document.getElementById('uploadProfileButton').addEventListener('click', () => {
    document.getElementById('profileImageFile').click();
  });
  document.getElementById('profileImageFile').addEventListener('change', async event => {
    try {
      setStatus(saveStatus, 'Uploading profile image…');
      await uploadFile(event.target.files[0], url => {
        profileImage.value = url;
        showPreview(url);
      });
      setStatus(saveStatus, 'Image uploaded. Save to publish your changes.', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    } finally {
      event.target.value = '';
    }
  });
  profileImage.addEventListener('input', () => showPreview(profileImage.value.trim()));

  projectList.addEventListener('click', event => {
    const button = event.target.closest('[data-action="remove"]');
    if (!button) return;
    button.closest('.project-item').remove();
  });
  projectList.addEventListener('change', async event => {
    const input = event.target.closest('[data-action="upload-project"]');
    if (!input || !input.files[0]) return;
    const card = input.closest('.project-item');
    const imageField = card.querySelector('[data-project-field="image"]');
    try {
      setStatus(saveStatus, 'Uploading project image…');
      await uploadFile(input.files[0], url => { imageField.value = url; });
      setStatus(saveStatus, 'Image uploaded. Save to publish your changes.', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    } finally {
      input.value = '';
    }
  });

  document.getElementById('addProjectButton').addEventListener('click', () => {
    const projects = Array.from(projectList.querySelectorAll('.project-item')).map(card => ({
      id: card.dataset.projectId,
      title: card.querySelector('[data-project-field="title"]').value,
      description: card.querySelector('[data-project-field="description"]').value,
      technologies: card.querySelector('[data-project-field="technologies"]').value.split(',').map(tag => tag.trim()).filter(Boolean),
      image: card.querySelector('[data-project-field="image"]').value,
      icon: card.dataset.projectIcon || '',
      liveUrl: card.querySelector('[data-project-field="liveUrl"]').value,
      codeUrl: card.querySelector('[data-project-field="codeUrl"]').value
    }));
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

  contentForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(saveStatus, 'Saving portfolio…');
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

      // Morph editor typography smoothly to preview the chosen font
      document.documentElement.style.setProperty('--font', `'${fontName}', system-ui, sans-serif`);
      document.body.style.fontFamily = `'${fontName}', system-ui, sans-serif`;

      // Dispatch change event on native select for any listening handlers
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
