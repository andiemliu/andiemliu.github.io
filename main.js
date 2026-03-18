// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

    // ── MOBILE HAMBURGER NAV ──────────────────────────────────────
    // Inject button + overlay only on mobile (CSS hides them on desktop)
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'mobile-nav-toggle';
    hamburgerBtn.setAttribute('aria-label', 'Toggle navigation');
    hamburgerBtn.innerHTML = '<span></span><span></span><span></span>';

    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';

    // Clone the nav links from the existing menu
    const existingMenu = document.querySelector('.menu');
    if (existingMenu) {
        const overlayUl = existingMenu.cloneNode(true);
        overlay.appendChild(overlayUl);
    }

    document.body.appendChild(hamburgerBtn);
    document.body.appendChild(overlay);

    let overlayOpen = false;

    function openOverlay() {
        overlayOpen = true;
        hamburgerBtn.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        // Sync overlay background with current body color
        overlay.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
    }

    function closeOverlay() {
        overlayOpen = false;
        hamburgerBtn.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        if (overlayOpen) closeOverlay(); else openOverlay();
    });

    // Close overlay when a nav link is tapped
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeOverlay());
    });

    // ── PAGE TRANSITION LINKS ─────────────────────────────────────
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        // Only intercept same-site .html links, not external or PDF links
        if (!href || href.startsWith('http') || href.startsWith('mailto') || href.endsWith('.pdf') || href.startsWith('#')) return;

        link.addEventListener('click', function (e) {
            e.preventDefault();
            // Freeze current background so it doesn't shift during fade-out
            const currentBg = window.getComputedStyle(document.body).backgroundColor;
            document.body.style.transition = 'opacity 0.25s ease';
            document.body.style.backgroundColor = currentBg;
            if (menuTab) menuTab.style.backgroundColor = currentBg;
            document.body.style.opacity = '0';
            setTimeout(() => { window.location.href = href; }, 260);
        });
    });

    // Get the container element
    const container = document.querySelector('body');

    // Elements that need to match the dynamic background color
    const menuTab = document.querySelector('.menu-container');
    const footerEl = document.querySelector('footer');

    // Fade-strip references — populated later if on mobile
    let blurTop = null;
    let blurBottom = null;

    function updateStripColors(bgColor) {
        if (blurTop) {
            blurTop.style.background =
                `linear-gradient(to bottom, ${bgColor} 0%, transparent 100%)`;
        }
        if (blurBottom) {
            blurBottom.style.background =
                `linear-gradient(to bottom, transparent 0%, ${bgColor} 100%)`;
        }
    }

    function applyBgColor(bgColor) {
        container.style.backgroundColor = bgColor;
        if (menuTab) menuTab.style.backgroundColor = bgColor;
        // Keep the mobile nav bar (the <nav> element) in sync too
        const navEl = document.querySelector('nav');
        if (navEl) navEl.style.backgroundColor = bgColor;
        if (overlayOpen) overlay.style.backgroundColor = bgColor;
        if (footerEl && document.body.classList.contains('home-pg')) {
            footerEl.style.backgroundColor = bgColor;
        }
        // Keep fade strips in sync with body colour
        updateStripColors(bgColor);
    }

    // Paint nav bar immediately on load so it's never transparent
    // regardless of how fast the user starts scrolling
    const navEl = document.querySelector('nav');
    if (navEl) navEl.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;

    // Desktop: mouse-move driven color
    container.addEventListener('mousemove', (event) => {
        if (isTouchDevice()) return;
        const mouseX = event.clientX / window.innerWidth;
        const mouseY = event.clientY / window.innerHeight;
        const r = Math.floor(200 + mouseX * 10);
        const g = Math.floor(200 + mouseY * 35);
        const b = 230;
        applyBgColor(`rgb(${r}, ${g}, ${b})`);
    });

    // Mobile: scroll-driven color (replaces mousemove)
    window.addEventListener('scroll', () => {
        if (!isTouchDevice()) return;
        const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
        const r = Math.floor(200 + scrollFraction * 10);
        const g = Math.floor(200 + scrollFraction * 35);
        const b = 230;
        applyBgColor(`rgb(${r}, ${g}, ${b})`);
    }, { passive: true });

    // ── DESKTOP SCROLL HIDE/SHOW NAV ─────────────────────────────
    const menu = document.querySelector('.menu-container');

    let lastScrollY = window.scrollY;
    let menuVisible = true;
    let hideTimeout = null;
    let menuWasHiddenByScroll = false;

    function hideMenu() {
        menu.classList.add('menu-hidden');
        menuVisible = false;
    }
    function showMenu() {
        menu.classList.remove('menu-hidden');
        menuVisible = true;
    }

    window.addEventListener('scroll', function () {
        // On mobile the hamburger replaces the menu — skip scroll-hide logic
        if (isTouchDevice()) return;

        var top = window.scrollY;
        if (top >= 40) {
            menu.classList.add('menu-container-dark');
        } else {
            menu.classList.remove('menu-container-dark');
        }

        if (window.scrollY > lastScrollY && window.scrollY > 60) {
            if (menuVisible) hideMenu();
            menuWasHiddenByScroll = true;
        } else if (window.scrollY < lastScrollY || window.scrollY <= 10) {
            if (!menuVisible) showMenu();
            menuWasHiddenByScroll = false;
        }
        lastScrollY = window.scrollY;
    });

    // Show menu when mouse is near the top (within 60px) — desktop only
    document.addEventListener('mousemove', function (e) {
        if (isTouchDevice()) return;
        if (e.clientY < 60) {
            if (!menuVisible) showMenu();
            if (hideTimeout) clearTimeout(hideTimeout);
            if (window.scrollY > 60 && menuWasHiddenByScroll) {
                menu.classList.add('menu-container-dark');
            } else {
                menu.classList.remove('menu-container-dark');
            }
        } else if (menuVisible && window.scrollY > 60) {
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hideMenu, 400);
        }
    });

    if (isTouchDevice() || window.innerWidth <= 600) {
        // Top strip — always present
        blurTop = document.createElement('div');
        blurTop.className = 'mobile-blur-top';
        document.body.appendChild(blurTop);

        // Bottom strip — About page only (fixed footer)
        if (document.body.classList.contains('home-pg')) {
            blurBottom = document.createElement('div');
            blurBottom.className = 'mobile-blur-bottom';

            function positionBlurBottom() {
                const footer = document.querySelector('footer');
                if (footer) {
                    const fh = footer.getBoundingClientRect().height;
                    blurBottom.style.bottom = fh + 'px';
                }
            }
            document.body.appendChild(blurBottom);
            positionBlurBottom();
            window.addEventListener('resize', positionBlurBottom);
        }

        // Initial paint with default bg
        const initBg = window.getComputedStyle(document.body).backgroundColor;
        updateStripColors(initBg);
    }

    // ── RESUME DATE ABBREVIATION (all screen sizes) ───────────────
    // Shorten "Mon YYYY" → "Mon 'YY" everywhere so dates stay compact
    // e.g. "Oct 2022 - May 2023" → "Oct '22 – May '23"
    // "Mar 2026 - Present" → "Mar '26 – Present"
    document.querySelectorAll('.resumeTime').forEach(el => {
        el.innerHTML = el.innerHTML
            // Replace 4-digit years with abbreviated form
            .replace(/\b(20\d{2})\b/g, (_, yr) => `'${yr.slice(2)}`)
            // Replace the hyphen separator with an en-dash for cleanliness
            .replace(/\s-\s/, ' – ');
    });

    // ── MOBILE RESUME ORG LINE-BREAK ──────────────────────────────
    // On mobile only, split "Role — Org" so the org name wraps to next line
    if (isTouchDevice() || window.innerWidth <= 600) {
        document.querySelectorAll('.resumeOrg').forEach(el => {
            el.innerHTML = el.innerHTML.replace(/\s[—–]\s/, '<br>');
        });
    }

    // ── ABOUT PAGE FADE-IN ────────────────────────────────────────
    const leftContainer = document.querySelector('.left-container');
    const rightContainer = document.querySelector('.right-container');
    const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
    const responsePromise = wait(100);
    if (leftContainer && rightContainer) {
        responsePromise.then(() => leftContainer.style.opacity = 1).then(() => wait(90))
            .then(() => rightContainer.style.opacity = 1).then(() => wait(90));
    }
    responsePromise.then(() => { if (menu) menu.style.opacity = 1; });
});
