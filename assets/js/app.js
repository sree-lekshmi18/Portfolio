/**
 * ==============================================================================
 * APPLICATION LOGIC & DYNAMIC HYDRATION - CRYSTAL BLACK PORTFOLIO
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.PORTFOLIO_DATA;
  if (!data) {
    console.error('Portfolio data not found.');
    return;
  }

  // 1. Initialize UI Renderers
  renderHero(data.personal);
  renderAbout(data.about, data.personal);
  renderSkills(data.skills);
  renderProjects(data.projects);
  renderMilestones(data.milestones);
  renderCollaborate(data.personal, data.collaborationInterests);
  renderFooter(data.personal, data.footer);

  // 2. Initialize Interactivity Systems
  initHeroGalaxy();
  initFooterSlingButton();
  initNavigation();
  initMobileMenu();
  initScrollReveals();
  initProjectModal(data.projects);
  initFormHandling(data.personal);
  initLucideIcons();
});

/**
 * Initialize React Bits <Galaxy /> Component on Landing Home Page
 */
function initHeroGalaxy() {
  const galaxyContainer = document.getElementById('hero-galaxy-container');
  if (!galaxyContainer || typeof window.createGalaxy !== 'function') return;

  const galaxy = window.createGalaxy(galaxyContainer, {
    density: 1,
    glowIntensity: 0.25,
    flareIntensity: 0.7,
    starSpeed: 0.4,
    mouseRepulsion: true,
    clickWarp: true,
    starColors: ['#3E2718', '#6F4E37', '#8D5B4C', '#A8795A'],
    transparent: true,
    lightMode: true,
    mouseInteraction: true,
    repulsionStrength: 2,
    intro: true,
    twinkleIntensity: 0.25,
    rotationSpeed: 0.06,
    layers: 4,
    backgroundColor: '#FBF8F3'
  });

  window.heroGalaxyInstance = galaxy;

  const warpBtn = document.getElementById('hero-warp-btn');
  if (warpBtn && galaxy) {
    warpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      galaxy.warp();
      showToast('Warp drive engaged!');
    });
  }
}

/**
 * Initialize React Bits <SlingButton /> Component in Footer (Slingshot to Top)
 */
function initFooterSlingButton() {
  const container = document.getElementById('footer-sling-container');
  if (!container || typeof window.createSlingButton !== 'function') return;

  // Add label hint beside the button
  const label = document.createElement('span');
  label.className = 'sling-label-hint';
  label.textContent = 'Launch to top';
  container.appendChild(label);

  window.createSlingButton(container, {
    onSend: () => {
      // Smoothly scroll back to the first landing page
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      showToast('🚀 Slingshot to top engaged!');

      // Trigger warp jump in the Galaxy
      if (window.heroGalaxyInstance && typeof window.heroGalaxyInstance.warp === 'function') {
        window.heroGalaxyInstance.warp();
      }
    },
    padColor: '#3B2A20',
    iconColor: '#FAF7F0',
    accentColor: '#A67C52',
    wellColor: '#F2E7D5',
    bandColor: '#7B5E4A',
    size: 52,
    strokeWidth: 3,
    armAt: 44,
    maxPull: 150,
    launchSpeed: 2600,
    recoil: 0.2,
    flight: 120,
    particles: 14,
    spread: 60,
    axis: 'any',
    tapSends: true,
    ariaLabel: 'Slingshot launch to top'
  });
}

/**
 * Render Hero Section
 */
function renderHero(personal) {
  const availabilityText = document.getElementById('hero-availability-text');
  if (availabilityText) availabilityText.textContent = personal.availability.text;

  const heroTitle = document.getElementById('hero-headline');
  if (heroTitle) {
    heroTitle.innerHTML = `Building <span class="gradient-text">Digital Experiences</span>. Solving Real Problems.`;
  }

  const heroDesc = document.getElementById('hero-description');
  if (heroDesc) heroDesc.textContent = personal.summary;


  // Social Links
  const socialContainer = document.getElementById('hero-social-links');
  if (socialContainer) {
    socialContainer.innerHTML = `
      <a href="${personal.social.github}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="GitHub Profile" title="GitHub">
        <i data-lucide="github"></i>
      </a>
      <a href="${personal.social.linkedin}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="LinkedIn Profile" title="LinkedIn">
        <i data-lucide="linkedin"></i>
      </a>
      <a href="mailto:${personal.email}" class="btn-icon" aria-label="Direct Email" title="Send Email">
        <i data-lucide="mail"></i>
      </a>
    `;
  }
}

/**
 * Render About Section
 */
function renderAbout(about, personal) {
  const bioContainer = document.getElementById('about-bio-container');
  if (bioContainer) {
    bioContainer.innerHTML = about.bio.map(p => `<p class="about-bio-text">${p}</p>`).join('');
  }

  // Profile Card
  const profileAvatar = document.getElementById('about-profile-img');
  if (profileAvatar) {
    profileAvatar.src = personal.avatar;
    profileAvatar.alt = `${personal.name} Profile Photo`;
  }

  const profileName = document.getElementById('about-profile-name');
  if (profileName) profileName.textContent = personal.name;

  const profileRole = document.getElementById('about-profile-role');
  if (profileRole) profileRole.textContent = personal.role;

  const metaChips = document.getElementById('about-meta-chips');
  if (metaChips) {
    metaChips.innerHTML = `
      <div class="profile-meta-row">
        <i data-lucide="map-pin" style="width: 16px; height: 16px; color: var(--accent-silver);"></i>
        <span>${personal.location}</span>
      </div>
      <div class="profile-meta-row">
        <i data-lucide="clock" style="width: 16px; height: 16px; color: var(--accent-silver);"></i>
        <span>${personal.timezone}</span>
      </div>
      <div class="profile-meta-row">
        <i data-lucide="graduation-cap" style="width: 16px; height: 16px; color: var(--accent-silver);"></i>
        <span>${about.education.degree} · ${about.education.focus}</span>
      </div>
    `;
  }

  // Education Box
  const eduContainer = document.getElementById('about-education-container');
  if (eduContainer) {
    eduContainer.innerHTML = `
      <div class="education-box">
        <div class="education-icon-box">
          <i data-lucide="award"></i>
        </div>
        <div>
          <h4 class="education-title">${about.education.degree}</h4>
          <p class="education-inst">${about.education.institution}</p>
          <p class="education-period">${about.education.period} · Focus: ${about.education.focus}</p>
        </div>
      </div>
    `;
  }

  // Areas of Interest
  const interestsContainer = document.getElementById('about-interests-container');
  if (interestsContainer) {
    interestsContainer.innerHTML = about.interests.map(item => `
      <span class="interest-tag">${item}</span>
    `).join('');
  }

  // Highlight Cards (Curiosity, Continuous Learning, Innovation)
  const valuesContainer = document.getElementById('about-values-grid');
  if (valuesContainer) {
    valuesContainer.innerHTML = about.values.map(val => `
      <div class="value-card">
        <div class="value-icon">
          <i data-lucide="${val.icon}"></i>
        </div>
        <h4 class="value-title">${val.title}</h4>
        <p class="value-desc">${val.description}</p>
      </div>
    `).join('');
  }

  initLucideIcons();
}

/**
 * Render Skills & Technologies Section
 */
function renderSkills(skillGroups) {
  const container = document.getElementById('skills-grid-container');
  if (!container) return;

  const categoryIcons = {
    "Programming": "code",
    "Web": "layout",
    "Hardware & electronics": "cpu",
    "Hardware & Electronics": "cpu",
    "Tools": "tool",
    "Domains": "compass",
    "Programming Languages": "code",
    "Web Development": "layout",
    "Frameworks and Libraries": "layers",
    "Databases": "database",
    "Tools and Platforms": "terminal",
    "Core Computer Science Concepts": "cpu"
  };

  container.innerHTML = skillGroups.map((group, idx) => `
    <div class="acrylic-card skill-category-card reveal-init delay-${(idx % 4) + 1}">
      <div class="category-header">
        <div class="category-icon-box">
          <i data-lucide="${categoryIcons[group.category] || 'box'}"></i>
        </div>
        <h3 class="category-name">${group.category}</h3>
      </div>
      <p class="category-description">${group.description}</p>
      <div class="skills-items-container">
        ${group.items.map(skill => `
          <div class="skill-pill" title="${skill.name}${skill.level ? ` (${skill.level})` : ''}">
            <i data-lucide="${skill.icon || 'check'}" style="width: 14px; height: 14px; color: var(--palette-caramel);"></i>
            <span>${skill.name}</span>
            ${skill.level ? `<span class="skill-level-badge">${skill.level}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  initLucideIcons();
}

/**
 * Render Featured Projects Section
 */
function renderProjects(projects) {
  const container = document.getElementById('projects-grid-container');
  if (!container) return;

  const filterBar = document.querySelector('.projects-filter-bar');
  if (filterBar) {
    filterBar.style.display = projects.length > 1 ? 'flex' : 'none';
  }

  if (projects.length === 1) {
    container.classList.add('single-project');
  } else {
    container.classList.remove('single-project');
  }

  renderProjectCards(projects, 'all');

  // Filter Bar Functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderProjectCards(projects, filter);
      initLucideIcons();
    });
  });
}

function renderProjectCards(projects, filterKey) {
  const container = document.getElementById('projects-grid-container');
  if (!container) return;

  const filtered = filterKey === 'all'
    ? projects
    : projects.filter(p => p.categoryKey === filterKey);

  container.innerHTML = filtered.map((project, idx) => `
    <div class="acrylic-card project-card reveal-init delay-${(idx % 3) + 1}" data-id="${project.id}">
      <div class="project-media-wrap">
        <img src="${project.image}" alt="${project.title} Preview" class="project-thumb-img" loading="lazy">
        <div class="project-media-overlay"></div>
        <span class="project-category-badge">${project.category}</span>
      </div>
      <div class="project-body">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-problem-solution">${project.solution}</p>
        
        <div class="project-tags-list">
          ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>

        <ul class="project-features-list">
          ${project.features.slice(0, 2).map(f => `
            <li class="project-feature-item">
              <i data-lucide="check-circle-2" class="feature-check-icon" style="width: 16px; height: 16px;"></i>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>

        <div class="project-card-footer">
          <button class="btn btn-secondary btn-sm quick-view-btn" data-project-id="${project.id}">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
            <span>Architecture & Details</span>
          </button>
          <div class="project-links">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="GitHub Repository" title="View Source Code">
              <i data-lucide="github"></i>
            </a>
            ${project.demoUrl ? `
              <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="Live Demo" title="Launch Live Demo">
                <i data-lucide="external-link"></i>
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Re-attach quick view event listeners
  container.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pid = e.currentTarget.getAttribute('data-project-id');
      openProjectModal(pid);
    });
  });
}

/**
 * Render Milestones & Experience Timeline
 */
function renderMilestones(milestones) {
  const container = document.getElementById('timeline-entries-container');
  if (!container) return;

  const timelineWrapper = container.closest('.timeline-wrapper');
  if (timelineWrapper) {
    const timelineLine = timelineWrapper.querySelector('.timeline-line');
    if (timelineLine) {
      // If there is only one entry, remove the continuous vertical track
      timelineLine.style.display = milestones.length > 1 ? 'block' : 'none';
    }
  }

  // If only 1 milestone, hide filter bar
  const filterBar = document.querySelector('.milestones-filter-bar');
  if (filterBar && milestones.length <= 1) {
    filterBar.style.display = 'none';
  }

  renderTimelineCards(milestones, 'all');

  const filterBtns = document.querySelectorAll('.milestone-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-milestone-filter');
      renderTimelineCards(milestones, filter);
      initLucideIcons();
    });
  });
}

function renderTimelineCards(milestones, filterKey) {
  const container = document.getElementById('timeline-entries-container');
  if (!container) return;

  const filtered = filterKey === 'all'
    ? milestones
    : milestones.filter(m => m.typeKey === filterKey);

  container.innerHTML = filtered.map((entry, idx) => `
    <div class="timeline-entry reveal-init delay-${(idx % 3) + 1} ${entry.isCurrent ? 'timeline-entry-current' : ''}">
      <div class="timeline-marker ${entry.isCurrent ? 'is-present' : ''}" title="${entry.isCurrent ? 'Current Ongoing Education' : ''}">
        <div class="timeline-marker-core"></div>
      </div>
      <div class="acrylic-card timeline-card ${entry.isCurrent ? 'timeline-card-current' : ''}">
        <div class="timeline-meta-bar">
          <div class="timeline-period-group">
            <span class="timeline-period">${entry.period}</span>
            ${entry.isCurrent ? `
              <span class="timeline-present-pill">
                <span class="status-dot"></span>
                <span>Current</span>
              </span>` : ''}
          </div>
          <span class="timeline-type-tag">${entry.type}</span>
        </div>
        <h3 class="timeline-title">${entry.title}</h3>
        <p class="timeline-organization">${entry.organization}</p>
        <p class="timeline-desc">${entry.description}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Render Collaborate / Contact Section
 */
function renderCollaborate(personal, interests) {
  const emailVal = document.getElementById('contact-email-val');
  if (emailVal) {
    emailVal.textContent = personal.email;
    emailVal.href = `mailto:${personal.email}`;
  }

  const linkedinVal = document.getElementById('contact-linkedin-val');
  if (linkedinVal) {
    linkedinVal.href = personal.social.linkedin;
  }

  const githubVal = document.getElementById('contact-github-val');
  if (githubVal) {
    githubVal.href = personal.social.github;
  }

  const locationVal = document.getElementById('contact-location-val');
  if (locationVal) {
    locationVal.textContent = `${personal.location} (${personal.timezone})`;
  }

  // Interests Chips
  const chipsContainer = document.getElementById('interests-chips-container');
  if (chipsContainer) {
    chipsContainer.innerHTML = interests.map(item => `
      <div class="interest-chip" data-interest="${item}">
        <span>${item}</span>
      </div>
    `).join('');

    chipsContainer.querySelectorAll('.interest-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });
  }

  // One-click copy email button
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyToClipboard(personal.email, "Email address copied to clipboard!");
    });
  }
}

/**
 * Render Footer
 */
function renderFooter(personal, footer) {
  const brandName = document.getElementById('footer-brand-name');
  if (brandName) brandName.textContent = personal.name;

  const closingLine = document.getElementById('footer-closing-line');
  if (closingLine) closingLine.textContent = footer.closingLine;

  const copyright = document.getElementById('footer-copyright');
  if (copyright) copyright.textContent = footer.copyright;

  const builtWith = document.getElementById('footer-built-with');
  if (builtWith) builtWith.textContent = footer.builtWith;

  const footerSocials = document.getElementById('footer-social-links');
  if (footerSocials) {
    footerSocials.innerHTML = `
      <a href="${personal.social.github}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="GitHub" title="GitHub">
        <i data-lucide="github"></i>
      </a>
      <a href="${personal.social.linkedin}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="LinkedIn" title="LinkedIn">
        <i data-lucide="linkedin"></i>
      </a>
      ${personal.social.twitter ? `
      <a href="${personal.social.twitter}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="Twitter / X" title="Twitter / X">
        <i data-lucide="twitter"></i>
      </a>` : ''}
      <a href="mailto:${personal.email}" class="btn-icon" aria-label="Email" title="Direct Email">
        <i data-lucide="mail"></i>
      </a>
    `;
  }
}

/**
 * Navigation & ScrollSpy System
 */
function initNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Handle scroll states for floating navigation bar
  const floatingNav = document.getElementById('main-nav-bar');
  
  function handleScroll() {
    const isScrolled = window.scrollY > 30;
    if (floatingNav) {
      floatingNav.classList.toggle('scrolled', isScrolled);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Drawer Menu
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-drawer-close-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    drawer.classList.add('open');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

/**
 * Scroll Reveal Animations (IntersectionObserver)
 */
function initScrollReveals() {
  const elements = document.querySelectorAll('.reveal-init');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/**
 * Project Quick-View Modal Dialog
 */
let allProjectsCache = [];
function initProjectModal(projects) {
  allProjectsCache = projects;
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

function openProjectModal(projectId) {
  const project = allProjectsCache.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-content-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div style="margin-bottom: 1.5rem; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-acrylic);">
      <img src="${project.image}" alt="${project.title}" style="width: 100%; height: auto; display: block;">
    </div>
    <span class="project-category-badge" style="position: static; display: inline-block; margin-bottom: 0.75rem;">${project.category}</span>
    <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem;">${project.title}</h2>
    
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.88rem; text-transform: uppercase; color: var(--accent-silver); margin-bottom: 0.35rem; font-family: var(--font-display);">Problem & Architecture Challenge</h4>
      <p style="font-size: 0.95rem; line-height: 1.65; color: var(--text-secondary);">${project.problemStatement}</p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.88rem; text-transform: uppercase; color: var(--accent-silver); margin-bottom: 0.35rem; font-family: var(--font-display);">Engineered Solution</h4>
      <p style="font-size: 0.95rem; line-height: 1.65; color: var(--text-secondary);">${project.solution}</p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.88rem; text-transform: uppercase; color: var(--accent-silver); margin-bottom: 0.5rem; font-family: var(--font-display);">Key Technical Highlights</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
        ${project.features.map(f => `
          <li style="display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.9rem; color: var(--text-secondary);">
            <i data-lucide="check-circle" style="width: 16px; height: 16px; color: var(--accent-silver); margin-top: 2px;"></i>
            <span>${f}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 2rem;">
      <h4 style="font-size: 0.88rem; text-transform: uppercase; color: var(--accent-silver); margin-bottom: 0.5rem; font-family: var(--font-display);">Tech Stack</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
        ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; border-top: 1px solid var(--border-acrylic); padding-top: 1.5rem;">
      <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <i data-lucide="github"></i>
        <span>Repository</span>
      </a>
      ${project.demoUrl ? `
        <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <i data-lucide="external-link"></i>
          <span>Live Demo</span>
        </a>
      ` : ''}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  initLucideIcons();
}

/**
 * Form Handling & Actual Validation
 */
function initFormHandling(personal) {
  const form = document.getElementById('collaborate-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form || !feedback || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    const subject = form.elements['subject'].value.trim();
    const message = form.elements['message'].value.trim();

    // Collect selected interest chips
    const selectedInterests = Array.from(document.querySelectorAll('.interest-chip.selected'))
      .map(c => c.getAttribute('data-interest'));

    // Validation checks
    if (!name || name.length < 2) {
      showFormFeedback('error', 'Please provide a valid name (at least 2 characters).');
      form.elements['name'].focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showFormFeedback('error', 'Please provide a valid email address.');
      form.elements['email'].focus();
      return;
    }

    if (!subject || subject.length < 3) {
      showFormFeedback('error', 'Please enter a brief subject line.');
      form.elements['subject'].focus();
      return;
    }

    if (!message || message.length < 10) {
      showFormFeedback('error', 'Please write a message with at least 10 characters.');
      form.elements['message'].focus();
      return;
    }

    // Processing animation state
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <i data-lucide="loader" class="spin-icon" style="animation: spin 1s linear infinite;"></i>
      <span>Securing Transmission...</span>
    `;
    initLucideIcons();

    setTimeout(() => {
      // Build mailto fallback url
      const interestsText = selectedInterests.length > 0 ? `[Topics: ${selectedInterests.join(', ')}]` : '';
      const emailBody = encodeURIComponent(
        `Hi Sree Lekshmi,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}\n${interestsText}`
      );
      const mailtoUrl = `mailto:${personal.email}?subject=${encodeURIComponent(subject)}&body=${emailBody}`;

      showFormFeedback(
        'success',
        `Thank you, ${name}! Your inquiry has been prepared. If your mail client does not open automatically, <a href="${mailtoUrl}" style="color: #FFFFFF; text-decoration: underline; font-weight: 600;">click here to dispatch directly to ${personal.email}</a>.`
      );

      // Attempt mailto launch
      window.location.href = mailtoUrl;

      // Reset form
      form.reset();
      document.querySelectorAll('.interest-chip.selected').forEach(c => c.classList.remove('selected'));
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
      initLucideIcons();
      showToast('Message inquiry composed successfully!');
    }, 800);
  });
}

function showFormFeedback(type, message) {
  const feedback = document.getElementById('form-feedback');
  if (!feedback) return;
  feedback.className = `form-feedback ${type}`;
  feedback.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
    <span>${message}</span>
  `;
  feedback.style.display = 'flex';
  initLucideIcons();
}

/**
 * Toast Notification System
 */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i data-lucide="check" style="width: 16px; height: 16px; color: var(--status-available);"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Clipboard Copy Utility
 */
function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy text.');
  }
  document.body.removeChild(textarea);
}

/**
 * Zero-dependency SVG Icon Initializer
 */
function initLucideIcons() {
  if (typeof window.renderAllIcons === 'function') {
    window.renderAllIcons();
  } else if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

