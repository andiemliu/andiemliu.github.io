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

    // ── MODAL-AWARE HAMBURGER CLICK ───────────────────────────────
    // When a page modal is open, the hamburger acts as the modal's
    // close button (showing the same ✕ animation). When no modal is
    // open it toggles the nav overlay as normal.
    let modalCloseFn = null;   // set by page scripts via window.hamburgerModalOpen

    hamburgerBtn.addEventListener('click', () => {
        if (modalCloseFn) {
            modalCloseFn();           // delegate to modal close
        } else if (overlayOpen) {
            closeOverlay();
        } else {
            openOverlay();
        }
    });

    // API for page-level modal scripts:
    //   call window.hamburgerModalOpen(closeFn) when a modal opens
    //   call window.hamburgerModalClose()       when a modal closes
    window.hamburgerModalOpen = function (closeFn) {
        modalCloseFn = closeFn;
        hamburgerBtn.classList.add('is-open');   // animates to ✕
        document.body.classList.add('modal-is-open');
        // Keep the box bg in sync with the current dynamic body color
        hamburgerBtn.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
    };
    window.hamburgerModalClose = function () {
        modalCloseFn = null;
        hamburgerBtn.classList.remove('is-open'); // animates back to ≡
        document.body.classList.remove('modal-is-open');
        hamburgerBtn.style.backgroundColor = '';  // revert to CSS default (none)
    };

    // Close overlay when a nav link is tapped
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeOverlay());
        // On touch: retreat the current active/tapped underline, grow the new one
        link.addEventListener('touchstart', () => {
            overlay.querySelectorAll('a').forEach(l => {
                if (l !== link && (l.classList.contains('active') || l.classList.contains('tapped'))) {
                    l.classList.remove('tapped');
                    l.classList.add('retreating');
                }
            });
            link.classList.remove('retreating');
            link.classList.add('tapped');
        }, { passive: true });
    });

    // ── DESKTOP NAV DIRECTIONAL RETREAT ──────────────────────────
    // On click of a desktop nav link, animate the active underline
    // retreating in the direction of the clicked link before navigating.
    const desktopMenuLinks = Array.from(document.querySelectorAll('.menu a'));
    const activeLink = desktopMenuLinks.find(l => l.classList.contains('active'));

    if (activeLink) {
        const activeIndex = desktopMenuLinks.indexOf(activeLink);

        desktopMenuLinks.forEach((link, idx) => {
            if (link === activeLink) return;
            link.addEventListener('click', function (e) {
                // clicking to the right → underline retreats rightward (shrinks from left)
                // clicking to the left  → underline retreats leftward  (shrinks from right)
                const retreatClass = idx > activeIndex ? 'retreating-right' : 'retreating-left';
                activeLink.classList.add(retreatClass);
                // Navigation is handled by the existing page-transition listener below;
                // the retreat animation plays during its 260ms delay.
            });
        });
    }

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
            // Opaque at top (nav edge) → transparent below
            blurTop.style.background =
                `linear-gradient(to bottom, ${bgColor} 0%, transparent 100%)`;
        }
        if (blurBottom) {
            // Opaque at bottom (tucked behind footer) → transparent at top.
            // Mirrors the top strip exactly: the hard opaque edge is hidden
            // behind the footer bar; only the dissolving transparent end shows.
            blurBottom.style.background =
                `linear-gradient(to top, ${bgColor} 0%, transparent 100%)`;
        }
    }

    function applyBgColor(bgColor) {
        container.style.backgroundColor = bgColor;
        if (menuTab) menuTab.style.backgroundColor = bgColor;
        // Sync mobile nav bar colour
        if (isTouchDevice() || window.innerWidth <= 600) {
            const navEl = document.querySelector('nav');
            if (navEl) navEl.style.backgroundColor = bgColor;
        }
        if (overlayOpen) overlay.style.backgroundColor = bgColor;
        if (footerEl && document.body.classList.contains('home-pg')) {
            footerEl.style.backgroundColor = bgColor;
        }
        // Keep fade strips in sync with body colour
        updateStripColors(bgColor);
    }

    // Paint mobile nav bar immediately on load
    if (isTouchDevice() || window.innerWidth <= 600) {
        const navEl = document.querySelector('nav');
        if (navEl) navEl.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
    }

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

    const isMobile = isTouchDevice() || window.innerWidth <= 600;
    const isHomePg = document.body.classList.contains('home-pg');

    // ── TOP FADE STRIP ────────────────────────────────────────────
    // Mobile: always present on every page (sits below the 66px nav bar)
    // Desktop: only on About page (other pages use the floating pill, no bar)
    if (isMobile || isHomePg) {
        blurTop = document.createElement('div');
        blurTop.className = isMobile ? 'mobile-blur-top' : 'desktop-blur-top';
        document.body.appendChild(blurTop);
    }

    // ── BOTTOM FADE STRIP ─────────────────────────────────────────
    // About page only on all devices (fixed footer)
    if (isHomePg) {
        blurBottom = document.createElement('div');
        blurBottom.className = isMobile ? 'mobile-blur-bottom' : 'desktop-blur-bottom';

        document.body.appendChild(blurBottom);
        // No dynamic positioning needed — CSS anchors the strip to bottom:0
        // so the opaque gradient end is always tucked behind the footer.
    }

    // Paint strips immediately with the current bg colour
    const initBg = window.getComputedStyle(document.body).backgroundColor;
    updateStripColors(initBg);

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