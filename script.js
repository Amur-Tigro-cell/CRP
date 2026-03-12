// Page Loader
(function () {
    const overlay = document.getElementById('loaderOverlay');
    // Block scroll until loaded
    document.body.classList.add('loading');

    function hideLoader() {
        overlay.classList.add('loader-hidden');
        document.body.classList.remove('loading');
    }

    if (document.readyState === 'complete') {
        // Page was already loaded (e.g. bfcache restore)
        setTimeout(hideLoader, 300);
    } else {
        window.addEventListener('load', () => setTimeout(hideLoader, 350));
    }

    // Safety net: never block the page for more than 5 seconds
    setTimeout(hideLoader, 5000);
})();

// Live Search
(function () {
    const input = document.getElementById('liveSearch');
    const clearBtn = document.getElementById('searchClear');
    const countBadge = document.getElementById('searchResultsCount');

    // Groups: each defines which cards to filter and how to extract searchable text
    const groups = [
        {
            selector: '.service-card',
            container: '.services-grid',
            getText: card => [card.querySelector('h3'), card.querySelector('p')],
        },
        {
            selector: '.facility-item',
            container: '.facilities-content',
            getText: card => [card.querySelector('h4')],
        },
        {
            selector: '.plan-card',
            container: '.plans-grid',
            getText: card => [card.querySelector('h3'), card.querySelector('p')],
        },
        {
            selector: '.feature-item',
            container: '.features-grid',
            getText: card => [card.querySelector('h4'), card.querySelector('p')],
        },
    ].map(group => {
        const container = document.querySelector(group.container);
        if (!container) return null;

        // Inject a no-results message element after each grid
        const noMsg = document.createElement('p');
        noMsg.className = 'search-no-results';
        noMsg.innerHTML = '<i class="fas fa-search"></i>No matching results in this section.';
        noMsg.hidden = true;
        container.after(noMsg);

        return {
            cards: Array.from(document.querySelectorAll(group.selector)),
            noMsg,
            getText: group.getText,
        };
    }).filter(Boolean);

    // Escape regex special chars for safe use in RegExp
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Wrap matching text nodes with a highlight span
    function highlightNode(el, regex) {
        if (!el) return;
        const original = el.getAttribute('data-original') || el.textContent;
        el.setAttribute('data-original', original);
        el.innerHTML = original.replace(regex, match => `<mark class="search-highlight">${match}</mark>`);
    }

    function clearHighlight(el) {
        if (!el) return;
        const original = el.getAttribute('data-original');
        if (original !== null) {
            el.textContent = original;
            el.removeAttribute('data-original');
        }
    }

    function doSearch(query) {
        const q = query.trim();
        const regex = q ? new RegExp(`(${escapeRegex(q)})`, 'gi') : null;
        let totalVisible = 0;

        groups.forEach(({ cards, noMsg, getText }) => {
            let groupVisible = 0;

            cards.forEach(card => {
                const textEls = getText(card);
                const fullText = textEls.map(el => el ? el.textContent : '').join(' ').toLowerCase();
                const matches = !q || fullText.includes(q.toLowerCase());

                card.classList.toggle('search-hidden', !matches);

                // Highlight / clear
                textEls.forEach(el => {
                    if (matches && regex) {
                        highlightNode(el, regex);
                    } else {
                        clearHighlight(el);
                    }
                });

                if (matches) groupVisible++;
            });

            totalVisible += groupVisible;
            noMsg.hidden = !q || groupVisible > 0;
        });

        clearBtn.hidden = !q;
        if (q) {
            countBadge.textContent = `${totalVisible} result${totalVisible !== 1 ? 's' : ''} found`;
            countBadge.hidden = false;
            // Scroll to the search bar so filtered results are in view
            if (totalVisible > 0) {
                document.getElementById('searchSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            countBadge.hidden = true;
        }
    }

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => doSearch(input.value), 180);
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        doSearch('');
        input.focus();
    });

    // Allow Escape key to clear
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            input.value = '';
            doSearch('');
        }
    });
})();

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Sync icon with the theme already applied by the inline script
updateThemeIcon(document.documentElement.getAttribute('data-theme') || 'light');

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');
const navLinksArray = Array.from(navLinks);

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksArray.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Only prevent default for internal links
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            
            const target = document.querySelector(href);
            const offsetTop = target.offsetTop - 80;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Gallery lightbox effect (simple version)
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="${img.src}" alt="${img.alt}">
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Add styles
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const close = lightbox.querySelector('.lightbox-close');
        close.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            font-size: 40px;
            color: white;
            cursor: pointer;
            transition: color 0.3s ease;
        `;
        
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.style.cssText = `
            max-width: 100%;
            max-height: 90vh;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        // Close lightbox
        const closeLightbox = () => {
            lightbox.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                lightbox.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        };
        
        close.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    });
});

// Add CSS animation for lightbox
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Counter animation for stats
const stats = document.querySelectorAll('.stat h3');

const animateCounter = (element, target) => {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toString() + (element.textContent.includes('+') ? '+' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
};

// Trigger counter animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            stats.forEach(stat => {
                const text = stat.textContent;
                const hasPlus = text.includes('+');
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                stat.textContent = '0';
                
                setTimeout(() => {
                    animateCounter(stat, number);
                }, 500);
            });
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const hero = document.querySelector('.hero');
if (hero) {
    heroObserver.observe(hero);
}

// Scroll to top button (optional)
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Initialize AOS
AOS.init({
    duration: 650,
    easing: 'ease-out-quart',
    once: true,
    offset: 60,
});

// Contact Form Validation
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        name:    { el: document.getElementById('cf-name'),    err: document.getElementById('err-name'),    fg: document.getElementById('fg-name') },
        email:   { el: document.getElementById('cf-email'),   err: document.getElementById('err-email'),   fg: document.getElementById('fg-email') },
        subject: { el: document.getElementById('cf-subject'), err: document.getElementById('err-subject'), fg: document.getElementById('fg-subject') },
        message: { el: document.getElementById('cf-message'), err: document.getElementById('err-message'), fg: document.getElementById('fg-message') },
    };
    const charCount  = document.getElementById('charCount');
    const submitBtn  = document.getElementById('submitBtn');
    const btnText    = submitBtn.querySelector('.btn-submit-text');
    const btnLoading = submitBtn.querySelector('.btn-submit-loading');
    const formSuccess = document.getElementById('formSuccess');

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const rules = {
        name(v)    { if (!v) return 'Full name is required.'; if (v.length < 2) return 'Name must be at least 2 characters.'; if (/\d/.test(v)) return 'Name should not contain numbers.'; return ''; },
        email(v)   { if (!v) return 'Email address is required.'; if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.'; return ''; },
        subject(v) { if (!v) return 'Subject is required.'; if (v.length < 3) return 'Subject must be at least 3 characters.'; return ''; },
        message(v) { if (!v) return 'Message is required.'; if (v.length < 20) return `Message is too short (${v.length}/20 characters minimum).`; return ''; },
    };

    function validate(key) {
        const { el, err, fg } = fields[key];
        const msg = rules[key](el.value.trim());

        err.textContent = msg;
        fg.classList.toggle('error', !!msg);
        fg.classList.toggle('valid', !msg && el.value.trim() !== '');

        return !msg;
    }

    // Blur: validate on leaving a field (don't mark clean fields as errors before touch)
    Object.keys(fields).forEach(key => {
        const { el } = fields[key];
        el.addEventListener('blur', () => validate(key));
        // Live re-validate once the field has been touched
        el.addEventListener('input',  () => { if (fields[key].fg.classList.contains('error') || fields[key].fg.classList.contains('valid')) validate(key); });
    });

    // Character counter for message
    fields.message.el.addEventListener('input', () => {
        const len = fields.message.el.value.length;
        charCount.textContent = `${len} / 1000`;
        charCount.classList.toggle('near-limit', len >= 800 && len < 1000);
        charCount.classList.toggle('at-limit',   len >= 1000);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields on submit
        const allValid = Object.keys(fields).map(k => validate(k)).every(Boolean);
        if (!allValid) {
            // Scroll to first error
            const firstErr = form.querySelector('.form-group.error input, .form-group.error textarea');
            if (firstErr) firstErr.focus();
            return;
        }

        // Simulate async send
        submitBtn.disabled = true;
        btnText.hidden   = true;
        btnLoading.hidden = false;

        setTimeout(() => {
            submitBtn.disabled = false;
            btnText.hidden   = false;
            btnLoading.hidden = true;
            formSuccess.hidden = false;
            form.reset();
            charCount.textContent = '0 / 1000';
            Object.keys(fields).forEach(k => { fields[k].fg.classList.remove('valid', 'error'); });
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1200);
    });
})();

// Log page load
console.log('CRP Mirpur Website Loaded Successfully');
console.log('Website developed for Centre for the Rehabilitation of the Paralysed - Mirpur, Dhaka');
