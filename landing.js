/* ============================================
   NUTRICOPILOT - LANDING PAGE INTERACTIONS
   ============================================ */

const nav = document.getElementById('nav');
const mobileToggle = document.getElementById('mobileNavToggle');
const mobileDrawer = document.getElementById('mobileNavDrawer');
const watchDemoBtn = document.getElementById('watchDemoBtn');

function syncNavState() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 18);
}

window.addEventListener('scroll', syncNavState, { passive: true });
syncNavState();

function closeMobileNav() {
    if (!mobileDrawer || !mobileToggle) return;
    mobileDrawer.classList.add('hidden');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
}

if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('hidden') === false;
        mobileToggle.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}

function navigateTo(url) {
    const overlay = document.getElementById('pageTransition');
    if (!overlay) {
        window.location.href = url;
        return;
    }

    overlay.classList.remove('done');
    window.setTimeout(() => {
        window.location.href = url;
    }, 260);
}

document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;

    if (href.endsWith('.html')) {
        event.preventDefault();
        navigateTo(href);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('pageTransition');
    if (overlay) {
        requestAnimationFrame(() => overlay.classList.add('done'));
    }

    initScrollReveal();
    initFaqAccordions();
});

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
        observer.observe(el);
    });
}

if (watchDemoBtn) {
    watchDemoBtn.addEventListener('click', () => {
        const target = document.getElementById('workflow') || document.getElementById('product');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function initFaqAccordions() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        item.addEventListener('toggle', () => {
            if (!item.open) return;
            items.forEach(other => {
                if (other !== item) other.removeAttribute('open');
            });
        });
    });
}

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobileNav();
});
