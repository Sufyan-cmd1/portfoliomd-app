/**
 * Sufyan Malik · Graphic Design Portfolio
 * Modern, Minimalist & Responsive Interaction Architecture
 */

// State Management
const state = {
  projects: [],
  filteredProjects: [],
  currentCategory: 'all',
  currentView: 'grid', // 'grid' | 'reel'
  adminToken: sessionStorage.getItem('sm_admin_token') || null,
  activeProjectId: null,
};

// Category Background Images (Cloudinary Assets)
const categoryBgImages = {
  'Logo Design': 'https://res.cloudinary.com/yfcvzvme/image/upload/v1785159539/logo-bg_sb1hif.png',
  'Illustration': 'https://res.cloudinary.com/yfcvzvme/image/upload/v1785159547/illustration-bg_z8rush.png',
  'Mascot': 'https://res.cloudinary.com/yfcvzvme/image/upload/v1785159540/mascot-bg_fcjldp.png',
  'Poster': 'https://res.cloudinary.com/yfcvzvme/image/upload/v1785159536/posters-bg_z9ws7k.png',
  'Post': 'https://res.cloudinary.com/yfcvzvme/image/upload/v1785159537/post-bg_ak1zbt.png',
  'watercolor Logo Design': 'https://res.cloudinary.com/yfcvzvme/image/upload/v1785159544/watercolor-logo-bg_brqt6c.png',
};

// DOM Elements
const DOM = {
  header: document.getElementById('mainHeader'),
  navLinks: document.querySelectorAll('.nav-link'),
  menuToggle: document.getElementById('menuToggle'),
  mobileDrawer: document.getElementById('mobileDrawer'),
  drawerOverlay: document.getElementById('drawerOverlay'),
  drawerClose: document.getElementById('drawerClose'),
  mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),

  portfolioArea: document.getElementById('portfolioDisplayArea'),
  categoryFilters: document.getElementById('categoryFilters'),
  viewGridBtn: document.getElementById('viewGridBtn'),
  viewSlideBtn: document.getElementById('viewSlideBtn'),

  projectModal: document.getElementById('projectModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalImageContainer: document.getElementById('modalImageContainer'),
  modalProjectTitle: document.getElementById('modalProjectTitle'),
  modalCategory: document.getElementById('modalCategory'),
  modalDate: document.getElementById('modalDate'),
  modalDescription: document.getElementById('modalDescription'),
  modalInquireBtn: document.getElementById('modalInquireBtn'),

  contactForm: document.getElementById('contactForm'),
  contactStatus: document.getElementById('contactStatus'),
  contactSubject: document.getElementById('contactSubject'),

  adminToggle: document.getElementById('adminToggle'),
  adminDrawer: document.getElementById('adminDrawer'),
  adminBackdrop: document.getElementById('adminBackdrop'),
  adminCloseBtn: document.getElementById('adminCloseBtn'),
  authStatusText: document.getElementById('authStatusText'),
  authDot: document.getElementById('authDot'),
  authActionBtn: document.getElementById('authActionBtn'),
  projectForm: document.getElementById('projectForm'),
  formId: document.getElementById('formId'),
  formTitle: document.getElementById('formProjectTitle'),
  formCategory: document.getElementById('formCategory'),
  formDescription: document.getElementById('formDescription'),
  formImage: document.getElementById('formImage'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  adminList: document.getElementById('adminList'),
  adminProjectsCount: document.getElementById('adminProjectsCount'),
  refreshProjectsBtn: document.getElementById('refreshProjectsBtn'),

  toastContainer: document.getElementById('toastContainer'),
};

// ── Application Initialization ──
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initHeader();
  initMobileDrawer();
  initPortfolioControls();
  initModal();
  initContactForm();
  initAdmin();
  initCopyButtons();
  initStatCounters();
  loadProjects();
});

// ── Motion & Scroll Animations ──
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// ── Header Scroll Behavior & Active Link Spy ──
function initHeader() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      DOM.header?.classList.add('scrolled');
    } else {
      DOM.header?.classList.remove('scrolled');
    }
    updateActiveNav();
  }, { passive: true });
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 140;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPosition >= top && scrollPosition < top + height) {
      DOM.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

// ── Mobile Drawer Navigation ──
function initMobileDrawer() {
  function openDrawer() {
    DOM.mobileDrawer.classList.add('active');
    DOM.mobileDrawer.setAttribute('aria-hidden', 'false');
    DOM.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    DOM.mobileDrawer.classList.remove('active');
    DOM.mobileDrawer.setAttribute('aria-hidden', 'true');
    DOM.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  DOM.menuToggle?.addEventListener('click', openDrawer);
  DOM.drawerClose?.addEventListener('click', closeDrawer);
  DOM.drawerOverlay?.addEventListener('click', closeDrawer);

  DOM.mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

// ── Stat Number Counter Animation ──
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        if (target) {
          animateCount(el, target);
        }
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

function animateCount(element, target) {
  let current = 0;
  const step = Math.ceil(target / 20);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = `${target}+`;
      clearInterval(timer);
    } else {
      element.textContent = current;
    }
  }, 40);
}

// ── Portfolio Data Loading & API Fallback ──
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        state.projects = data;
        applyFilterAndRender();
        if (state.adminToken) renderAdminList();
        return;
      }
    }
  } catch (err) {
    console.warn('Backend API connection notice, loading static projects:', err.message);
  }

  // Graceful fallback to static JSON data for Netlify or offline preview
  try {
    const fallbackRes = await fetch('/data/projects.json');
    if (fallbackRes.ok) {
      state.projects = await fallbackRes.json();
    } else {
      state.projects = [];
    }
  } catch (e) {
    state.projects = [];
  }

  applyFilterAndRender();
  if (state.adminToken) renderAdminList();
}

// ── Portfolio Filtering & Layout Controls ──
function initPortfolioControls() {
  DOM.categoryFilters?.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    DOM.categoryFilters.querySelectorAll('.filter-chip').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-selected', 'false');
    });

    chip.classList.add('active');
    chip.setAttribute('aria-selected', 'true');
    state.currentCategory = chip.dataset.filter;
    applyFilterAndRender();
  });

  DOM.viewGridBtn?.addEventListener('click', () => {
    state.currentView = 'grid';
    DOM.viewGridBtn.classList.add('active');
    DOM.viewSlideBtn?.classList.remove('active');
    renderProjects();
  });

  DOM.viewSlideBtn?.addEventListener('click', () => {
    state.currentView = 'reel';
    DOM.viewSlideBtn.classList.add('active');
    DOM.viewGridBtn?.classList.remove('active');
    renderProjects();
  });
}

function applyFilterAndRender() {
  if (state.currentCategory === 'all') {
    state.filteredProjects = [...state.projects];
  } else {
    state.filteredProjects = state.projects.filter(p => p.category === state.currentCategory);
  }
  renderProjects();
}

function renderProjects() {
  if (!DOM.portfolioArea) return;

  if (!state.filteredProjects.length) {
    DOM.portfolioArea.innerHTML = `
      <div class="portfolio-empty">
        <i class="fas fa-layer-group" style="font-size:2.5rem;color:var(--color-sand);margin-bottom:1rem;display:block;"></i>
        <h3 style="font-family:var(--font-serif);margin-bottom:0.5rem;">No projects in this category yet</h3>
        <p>Select another filter or add new pieces via the admin panel.</p>
      </div>
    `;
    return;
  }

  const cardsHtml = state.filteredProjects.map((p, idx) => {
    const imageUrl = p.image || categoryBgImages[p.category] || '';
    const imgElement = imageUrl
      ? `<img src="${imageUrl}" alt="${p.title}" loading="lazy" />`
      : `<div class="project-card__placeholder"><i class="fas fa-palette"></i><span>Custom Artwork</span></div>`;

    return `
      <article class="project-card" data-id="${p._id}" tabindex="0" role="button" aria-label="View details for ${p.title}">
        <div class="project-card__visual">
          ${imgElement}
          <span class="project-card__badge-overlay">${p.category}</span>
          <div class="project-card__action-hint" title="Expand Details">
            <i class="fas fa-expand-alt"></i>
          </div>
        </div>
        <div class="project-card__body">
          <div class="project-card__meta">
            <span>${p.category}</span>
            <span>${p.createdAt ? p.createdAt.slice(0, 4) : '2026'}</span>
          </div>
          <h3 class="project-card__title">${escapeHtml(p.title)}</h3>
          <p class="project-card__desc">${escapeHtml(p.description || '')}</p>
        </div>
      </article>
    `;
  }).join('');

  if (state.currentView === 'reel') {
    DOM.portfolioArea.innerHTML = `
      <div class="portfolio-reel-wrapper">
        <div class="portfolio-reel" id="portfolioReel">
          ${cardsHtml}
        </div>
      </div>
    `;
  } else {
    DOM.portfolioArea.innerHTML = `
      <div class="portfolio-grid">
        ${cardsHtml}
      </div>
    `;
  }

  // Attach click & enter key handlers to cards
  DOM.portfolioArea.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProjectModal(card.dataset.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectModal(card.dataset.id);
      }
    });
  });
}

// ── Project Detail Modal (<dialog>) ──
function initModal() {
  DOM.modalCloseBtn?.addEventListener('click', closeProjectModal);

  DOM.projectModal?.addEventListener('click', (e) => {
    const rect = DOM.projectModal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeProjectModal();
    }
  });

  DOM.modalInquireBtn?.addEventListener('click', () => {
    closeProjectModal();
    if (DOM.contactSubject && state.activeProjectId) {
      const proj = state.projects.find(p => p._id === state.activeProjectId);
      if (proj && proj.category) {
        if (proj.category.toLowerCase().includes('watercolor')) {
          DOM.contactSubject.value = 'Watercolor Logo Design';
        } else if (proj.category.toLowerCase().includes('mascot')) {
          DOM.contactSubject.value = 'Mascot / Character Art';
        } else if (proj.category.toLowerCase().includes('poster')) {
          DOM.contactSubject.value = 'Illustration & Posters';
        } else {
          DOM.contactSubject.value = 'Logo & Brand Identity';
        }
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.projectModal?.open) {
      closeProjectModal();
    }
  });
}

function openProjectModal(id) {
  const project = state.projects.find(p => p._id === id);
  if (!project) return;

  state.activeProjectId = id;
  const imageUrl = project.image || categoryBgImages[project.category] || '';

  if (DOM.modalImageContainer) {
    DOM.modalImageContainer.innerHTML = imageUrl
      ? `<img src="${imageUrl}" alt="${project.title}" />`
      : `<div class="project-card__placeholder" style="aspect-ratio:4/3;border-radius:12px;"><i class="fas fa-palette"></i></div>`;
  }

  if (DOM.modalProjectTitle) DOM.modalProjectTitle.textContent = project.title;
  if (DOM.modalCategory) DOM.modalCategory.textContent = project.category;
  if (DOM.modalDate) DOM.modalDate.textContent = project.createdAt ? project.createdAt.slice(0, 7) : '2026';
  if (DOM.modalDescription) DOM.modalDescription.textContent = project.description || 'Custom brand identity project crafted with precision.';

  if (typeof DOM.projectModal.showModal === 'function') {
    DOM.projectModal.showModal();
  } else {
    DOM.projectModal.setAttribute('open', '');
  }
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  if (typeof DOM.projectModal.close === 'function') {
    DOM.projectModal.close();
  } else {
    DOM.projectModal.removeAttribute('open');
  }
  document.body.style.overflow = '';
  state.activeProjectId = null;
}

// ── Contact Form (Netlify Forms & API Hybrid) ──
function initContactForm() {
  if (!DOM.contactForm) return;

  DOM.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

    const formData = new FormData(DOM.contactForm);
    const formProps = Object.fromEntries(formData);

    if (!formProps.name || !formProps.email || !formProps.message) {
      setFormStatus('Please complete all required fields.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>`;
    }

    let success = false;
    let feedbackMessage = 'Thank you! Your message has been sent successfully.';

    // Try Express/Netlify Function endpoint first
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formProps),
      });

      if (res.ok) {
        const data = await res.json();
        success = true;
        feedbackMessage = data.message || feedbackMessage;
      }
    } catch (apiErr) {
      console.log('Direct API send not available, submitting to Netlify Static Forms...');
    }

    // If API wasn't reachable or on static Netlify, submit via URL-encoded form data
    if (!success) {
      try {
        const urlParams = new URLSearchParams(formData).toString();
        const netlifyRes = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: urlParams,
        });

        if (netlifyRes.ok) {
          success = true;
          feedbackMessage = 'Thank you! Your inquiry was received. I will be in touch shortly.';
        }
      } catch (netErr) {
        console.error('Netlify form submission notice:', netErr);
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }

    if (success) {
      setFormStatus(`✅ ${feedbackMessage}`, 'success');
      DOM.contactForm.reset();
      showToast('Message sent successfully!', 'success');
    } else {
      setFormStatus('❌ Unable to send automatically right now. Please email directly at sufyanmalik7998@gmail.com', 'error');
    }
  });
}

function setFormStatus(message, type) {
  if (!DOM.contactStatus) return;
  DOM.contactStatus.textContent = message;
  DOM.contactStatus.className = `form-status ${type}`;
}

// ── Admin Panel & Authentication ──
function initAdmin() {
  updateAuthUI();

  DOM.adminToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    openAdminDrawer();
  });

  DOM.adminCloseBtn?.addEventListener('click', closeAdminDrawer);
  DOM.adminBackdrop?.addEventListener('click', closeAdminDrawer);

  DOM.authActionBtn?.addEventListener('click', handleAuthAction);
  DOM.refreshProjectsBtn?.addEventListener('click', () => {
    loadProjects();
    showToast('Refreshed projects');
  });

  // Project Form Submit (Create / Update)
  DOM.projectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.adminToken) {
      showToast('Please login as admin first', 'error');
      return;
    }

    const id = DOM.formId.value;
    const fd = new FormData();
    fd.append('title', DOM.formTitle.value);
    fd.append('category', DOM.formCategory.value);
    fd.append('description', DOM.formDescription.value);
    if (DOM.formImage.files[0]) {
      fd.append('image', DOM.formImage.files[0]);
    }

    const url = id ? `/api/projects/${id}` : '/api/projects';
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'x-admin-token': state.adminToken },
        body: fd,
      });

      if (res.ok) {
        showToast(id ? 'Project updated!' : 'Project created!', 'success');
        resetAdminForm();
        await loadProjects();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Network error while saving project', 'error');
    }
  });

  DOM.cancelEditBtn?.addEventListener('click', resetAdminForm);
}

function openAdminDrawer() {
  DOM.adminDrawer?.classList.add('active');
  DOM.adminDrawer?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!state.adminToken) {
    promptAdminLogin();
  }
}

function closeAdminDrawer() {
  DOM.adminDrawer?.classList.remove('active');
  DOM.adminDrawer?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function promptAdminLogin() {
  const password = prompt('Enter studio admin password:');
  if (!password) return;

  fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.token) {
        state.adminToken = data.token;
        sessionStorage.setItem('sm_admin_token', data.token);
        updateAuthUI();
        renderAdminList();
        showToast('Logged in as administrator', 'success');
      } else {
        showToast('Invalid password', 'error');
      }
    })
    .catch(() => {
      showToast('Login verification failed', 'error');
    });
}

function handleAuthAction() {
  if (state.adminToken) {
    state.adminToken = null;
    sessionStorage.removeItem('sm_admin_token');
    updateAuthUI();
    renderAdminList();
    showToast('Logged out');
  } else {
    promptAdminLogin();
  }
}

function updateAuthUI() {
  const isAuth = !!state.adminToken;
  if (DOM.authStatusText) {
    DOM.authStatusText.textContent = isAuth ? 'Administrator Authenticated' : 'Not Authenticated';
  }
  if (DOM.authDot) {
    DOM.authDot.classList.toggle('authenticated', isAuth);
  }
  if (DOM.authActionBtn) {
    DOM.authActionBtn.textContent = isAuth ? 'Logout' : 'Login';
  }
}

function renderAdminList() {
  if (!DOM.adminList) return;

  if (DOM.adminProjectsCount) {
    DOM.adminProjectsCount.textContent = state.projects.length;
  }

  if (!state.adminToken) {
    DOM.adminList.innerHTML = `<p style="color:var(--color-text-muted);font-size:0.85rem;text-align:center;padding:1.5rem 0;">🔒 Log in to view and manage live database items.</p>`;
    return;
  }

  if (!state.projects.length) {
    DOM.adminList.innerHTML = `<p style="color:var(--color-text-muted);font-size:0.85rem;text-align:center;padding:1.5rem 0;">No projects currently registered.</p>`;
    return;
  }

  DOM.adminList.innerHTML = state.projects.map(p => `
    <div class="admin-item-row" data-id="${p._id}">
      <div class="admin-item-meta">
        <span class="admin-item-title">${escapeHtml(p.title)}</span>
        <span class="admin-item-cat">${escapeHtml(p.category)}</span>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="admin-btn admin-btn--edit" data-edit="${p._id}" title="Edit Project">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button type="button" class="admin-btn admin-btn--delete" data-delete="${p._id}" title="Delete Project">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `).join('');

  DOM.adminList.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editAdminProject(btn.dataset.edit));
  });

  DOM.adminList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteAdminProject(btn.dataset.delete));
  });
}

function editAdminProject(id) {
  const p = state.projects.find(item => item._id === id);
  if (!p) return;

  DOM.formId.value = id;
  DOM.formTitle.value = p.title;
  DOM.formCategory.value = p.category;
  DOM.formDescription.value = p.description || '';
  DOM.formImage.value = '';

  const header = document.getElementById('adminFormHeader');
  if (header) header.textContent = 'Edit Project Piece';
  if (DOM.cancelEditBtn) DOM.cancelEditBtn.style.display = 'inline-flex';

  DOM.projectForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteAdminProject(id) {
  if (!state.adminToken) return;
  if (!confirm('Are you certain you want to delete this project?')) return;

  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': state.adminToken },
    });

    if (res.ok) {
      showToast('Project deleted', 'success');
      await loadProjects();
    } else {
      showToast('Error deleting project', 'error');
    }
  } catch (err) {
    showToast('Network error during deletion', 'error');
  }
}

function resetAdminForm() {
  DOM.projectForm?.reset();
  DOM.formId.value = '';
  const header = document.getElementById('adminFormHeader');
  if (header) header.textContent = 'Add New Portfolio Project';
  if (DOM.cancelEditBtn) DOM.cancelEditBtn.style.display = 'none';
}

// ── Copy-to-Clipboard Helper ──
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const originalIcon = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check" style="color:var(--color-sand)"></i>`;
        showToast(`Copied to clipboard: ${text}`, 'success');
        setTimeout(() => { btn.innerHTML = originalIcon; }, 2000);
      } catch (e) {
        showToast('Clipboard access unavailable', 'error');
      }
    });
  });
}

// ── Toast Notification System ──
function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${escapeHtml(message)}</span>`;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ── XSS Sanitizer Helper ──
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
