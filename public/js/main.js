document.addEventListener('DOMContentLoaded', () => {
  // Mobiel menu
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Foto-gallerij op autodetailpagina
  const mainImg = document.querySelector('.gallery-main img');
  const thumbs = document.querySelectorAll('.gallery-thumbs img');
  let activeThumbIndex = Array.from(thumbs).findIndex((t) => t.classList.contains('active'));
  if (activeThumbIndex < 0) activeThumbIndex = 0;

  const showThumb = (index) => {
    if (!thumbs.length) return;
    activeThumbIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[activeThumbIndex];
    if (mainImg) mainImg.src = thumb.dataset.full || thumb.src;
    thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => showThumb(index));
  });

  // Met de pijltjestoetsen (links/rechts) door de foto's bladeren, behalve
  // wanneer de gebruiker aan het typen is in een formulierveld.
  if (thumbs.length > 1) {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showThumb(activeThumbIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showThumb(activeThumbIndex + 1);
      }
    });
  }

  // Bevestiging bij verwijderen in het beheerpaneel
  document.querySelectorAll('[data-confirm]').forEach((el) => {
    const eventName = el.tagName === 'FORM' ? 'submit' : 'click';
    el.addEventListener(eventName, (e) => {
      if (!confirm(el.dataset.confirm)) e.preventDefault();
    });
  });
});
