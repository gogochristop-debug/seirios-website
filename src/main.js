const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Άνοιγμα μενού');
  nav.classList.remove('open');
  header.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
  nav.classList.toggle('open', opening);
  header.classList.toggle('menu-active', opening);
  document.body.classList.toggle('menu-open', opening);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1160) closeMenu();
});
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

// Gallery filters keep the future photo collection manageable without a dependency.
const filterButtons = document.querySelectorAll('.gallery-filters button');
const galleryItems = document.querySelectorAll('.gallery-item');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle('active', item === button));
  galleryItems.forEach((item) => {
    item.hidden = filter !== 'all' && item.dataset.category !== filter;
  });
}));

const lightbox = document.querySelector('.lightbox');
const lightboxTitle = document.querySelector('#lightbox-title');
let lightboxTrigger;
galleryItems.forEach((item) => item.addEventListener('click', () => {
  lightboxTrigger = item;
  lightboxTitle.textContent = item.dataset.title;
  lightbox.showModal();
}));
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => lightboxTrigger?.focus());

// The support chooser deliberately remains non-transactional until a provider is configured.
const supportChoice = document.querySelector('#support-choice');
const supportOptions = document.querySelectorAll('[data-support]');
const amountButtons = document.querySelectorAll('.quick-amounts button[data-amount]');
const customButton = document.querySelector('[data-custom]');
const customField = document.querySelector('.custom-amount');

function selectAmount(amount, label = 'Το δικό σου ποσό') {
  supportChoice.textContent = `${label} — €${amount}`;
  amountButtons.forEach((button) => button.classList.toggle('selected', button.dataset.amount === String(amount)));
}

supportOptions.forEach((option) => option.addEventListener('click', () => {
  supportOptions.forEach((item) => item.classList.toggle('selected', item === option));
  selectAmount(option.dataset.amount, option.dataset.support);
  document.querySelector('#support-checkout').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}));
amountButtons.forEach((button) => button.addEventListener('click', () => {
  supportOptions.forEach((item) => item.classList.remove('selected'));
  customField.hidden = true;
  selectAmount(button.dataset.amount);
}));
customButton.addEventListener('click', () => {
  customField.hidden = false;
  amountButtons.forEach((button) => button.classList.remove('selected'));
  customField.querySelector('input').focus();
});
customField.querySelector('input').addEventListener('input', (event) => {
  if (event.target.valueAsNumber >= 2) selectAmount(event.target.valueAsNumber);
});

// Forms are configuration-ready, but never claim to submit while no endpoint exists.
document.querySelectorAll('.configured-form').forEach((form) => form.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  if (!form.checkValidity()) {
    form.reportValidity();
    status.textContent = 'Έλεγξε τα υποχρεωτικά πεδία.';
    return;
  }
  status.textContent = 'Η φόρμα συμπληρώθηκε, αλλά δεν στάλθηκε: απαιτείται σύνδεση ασφαλούς υπηρεσίας αποστολής.';
}));

document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('main > section:not(.hero) > .container, .sports-section article').forEach((element) => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}
