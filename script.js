// =====================================================================
// PORTFOLIO SCRIPT
// Sections:
//   1. Respect reduced-motion preference
//   2. Hero terminal typewriter
//   3. Git-graph spine: compute paths + draw-in on scroll
//   4. Scroll-reveal for commit markers & skill branches
//   5. Nav: active tab highlighting (scroll spy) + mobile drawer
//   6. Contact form (front-end only demo)
// =====================================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   1 & 2. HERO TYPEWRITER
   Types "whoami" into the fake terminal, then reveals a couple of
   fake command outputs. If the user prefers reduced motion, skip
   straight to the final text.
--------------------------------------------------------------------- */
function initTypewriter() {
  const cmdEl = document.getElementById('typedCmd');
  const outputEl = document.getElementById('typedOutput');
  const cursor = document.getElementById('cmdCursor');
  if (!cmdEl || !outputEl) return;

  const command = 'whoami';
  const outputLines = [
    'ginni-falak',
    '',
    'role   : software developer (react / js / sql & mongo)',
    'status : learning fast, shipping faster'
  ];

  if (prefersReducedMotion) {
    cmdEl.textContent = command;
    outputEl.textContent = outputLines.join('\n');
    return;
  }

  let i = 0;
  function typeChar() {
    if (i < command.length) {
      cmdEl.textContent += command[i];
      i++;
      setTimeout(typeChar, 90);
    } else {
      setTimeout(revealOutput, 400);
    }
  }

  function revealOutput() {
    if (cursor) cursor.style.display = 'none';
    outputEl.textContent = outputLines.join('\n');
    outputEl.style.opacity = 0;
    outputEl.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => { outputEl.style.opacity = 1; });
  }

  typeChar();
}

/* ---------------------------------------------------------------------
   3. GIT-GRAPH SPINE
   Draws a vertical "main" line down the whole page, with three
   branches (frontend / backend / database) that diverge for the
   duration of the Skills section, echoing a real git graph.
--------------------------------------------------------------------- */
function layoutGraphSpine() {
  const svg = document.getElementById('graphSpine');
  if (!svg) return; // hidden on mobile via CSS, but guard anyway

  const docHeight = document.body.scrollHeight;
  svg.setAttribute('viewBox', `0 0 100 ${docHeight}`);

  const mainLine = document.getElementById('mainLine');
  mainLine.setAttribute('d', `M20,0 L20,${docHeight}`);

  const skillsEl = document.getElementById('skills');
  if (!skillsEl) return;
  const rect = skillsEl.getBoundingClientRect();
  const top = rect.top + window.scrollY + 20;
  const bottom = top + rect.height - 20;
  const mid = top + (bottom - top) / 2;

  const feBranch = document.getElementById('feBranch');
  const beBranch = document.getElementById('beBranch');
  const dbBranch = document.getElementById('dbBranch');

  feBranch.setAttribute('d',
    `M20,${top} C20,${top + 60} 4,${mid - 120} 4,${mid} C4,${mid + 120} 20,${bottom - 60} 20,${bottom}`);
  beBranch.setAttribute('d',
    `M20,${top} C20,${top + 40} 26,${mid - 80} 26,${mid} C26,${mid + 80} 20,${bottom - 40} 20,${bottom}`);
  dbBranch.setAttribute('d',
    `M20,${top} C20,${top + 60} 36,${mid - 120} 36,${mid} C36,${mid + 120} 20,${bottom - 60} 20,${bottom}`);

  // reset path lengths so the draw-in animation measures correctly after relayout
  [mainLine, feBranch, beBranch, dbBranch].forEach(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    if (!p.classList.contains('is-drawn')) {
      p.style.strokeDashoffset = len;
    } else {
      p.style.strokeDashoffset = 0;
    }
  });
}

/* ---------------------------------------------------------------------
   4. SCROLL REVEAL
   Fades in commit markers/branches as they enter the viewport, and
   triggers the corresponding graph line to draw itself in.
--------------------------------------------------------------------- */
function initScrollReveal() {
  const mainLine = document.getElementById('mainLine');
  const branchLines = [
    document.getElementById('feBranch'),
    document.getElementById('beBranch'),
    document.getElementById('dbBranch')
  ];

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-node]').forEach(el => el.classList.add('is-visible'));
    document.querySelectorAll('.branch').forEach(el => el.classList.add('is-visible'));
    [mainLine, ...branchLines].forEach(p => p && p.classList.add('is-drawn'));
    return;
  }

  const nodeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (mainLine) mainLine.classList.add('is-drawn');
        nodeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('[data-node]').forEach(el => nodeObserver.observe(el));

  const branchObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        branchLines.forEach(p => p && p.classList.add('is-drawn'));
        branchObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.branch').forEach(el => branchObserver.observe(el));
}

/* ---------------------------------------------------------------------
   5. NAV — scroll spy + mobile drawer
--------------------------------------------------------------------- */
function initNav() {
  const tabs = document.querySelectorAll('[data-tab]');
  const sections = Array.from(document.querySelectorAll('main > section[id]'));

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tabs.forEach(tab => {
          const match = tab.getAttribute('href') === `#${id}`;
          tab.classList.toggle('is-active', match && tab.closest('.tabbar__tabs'));
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => spy.observe(s));

  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ---------------------------------------------------------------------
   6. CONTACT FORM (front-end demo only)
   This portfolio is static, so there's no server to receive the
   submission yet. Swap this handler for a real POST to Formspree,
   or to your own Node/Express endpoint — see README.md.
--------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '# commit queued — connect this form to a real backend to send it (see README.md)';
    form.reset();
  });
}

/* ---------------------------------------------------------------------
   INIT
--------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  layoutGraphSpine();
  initScrollReveal();
  initNav();
  initContactForm();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutGraphSpine, 200);
});