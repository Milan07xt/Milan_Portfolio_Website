(function () {
  'use strict';

  const allowedFonts = new Set([
    'Plus Jakarta Sans',
    'Inter',
    'Poppins',
    'Roboto',
    'Space Grotesk'
  ]);

  let lastAppliedContentHash = '';

  function safeLink(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (error) {
      return false;
    }
  }

  function setProfile(content) {
    const profile = content.profile;
    if (!profile) return;

    document.querySelectorAll('[data-profile-field]').forEach(element => {
      const field = element.dataset.profileField;
      let value = profile[field];
      if (field === 'instagramHandle' && profile.instagram) {
        value = new URL(profile.instagram).pathname.split('/').filter(Boolean)[0];
        value = value ? `@${value}` : profile.instagram;
      }
      if (field === 'github' && profile.github) {
        value = new URL(profile.github).pathname.split('/').filter(Boolean)[0];
        value = value ? `@${value}` : profile.github;
      }
      if (field === 'linkedin' && profile.linkedin) {
        value = new URL(profile.linkedin).pathname.split('/').filter(Boolean).pop();
      }

      if (value !== undefined && value !== null) {
        if (field === 'headline') {
          element.innerHTML = value.replace(/(clean,\s*scalable)/gi, '<em>$1</em>');
        } else {
          element.textContent = value;
        }
      }
    });

    document.querySelectorAll('[data-profile-link]').forEach(element => {
      const field = element.dataset.profileLink;
      let value = profile[field];
      if (field === 'email' && profile.email) value = `mailto:${profile.email}`;
      if (field === 'phone' && profile.phone) {
        const digits = profile.phone.replace(/\D/g, '');
        value = element.getAttribute('aria-label') === 'WhatsApp'
          ? `https://wa.me/${digits}`
          : `tel:${profile.phone}`;
      }
      if (value && safeLink(value)) {
        element.href = value;
        if (element.target === '_blank') element.rel = 'noopener noreferrer';
      }
    });

    const roleBadges = document.querySelectorAll('[data-profile-role]');
    roleBadges.forEach(roleBadge => {
      if (profile.role) {
        const dot = roleBadge.querySelector('.badge-dot');
        roleBadge.replaceChildren();
        if (dot) roleBadge.appendChild(dot);
        roleBadge.appendChild(document.createTextNode(` ${profile.role.toUpperCase()}`));
      }
    });

    document.querySelectorAll('[data-profile-image]').forEach(profileImg => {
      if (profile.profileImage) {
        profileImg.src = profile.profileImage;
        profileImg.alt = `${profile.name} - ${profile.role}`;
      }
    });

    // Detailed About Me Bio
    if (profile.aboutBio) {
      const aboutFirstP = document.querySelector('.about-bio p');
      if (aboutFirstP) aboutFirstP.innerHTML = profile.aboutBio;
    }

    // Resume Download Links
    if (profile.resumeUrl) {
      document.querySelectorAll('a[href*="Resume.pdf"], a[download]').forEach(el => {
        el.href = profile.resumeUrl;
      });
    }

    // Recruiter Avatar
    if (profile.avatarImage) {
      document.querySelectorAll('.recruiter-avatar img').forEach(el => {
        el.src = profile.avatarImage;
      });
    }

    // Recruiter Mode Overlay Highlights
    const r = content.recruiter;
    if (r) {
      const roleEl = document.querySelector('.recruiter-role');
      if (roleEl && r.role) roleEl.textContent = r.role;

      if (r.coreSkills) {
        const chipsEl = document.querySelector('.recruiter-chips');
        if (chipsEl) {
          chipsEl.replaceChildren();
          r.coreSkills.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
            const chip = document.createElement('span');
            chip.className = `rc-chip ${s.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            chip.textContent = s;
            chipsEl.appendChild(chip);
          });
        }
      }

      if (r.bestProjects) {
        const projListEl = document.querySelector('.recruiter-projects-list');
        if (projListEl) {
          projListEl.replaceChildren();
          r.bestProjects.split(',').map(s => s.trim()).filter(Boolean).forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-circle" style="color:#3776AB;font-size:8px"></i> <strong>${p}</strong>`;
            projListEl.appendChild(li);
          });
        }
      }

      if (r.educationNote) {
        const eduBlocks = document.querySelectorAll('.recruiter-block');
        if (eduBlocks[2]) {
          const p = eduBlocks[2].querySelector('p');
          if (p) p.innerHTML = r.educationNote.replace(/\n/g, '<br>');
        }
      }

      if (r.certificationsNote) {
        const eduBlocks = document.querySelectorAll('.recruiter-block');
        if (eduBlocks[3]) {
          const p = eduBlocks[3].querySelector('p');
          if (p) p.textContent = r.certificationsNote;
        }
      }
    }

    if (profile.name && profile.role) {
      document.title = `${profile.name} | ${profile.role}`;
    }
    const description = document.querySelector('meta[name="description"]');
    if (description && profile.bio) {
      description.content = profile.bio;
    }
  }

  function createAction(url, label, icon, primary) {
    if (!url || !safeLink(url)) return null;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = `proj-btn ${primary ? 'proj-btn-primary' : 'proj-btn-ghost'}`;
    const iconElement = document.createElement('i');
    iconElement.className = icon;
    link.append(iconElement, document.createTextNode(` ${label}`));
    return link;
  }

  /* Dynamic Experience Renderer */
  function renderExperiences(experiences) {
    const timeline = document.querySelector('#experience .timeline');
    if (!timeline || !Array.isArray(experiences) || experiences.length === 0) return;
    timeline.replaceChildren();

    const track = document.createElement('div');
    track.className = 'timeline-track';
    timeline.appendChild(track);

    const icons = {
      'internship': 'fa-solid fa-briefcase',
      'freelance': 'fa-solid fa-code',
      'academic': 'fa-solid fa-graduation-cap',
      'full-time': 'fa-solid fa-building'
    };

    experiences.forEach((exp, i) => {
      const item = document.createElement('div');
      item.className = 'timeline-item reveal-up revealed';
      item.style.setProperty('--delay', `${i * 0.1}s`);

      const dot = document.createElement('div');
      dot.className = 'timeline-dot';
      const typeKey = (exp.type || '').toLowerCase();
      const iconClass = icons[typeKey] || 'fa-solid fa-briefcase';
      dot.innerHTML = `<i class="${iconClass}"></i>`;

      const content = document.createElement('div');
      content.className = 'timeline-content glass-card';

      const header = document.createElement('div');
      header.className = 'timeline-header';
      header.innerHTML = `
        <span class="timeline-period">${exp.period || ''}</span>
        <span class="timeline-type ${typeKey}">${exp.type || 'Experience'}</span>
      `;

      const role = document.createElement('h3');
      role.className = 'timeline-role';
      role.textContent = exp.role || '';

      const org = document.createElement('h4');
      org.className = 'timeline-org';
      org.textContent = exp.company || '';

      const desc = document.createElement('p');
      desc.className = 'timeline-desc';
      desc.textContent = exp.description || '';

      const techWrap = document.createElement('div');
      techWrap.className = 'timeline-tech';
      (exp.technologies || []).forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        techWrap.appendChild(span);
      });

      content.append(header, role, org, desc, techWrap);
      item.append(dot, content);
      timeline.appendChild(item);
    });
  }

  /* Dynamic Education Renderer */
  function renderEducation(educationList) {
    const container = document.querySelector('#education .timeline-container');
    if (!container || !Array.isArray(educationList) || educationList.length === 0) return;
    container.replaceChildren();

    const line = document.createElement('div');
    line.className = 'timeline-line';
    container.appendChild(line);

    educationList.forEach((edu, index) => {
      const item = document.createElement('div');
      item.className = 'timeline-item reveal-up revealed';
      const themeColor = index % 2 === 0 ? '#8B5CF6' : '#3B82F6';
      item.style.cssText = `--delay:${(index + 1) * 0.1}s; --theme-color: ${themeColor};`;

      const node = document.createElement('div');
      node.className = 'timeline-node';
      node.textContent = String(index + 1).padStart(2, '0');

      const card = document.createElement('div');
      card.className = 'edu-card glass-card';

      const statusClass = (edu.status || '').toLowerCase() === 'pursuing' ? 'pursuing' : 'completed';
      const badgeColor = index % 2 === 0 ? 'purple' : 'blue';

      card.innerHTML = `
        <div class="edu-card-left">
          <div class="edu-card-badge ${badgeColor}">
            <i class="fa-solid fa-graduation-cap"></i>
            <div class="badge-time"><i class="${statusClass === 'pursuing' ? 'fa-regular fa-clock' : 'fa-solid fa-circle-check'}"></i></div>
          </div>
          <div class="edu-card-year">${edu.period || ''}</div>
          <div class="edu-status-badge ${statusClass}">${(edu.status || 'COMPLETED').toUpperCase()}</div>
          <div class="edu-label">${edu.mode || 'Degree'}</div>
        </div>
        <div class="edu-card-middle">
          <div class="top-badge-row">
            <h3 class="edu-card-degree">${edu.degree || ''}</h3>
            ${statusClass === 'completed' ? '<div class="top-status-badge green"><i class="fa-solid fa-check"></i> Completed</div>' : ''}
          </div>
          <div class="edu-card-school">${edu.institution || ''}</div>
          <p class="edu-desc">${edu.description || ''}</p>
          ${edu.duration ? `
            <div class="edu-details-row">
              <div class="detail-item"><i class="fa-regular fa-calendar"></i><div><span>Details</span><strong>${edu.duration}</strong></div></div>
              <div class="detail-item"><i class="fa-solid fa-book-open"></i><div><span>Mode</span><strong>${edu.mode || 'Regular'}</strong></div></div>
              <div class="detail-item"><i class="fa-solid fa-graduation-cap"></i><div><span>Status</span><strong>${edu.status || 'Completed'}</strong></div></div>
            </div>
          ` : ''}
        </div>
      `;

      item.append(node, card);
      container.appendChild(item);
    });
  }

  /* Dynamic Skills Galaxy Renderer */
  function renderSkills(skillsList) {
    const galaxy = document.getElementById('skillsGalaxy');
    if (!galaxy || !Array.isArray(skillsList) || skillsList.length === 0) return;

    const center = galaxy.querySelector('.galaxy-center');
    galaxy.replaceChildren();
    if (center) galaxy.appendChild(center);

    skillsList.forEach((skill, index) => {
      const node = document.createElement('div');
      node.className = `skill-node sn-${(index % 9) + 1}`;
      node.dataset.skill = skill.name || '';
      node.dataset.level = skill.level || '';
      node.dataset.desc = skill.category || '';

      const inner = document.createElement('div');
      inner.className = 'node-inner';

      if (skill.icon && skill.icon.startsWith('http')) {
        inner.innerHTML = `<img src="${skill.icon}" alt="${skill.name}" width="28" height="28"><span>${skill.name}</span>`;
      } else if (skill.icon && skill.icon.includes('fa-')) {
        inner.innerHTML = `<i class="${skill.icon}" style="font-size:22px"></i><span>${skill.name}</span>`;
      } else {
        inner.innerHTML = `<i class="fa-solid fa-code" style="font-size:22px"></i><span>${skill.name}</span>`;
      }

      const tooltip = document.createElement('div');
      tooltip.className = 'node-tooltip';
      tooltip.textContent = `${skill.name} • ${skill.level || 'Proficient'} · ${skill.category || 'Skill'}`;

      node.append(inner, tooltip);
      galaxy.appendChild(node);
    });

    const chipsRow = document.querySelector('.skills-chips-row');
    if (chipsRow) {
      chipsRow.replaceChildren();
      skillsList.forEach(skill => {
        const chip = document.createElement('span');
        chip.className = 'skill-chip';
        if (skill.icon && skill.icon.startsWith('http')) {
          chip.innerHTML = `<img src="${skill.icon}" width="16" height="16" alt=""> ${skill.name}`;
        } else if (skill.icon && skill.icon.includes('fa-')) {
          chip.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;
        } else {
          chip.textContent = skill.name;
        }
        chipsRow.appendChild(chip);
      });
    }
  }

  /* Dynamic Certificates Renderer */
  function renderCertificates(certList) {
    const grid = document.getElementById('certGrid');
    if (!grid || !Array.isArray(certList) || certList.length === 0) return;
    grid.replaceChildren();

    certList.forEach((cert, index) => {
      const card = document.createElement('div');
      card.className = 'cert-card glass-card reveal-up revealed';
      card.dataset.certTags = (cert.category || 'other').toLowerCase();
      card.style.setProperty('--delay', `${(index * 0.05).toFixed(2)}s`);

      const imgWrap = document.createElement('div');
      imgWrap.className = 'cert-img-wrap';
      const img = document.createElement('img');
      img.src = cert.image || 'images/Profile.jpeg';
      img.alt = cert.title || 'Certificate';
      img.loading = 'lazy';
      const overlay = document.createElement('div');
      overlay.className = 'cert-img-overlay';
      imgWrap.append(img, overlay);

      const body = document.createElement('div');
      body.className = 'cert-card-body';
      const cat = (cert.category || 'Certificate').toLowerCase();

      const issuerRow = document.createElement('div');
      issuerRow.className = 'cert-issuer-row';
      issuerRow.innerHTML = `
        <span class="cert-org">${cert.issuer || ''}</span>
        <span class="cert-badge ${cat}">${cert.category || 'Cert'}</span>
      `;

      const name = document.createElement('h3');
      name.className = 'cert-name';
      name.textContent = cert.title || '';

      const tagsRow = document.createElement('div');
      tagsRow.className = 'cert-tags-row';
      (cert.tags || []).forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        tagsRow.appendChild(span);
      });

      const viewLink = document.createElement('a');
      viewLink.href = cert.verifyUrl || cert.image || '#';
      viewLink.target = '_blank';
      viewLink.rel = 'noopener noreferrer';
      viewLink.className = 'cert-view-btn';
      viewLink.innerHTML = '<i class="fa-solid fa-external-link-alt"></i> View Certificate';

      body.append(issuerRow, name, tagsRow, viewLink);
      card.append(imgWrap, body);
      grid.appendChild(card);
    });

    const certCounter = document.querySelector('.dash-stat-num[data-stat="certs"]');
    if (certCounter) {
      certCounter.dataset.count = certList.length;
      certCounter.textContent = certList.length;
    }
  }

  /* Dynamic Projects Renderer */
  function renderProjects(projects) {
    const grid = document.getElementById('projectGrid');
    if (!grid || !Array.isArray(projects)) return;
    grid.replaceChildren();

    const caseStudyHandlers = {
      'ai': () => window.openAICaseStudy && window.openAICaseStudy(),
      'face-attendance': () => window.openFaceCaseStudy && window.openFaceCaseStudy(),
      'face': () => window.openFaceCaseStudy && window.openFaceCaseStudy(),
      'gym': () => window.openGymCaseStudy && window.openGymCaseStudy(),
      'hotel': () => window.openHotelCaseStudy && window.openHotelCaseStudy(),
      'salon': () => window.openSalonCaseStudy && window.openSalonCaseStudy()
    };

    projects.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = 'project-card reveal-up tilt-card revealed';
      card.dataset.tags = (project.technologies || []).join(' ').toLowerCase();
      card.style.setProperty('--delay', `${index * 0.05}s`);

      const imageWrap = document.createElement('div');
      imageWrap.className = 'project-card-image-wrap';
      if (project.image) {
        const image = document.createElement('img');
        image.className = 'project-card-img';
        image.src = project.image;
        image.alt = project.title || 'Project Image';
        image.loading = 'lazy';
        imageWrap.appendChild(image);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'project-placeholder-img';
        placeholder.style.background = 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)';
        const icon = document.createElement('i');
        icon.className = `fa-solid ${/^fa-[a-z0-9-]+$/.test(project.icon) ? project.icon : 'fa-laptop-code'}`;
        icon.style.cssText = 'font-size:3.5rem;color:rgba(255,255,255,0.9)';
        placeholder.appendChild(icon);
        imageWrap.appendChild(placeholder);
      }

      const overlay = document.createElement('div');
      overlay.className = 'project-image-overlay';
      imageWrap.appendChild(overlay);

      if (project.liveUrl || project.id === 'ai') {
        const badge = document.createElement('span');
        badge.className = 'project-live-badge';
        badge.innerHTML = '<span class="pulse-dot"></span> LIVE';
        imageWrap.appendChild(badge);
      }

      const body = document.createElement('div');
      body.className = 'project-card-body';
      const tags = document.createElement('div');
      tags.className = 'project-card-tags';
      (project.technologies || []).forEach(technology => {
        const tag = document.createElement('span');
        tag.className = 'ptag';
        tag.textContent = technology;
        tags.appendChild(tag);
      });

      const title = document.createElement('h3');
      title.className = 'project-card-title';
      title.textContent = project.title || 'Untitled Project';

      const description = document.createElement('p');
      description.className = 'project-card-desc';
      description.textContent = project.description || '';

      const actions = document.createElement('div');
      actions.className = 'project-card-actions';

      if (project.id === 'ai') {
        const tryButton = document.createElement('button');
        tryButton.type = 'button';
        tryButton.className = 'proj-btn proj-btn-primary';
        tryButton.innerHTML = '<i class="fa-solid fa-comment-dots"></i> Try it now';
        tryButton.addEventListener('click', () => {
          const assistant = document.getElementById('ai-agent-btn');
          if (assistant) assistant.click();
        });
        const detailsButton = document.createElement('button');
        detailsButton.type = 'button';
        detailsButton.className = 'proj-btn proj-btn-ghost';
        detailsButton.innerHTML = '<i class="fa-solid fa-circle-info"></i> Details';
        detailsButton.addEventListener('click', () => {
          if (window.openAICaseStudy) window.openAICaseStudy();
        });
        actions.append(tryButton, detailsButton);
      } else {
        const liveLink = createAction(project.liveUrl, 'Live Demo', 'fa-solid fa-arrow-up-right-from-square', true);
        const codeLink = createAction(project.codeUrl, 'Code', 'fab fa-github', false);
        if (liveLink) actions.appendChild(liveLink);
        if (codeLink) actions.appendChild(codeLink);

        const modalOpener = caseStudyHandlers[project.id];
        if (modalOpener && !codeLink) {
          const detailsButton = document.createElement('button');
          detailsButton.type = 'button';
          detailsButton.className = 'proj-btn proj-btn-ghost';
          detailsButton.innerHTML = '<i class="fa-solid fa-circle-info"></i> Details';
          detailsButton.addEventListener('click', modalOpener);
          actions.appendChild(detailsButton);
        }
      }

      body.append(tags, title, description, actions);
      card.append(imageWrap, body);
      grid.appendChild(card);
    });

    const count = document.querySelector('.hero-stat-num[data-count]');
    if (count) {
      count.dataset.count = projects.length;
      count.textContent = projects.length;
    }
    const dashboardCount = document.querySelector('.dash-stat-num[data-count]');
    if (dashboardCount) {
      dashboardCount.dataset.count = projects.length;
      dashboardCount.textContent = projects.length;
    }
  }

  function showLiveUpdatePill() {
    let pill = document.getElementById('portfolioLiveUpdatePill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'portfolioLiveUpdatePill';
      pill.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(40px);
        background: rgba(16, 185, 129, 0.95);
        color: #ffffff;
        padding: 10px 22px;
        border-radius: 999px;
        font-family: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.35);
        backdrop-filter: blur(8px);
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
      `;
      pill.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin" style="font-size:0.9rem"></i> Portfolio updated live';
      document.body.appendChild(pill);
    }

    requestAnimationFrame(() => {
      pill.style.opacity = '1';
      pill.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(() => {
        pill.style.opacity = '0';
        pill.style.transform = 'translateX(-50%) translateY(40px)';
      }, 2400);
    });
  }

  function applyContent(content, isLiveUpdate = false) {
    if (!content || !content.profile || !Array.isArray(content.projects)) return;
    const contentHash = JSON.stringify(content);
    if (contentHash === lastAppliedContentHash) return;
    lastAppliedContentHash = contentHash;

    setProfile(content);
    renderProjects(content.projects);
    if (Array.isArray(content.experiences)) renderExperiences(content.experiences);
    if (Array.isArray(content.education)) renderEducation(content.education);
    if (Array.isArray(content.skills)) renderSkills(content.skills);
    if (Array.isArray(content.certificates)) renderCertificates(content.certificates);

    if (allowedFonts.has(content.font)) {
      document.documentElement.style.setProperty('--font', `'${content.font}', system-ui, sans-serif`);
    }

    if (isLiveUpdate) {
      showLiveUpdatePill();
    }
  }

  async function loadContent(isLiveUpdate = false) {
    const timestamp = Date.now();
    let loadedContent = null;

    try {
      const response = await fetch(`/api/portfolio-content?_t=${timestamp}`, { cache: 'no-store' });
      if (response.ok) {
        loadedContent = await response.json();
      }
    } catch (apiErr) {}

    if (!loadedContent) {
      try {
        const response = await fetch(`portfolio-content.json?_t=${timestamp}`, { cache: 'no-store' });
        if (response.ok) {
          loadedContent = await response.json();
        }
      } catch (jsonErr) {}
    }

    if (loadedContent) {
      applyContent(loadedContent, isLiveUpdate);
    }
  }

  loadContent(false);

  try {
    const syncChannel = new BroadcastChannel('milan_portfolio_sync');
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'PORTFOLIO_UPDATED' && event.data.content) {
        applyContent(event.data.content, true);
      }
    };
  } catch (e) {}

  window.addEventListener('storage', (event) => {
    if (event.key === 'milan_portfolio_synced_content' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (data && data.content) {
          applyContent(data.content, true);
        }
      } catch (e) {}
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadContent(true);
    }
  });

  window.addEventListener('focus', () => {
    loadContent(true);
  });

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadContent(false);
    }
  }, 4000);

})();
