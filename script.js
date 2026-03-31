// ===== Source Protection =====
// Disable right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Block keyboard shortcuts for DevTools, view source, save, copy
document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') { e.preventDefault(); return; }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return; }
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return; }
    // Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return; }
    // Ctrl+A (Select All)
    if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); return; }
    // Ctrl+C (Copy)
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); return; }
    // Ctrl+P (Print)
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); return; }
});

// Disable drag on all elements
document.addEventListener('dragstart', (e) => e.preventDefault());

// Disable copy & cut events
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());

// DevTools open detection — debugger loop
(function() {
    function detect() {
        const start = performance.now();
        debugger;
        if (performance.now() - start > 100) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#c8a97e;font-family:serif;font-size:2rem;text-align:center;padding:2rem;">Please close Developer Tools to view this website.</div>';
        }
    }
    setInterval(detect, 3000);
})();

// ===== Custom Cursor =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

// Smooth ring follow
function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

// Cursor hover states
const hoverTargets = document.querySelectorAll('a, button, .menu-card, .breakfast-card, .drinks-category, .about-feature, .contact-item');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
    });
});

// Text hover for headings
const textTargets = document.querySelectorAll('h1, h2, .hero-tagline');
textTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('text-hover');
        cursorRing.classList.add('text-hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('text-hover');
        cursorRing.classList.remove('text-hover');
    });
});

// ===== Preloader =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        // Trigger hero animations
        document.querySelectorAll('.hero [data-animate]').forEach((el, i) => {
            const delay = parseInt(el.dataset.delay) || 0;
            setTimeout(() => el.classList.add('visible'), delay);
        });
        // Scroll indicator is visible by default, no trigger needed
    }, 1800);
});

// ===== Navbar =====
const navbar = document.getElementById('navbar');
const scrollIndicator = document.getElementById('scrollIndicator');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Fade out scroll indicator after a small scroll
    if (scrollIndicator) {
        if (currentScroll > 80) {
            scrollIndicator.classList.add('faded');
        } else {
            scrollIndicator.classList.remove('faded');
        }
    }

    lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('open');
});

navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('open');
    });
});

// ===== Hero Particles =====
const particlesContainer = document.getElementById('heroParticles');
for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('hero-particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 8 + 5) + 's';
    particle.style.animationDelay = (Math.random() * 5) + 's';
    particle.style.width = (Math.random() * 3 + 1) + 'px';
    particle.style.height = particle.style.width;
    particlesContainer.appendChild(particle);
}

// ===== Scroll Animations =====
const animateElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

animateElements.forEach(el => {
    // Don't observe hero elements, they're triggered by preloader
    if (!el.closest('.hero')) {
        observer.observe(el);
    }
});

// ===== Menu Tabs =====
const menuTabs = document.querySelectorAll('.menu-tab');
const menuPanels = document.querySelectorAll('.menu-panel');

menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        menuTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        menuPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === 'tab-' + targetTab) {
                panel.classList.add('active');
            }
        });
    });
});

// ===== Magnetic Button Effect =====
const magneticBtns = document.querySelectorAll('.magnetic-btn');

magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// ===== Card Tilt Effect =====
const tiltCards = document.querySelectorAll('.menu-card, .breakfast-card');

tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
    });
});

// ===== Smooth Scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Parallax on Hero =====
window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scroll < window.innerHeight) {
        heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
        heroContent.style.opacity = 1 - scroll / (window.innerHeight * 0.8);
    }
});

// ===== Counter animation for breakfast price =====
function animateCounter(element, target, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;
        element.textContent = '\u00A3' + current.toFixed(2);
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

const priceEl = document.querySelector('.breakfast-price');
if (priceEl) {
    const priceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target, 11.99, 2000);
                priceObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    priceObserver.observe(priceEl);
}

// ===== Reveal on scroll for drinks categories =====
const drinkCards = document.querySelectorAll('.drinks-category');
const drinkObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 150);
            drinkObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

drinkCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    drinkObserver.observe(card);
});
