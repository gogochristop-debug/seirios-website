const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function closeMenu() {
  if (!menuButton || !nav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Άνοιγμα μενού');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
  nav?.classList.toggle('open', opening);
  document.body.classList.toggle('menu-open', opening);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 1100) closeMenu(); });

document.querySelectorAll('.configured-form').forEach((form) => form.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  if (!form.checkValidity()) { form.reportValidity(); if (status) status.textContent = 'Έλεγξε τα υποχρεωτικά πεδία.'; return; }
  if (status) status.textContent = 'Η φόρμα είναι έτοιμη, αλλά απαιτείται σύνδεση ασφαλούς υπηρεσίας αποστολής.';
}));

const supportChoice = document.querySelector('#support-choice');
const customField = document.querySelector('.custom-amount');
document.querySelectorAll('[data-amount]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-amount]').forEach((item) => item.classList.toggle('selected', item === button));
  if (supportChoice) supportChoice.textContent = `Επιλεγμένη υποστήριξη — €${button.dataset.amount}`;
}));
document.querySelector('[data-custom]')?.addEventListener('click', () => { if (customField) { customField.hidden = false; customField.querySelector('input')?.focus(); } });
customField?.querySelector('input')?.addEventListener('input', (event) => { if (event.target.valueAsNumber >= 2 && supportChoice) supportChoice.textContent = `Επιλεγμένη υποστήριξη — €${event.target.valueAsNumber}`; });

document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), { threshold: .08 });
  document.querySelectorAll('main > section:not(.hero):not(.page-hero) > .container').forEach((item) => { item.classList.add('reveal'); observer.observe(item); });
}
