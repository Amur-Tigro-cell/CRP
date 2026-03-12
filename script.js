const STORAGE_KEYS = {
    theme: 'theme',
    fontSize: 'crp_font_size',
    lastVisit: 'crp_last_visit',
    formDraft: 'crp_form_draft',
    solution: 'crp_selected_solution',
};

const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const hamburger = document.getElementById('hamburger');
const navBackdrop = document.getElementById('navBackdrop');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const fontSizeToggle = document.getElementById('fontSizeToggle');
const fontSizeLabel = document.getElementById('fontSizeLabel');

function safeStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures silently.
    }
}

function safeStorageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage failures silently.
    }
}

// Page loader
(function initLoader() {
    const overlay = document.getElementById('loaderOverlay');
    document.body.classList.add('loading');

    function hideLoader() {
        if (!overlay) return;
        overlay.classList.add('loader-hidden');
        document.body.classList.remove('loading');
    }

    if (document.readyState === 'complete') {
        setTimeout(hideLoader, 260);
    } else {
        window.addEventListener('load', () => setTimeout(hideLoader, 360), { once: true });
    }

    setTimeout(hideLoader, 5000);
})();

// Theme toggle
function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

updateThemeIcon(document.documentElement.getAttribute('data-theme') || 'light');

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    safeStorageSet(STORAGE_KEYS.theme, nextTheme);
    updateThemeIcon(nextTheme);
});

// Font size preference
(function initFontSizePreference() {
    if (!fontSizeToggle || !fontSizeLabel) return;

    const sizes = ['normal', 'large', 'x-large'];
    const labels = { normal: 'A', large: 'A+', 'x-large': 'A++' };
    let currentSize = safeStorageGet(STORAGE_KEYS.fontSize) || 'normal';

    function applyFontSize(size) {
        document.documentElement.setAttribute('data-font-size', size);
        fontSizeLabel.textContent = labels[size];
        fontSizeToggle.title = `Text size: ${labels[size]}`;
        safeStorageSet(STORAGE_KEYS.fontSize, size);
        currentSize = size;
    }

    applyFontSize(currentSize);

    fontSizeToggle.addEventListener('click', () => {
        const nextSize = sizes[(sizes.indexOf(currentSize) + 1) % sizes.length];
        applyFontSize(nextSize);
    });
})();

// Welcome back toast
(function initWelcomeToast() {
    const toast = document.getElementById('wbToast');
    const title = document.getElementById('wbTitle');
    const sub = document.getElementById('wbSub');
    const close = document.getElementById('wbToastClose');
    if (!toast || !title || !sub || !close) return;

    function formatAgo(diffMs) {
        const seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
        const months = Math.floor(days / 30);
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    function hideToast() {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            toast.hidden = true;
            toast.classList.remove('toast-hiding');
        }, 320);
    }

    const now = Date.now();
    const previousVisit = safeStorageGet(STORAGE_KEYS.lastVisit);
    safeStorageSet(STORAGE_KEYS.lastVisit, String(now));

    if (previousVisit) {
        const diff = now - Number(previousVisit);
        if (diff > 5 * 60 * 1000) {
            title.textContent = 'Welcome back';
            sub.textContent = `Your last visit was ${formatAgo(diff)}.`;
            toast.hidden = false;
            setTimeout(hideToast, 6000);
        }
    }

    close.addEventListener('click', hideToast);
})();

// Mobile navigation
function closeMobileMenu() {
    navMenu?.classList.remove('active');
    hamburger?.classList.remove('active');
    navbar?.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    hamburger?.setAttribute('aria-expanded', 'false');
}

hamburger?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('active');
    hamburger.classList.toggle('active', open);
    navbar.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
});

navBackdrop?.addEventListener('click', closeMobileMenu);
navLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
        closeMobileMenu();
    }
});

// Sticky nav state and active section tracking
const sections = Array.from(document.querySelectorAll('main section[id]'));

function updateNavState() {
    const currentScroll = window.pageYOffset;
    navbar?.classList.toggle('scrolled', currentScroll > 24);

    let currentSection = 'home';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 140) {
            currentSection = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
    });
}

window.addEventListener('scroll', updateNavState);
window.addEventListener('load', updateNavState);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        const offsetTop = target.offsetTop - 90;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
});

// Ripple buttons
document.querySelectorAll('.ripple-btn').forEach(button => {
    button.addEventListener('click', event => {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);

        ripple.className = 'ripple';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
});

// Subtle premium motion for the hero dashboard
(function initHeroTilt() {
    const visual = document.querySelector('.hero-visual');
    const dashboard = document.querySelector('.hero-dashboard');
    if (!visual || !dashboard) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frameId = 0;

    function setTilt(clientX, clientY) {
        const rect = visual.getBoundingClientRect();
        const offsetX = (clientX - rect.left) / rect.width - 0.5;
        const offsetY = (clientY - rect.top) / rect.height - 0.5;
        const tiltY = `${offsetX * 7}deg`;
        const tiltX = `${offsetY * -7}deg`;
        dashboard.style.setProperty('--tilt-x', tiltX);
        dashboard.style.setProperty('--tilt-y', tiltY);
    }

    visual.addEventListener('pointermove', event => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => setTilt(event.clientX, event.clientY));
    });

    visual.addEventListener('pointerleave', () => {
        dashboard.style.setProperty('--tilt-x', '0deg');
        dashboard.style.setProperty('--tilt-y', '0deg');
    });
})();

// Interactive solution tabs with localStorage persistence
(function initSolutionTabs() {
    const tabs = Array.from(document.querySelectorAll('.solution-tab'));
    const panels = Array.from(document.querySelectorAll('[data-solution-panel]'));
    if (!tabs.length || !panels.length) return;

    const initialSolution = safeStorageGet(STORAGE_KEYS.solution) || tabs[0].dataset.solution;

    function activateSolution(solution) {
        tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.solution === solution));
        panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.solutionPanel === solution));
        safeStorageSet(STORAGE_KEYS.solution, solution);
    }

    activateSolution(initialSolution);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateSolution(tab.dataset.solution));
    });
})();

// Counter animation
(function initCounters() {
    const counters = Array.from(document.querySelectorAll('.counter'));
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            const target = Number(element.dataset.target || 0);
            const duration = 1600;
            const start = performance.now();

            function updateCounter(now) {
                const progress = Math.min((now - start) / duration, 1);
                const value = Math.floor(progress * target);
                element.textContent = value.toLocaleString();
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target.toLocaleString();
                }
            }

            requestAnimationFrame(updateCounter);
            observer.unobserve(element);
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
})();

// Contact form draft autosave
(function initFormDraft() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = ['cf-name', 'cf-email', 'cf-subject', 'cf-message'];

    function showDraftBadge() {
        const header = form.closest('.cta-form-panel')?.querySelector('.contact-form-header');
        if (!header || header.querySelector('.form-draft-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'form-draft-badge';
        badge.innerHTML = '<i class="fas fa-floppy-disk"></i> Draft restored';
        header.appendChild(badge);
        setTimeout(() => { badge.style.transition = 'opacity 0.5s ease'; badge.style.opacity = '0'; }, 4500);
        setTimeout(() => badge.remove(), 5200);
    }

    const savedDraft = safeStorageGet(STORAGE_KEYS.formDraft);
    if (savedDraft) {
        try {
            const parsed = JSON.parse(savedDraft);
            let restored = false;
            fields.forEach(id => {
                const field = document.getElementById(id);
                if (field && parsed[id]) {
                    field.value = parsed[id];
                    restored = true;
                }
            });

            const message = document.getElementById('cf-message');
            const count = document.getElementById('charCount');
            if (message && count) count.textContent = `${message.value.length} / 1000`;
            if (restored) showDraftBadge();
        } catch {
            safeStorageRemove(STORAGE_KEYS.formDraft);
        }
    }

    let saveTimer;
    fields.forEach(id => {
        const field = document.getElementById(id);
        field?.addEventListener('input', () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const draft = {};
                fields.forEach(fieldId => {
                    const current = document.getElementById(fieldId);
                    draft[fieldId] = current ? current.value : '';
                });

                const hasContent = Object.values(draft).some(value => value.trim() !== '');
                if (hasContent) {
                    safeStorageSet(STORAGE_KEYS.formDraft, JSON.stringify(draft));
                } else {
                    safeStorageRemove(STORAGE_KEYS.formDraft);
                }
            }, 450);
        });
    });
})();

// Contact form validation
(function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        name: { el: document.getElementById('cf-name'), err: document.getElementById('err-name'), group: document.getElementById('fg-name') },
        email: { el: document.getElementById('cf-email'), err: document.getElementById('err-email'), group: document.getElementById('fg-email') },
        subject: { el: document.getElementById('cf-subject'), err: document.getElementById('err-subject'), group: document.getElementById('fg-subject') },
        message: { el: document.getElementById('cf-message'), err: document.getElementById('err-message'), group: document.getElementById('fg-message') },
    };

    const submitButton = document.getElementById('submitBtn');
    const submitText = submitButton?.querySelector('.btn-submit-text');
    const submitLoading = submitButton?.querySelector('.btn-submit-loading');
    const successBox = document.getElementById('formSuccess');
    const charCount = document.getElementById('charCount');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validateField(key) {
        const { el, err, group } = fields[key];
        if (!el || !err || !group) return true;
        const value = el.value.trim();
        let message = '';

        if (key === 'name') {
            if (!value) message = 'Full name is required.';
            else if (value.length < 2) message = 'Name must be at least 2 characters.';
            else if (/\d/.test(value)) message = 'Name should not contain numbers.';
        }

        if (key === 'email') {
            if (!value) message = 'Email address is required.';
            else if (!emailPattern.test(value)) message = 'Please enter a valid email address.';
        }

        if (key === 'subject') {
            if (!value) message = 'Subject is required.';
            else if (value.length < 3) message = 'Subject must be at least 3 characters.';
        }

        if (key === 'message') {
            if (!value) message = 'Message is required.';
            else if (value.length < 20) message = `Message is too short (${value.length}/20 characters minimum).`;
        }

        err.textContent = message;
        group.classList.toggle('error', Boolean(message));
        group.classList.toggle('valid', !message && value !== '');
        return !message;
    }

    Object.entries(fields).forEach(([key, { el, group }]) => {
        el?.addEventListener('blur', () => validateField(key));
        el?.addEventListener('input', () => {
            if (group?.classList.contains('error') || group?.classList.contains('valid')) {
                validateField(key);
            }
        });
    });

    fields.message.el?.addEventListener('input', () => {
        const length = fields.message.el.value.length;
        if (charCount) {
            charCount.textContent = `${length} / 1000`;
            charCount.classList.toggle('near-limit', length >= 800 && length < 1000);
            charCount.classList.toggle('at-limit', length >= 1000);
        }
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        const allValid = Object.keys(fields).map(validateField).every(Boolean);
        if (!allValid) {
            const firstInvalid = form.querySelector('.form-group.error input, .form-group.error textarea');
            firstInvalid?.focus();
            return;
        }

        submitButton.disabled = true;
        submitText.hidden = true;
        submitLoading.hidden = false;

        setTimeout(() => {
            submitButton.disabled = false;
            submitText.hidden = false;
            submitLoading.hidden = true;
            successBox.hidden = false;
            form.reset();
            if (charCount) charCount.textContent = '0 / 1000';
            Object.values(fields).forEach(({ group, err }) => {
                group.classList.remove('error', 'valid');
                err.textContent = '';
            });
            safeStorageRemove(STORAGE_KEYS.formDraft);
            successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1000);
    });
})();

// Initialize AOS
if (window.AOS) {
    AOS.init({
        duration: 700,
        easing: 'ease-out-quart',
        once: true,
        offset: 80,
    });
}