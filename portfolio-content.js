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
          // Preserve glowing gradient emphasis on clean, scalable
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

    document.querySelectorAll('[data-profile-image]').forEach(profileImage => {
      if (profile.profileImage) {
        profileImage.src = profile.profileImage;
        profileImage.alt = `${profile.name} - ${profile.role}`;
      }
    });

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

        // If this project has a registered case study modal in script.js and no code link, show Details button
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

    // 1. Try public serverless / backend API with cache-busting timestamp
    try {
      const response = await fetch(`/api/portfolio-content?_t=${timestamp}`, { cache: 'no-store' });
      if (response.ok) {
        loadedContent = await response.json();
      }
    } catch (apiErr) {
      // Continue to local json fallback
    }

    // 2. If API didn't return, fetch local portfolio-content.json
    if (!loadedContent) {
      try {
        const response = await fetch(`portfolio-content.json?_t=${timestamp}`, { cache: 'no-store' });
        if (response.ok) {
          loadedContent = await response.json();
        }
      } catch (jsonErr) {
        // Silently skip
      }
    }

    if (loadedContent) {
      applyContent(loadedContent, isLiveUpdate);
    }
  }

  // Initial load on page ready
  loadContent(false);

  // ══════════════════════════════════════════════════════════════
  // REAL-TIME AUTO SYNC ACROSS TABS AND WINDOWS
  // ══════════════════════════════════════════════════════════════

  // 1. Instant BroadcastChannel listener
  try {
    const syncChannel = new BroadcastChannel('milan_portfolio_sync');
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'PORTFOLIO_UPDATED' && event.data.content) {
        applyContent(event.data.content, true);
      }
    };
  } catch (e) {}

  // 2. Cross-tab storage event listener
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

  // 3. Auto-refresh whenever visitor or admin switches back to portfolio tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadContent(true);
    }
  });

  window.addEventListener('focus', () => {
    loadContent(true);
  });

  // 4. Background polling every 4 seconds when tab is active
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadContent(false);
    }
  }, 4000);

})();
