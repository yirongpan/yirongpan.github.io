(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.nav-toggle');
  if (!toggle) return;
  const compact = window.matchMedia('(max-width: 960px)');

  function setOpen(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  header.classList.add('nav-ready');
  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  header.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  compact.addEventListener('change', () => {
    if (compact.matches && header.contains(document.activeElement) &&
        document.activeElement !== header.querySelector('.wordmark')) {
      toggle.focus();
    }
    setOpen(false);
  });
  window.addEventListener('pageshow', () => setOpen(false));
})();
