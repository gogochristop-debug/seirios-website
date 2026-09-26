const MAX_BODY_BYTES = 16_384;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_CATEGORIES = new Set([
  'Συμμετοχή στην ομάδα',
  'Indoor Volleyball',
  'Beach Volley',
  'Φίλοι του Σείριου',
  'Χορηγία',
  'Άλλο',
]);
const SPONSOR_PACKAGES = new Set([
  'Starter Sponsor',
  'Plus Sponsor',
  'Premium Sponsor',
  'Digital Sponsor',
  'Θέλω να το συζητήσουμε',
]);

const FORM_RULES = {
  contact: {
    fields: new Set(['formType', 'name', 'email', 'phone', 'category', 'message', 'nickname']),
    required: ['name', 'email', 'category', 'message'],
    limits: { name: 120, email: 254, phone: 40, category: 50, message: 4000, nickname: 0 },
  },
  sponsorship: {
    fields: new Set(['formType', 'company', 'name', 'email', 'phone', 'website', 'package', 'message', 'nickname']),
    required: ['company', 'name', 'email', 'package', 'message'],
    limits: { company: 160, name: 120, email: 254, phone: 40, website: 300, package: 50, message: 4000, nickname: 0 },
  },
};

function jsonResponse(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

function validationError(message) {
  return jsonResponse({ ok: false, error: message }, 400);
}

function normalizePayload(input, rules) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Μη έγκυρα δεδομένα φόρμας.');
  for (const key of Object.keys(input)) {
    if (!rules.fields.has(key)) throw new Error('Η φόρμα περιέχει μη αναμενόμενο πεδίο.');
    if (typeof input[key] !== 'string') throw new Error('Όλα τα πεδία πρέπει να είναι κείμενο.');
  }

  const payload = {};
  for (const field of rules.fields) payload[field] = (input[field] || '').trim();
  if (payload.nickname) throw new Error('Η υποβολή απορρίφθηκε.');
  for (const field of rules.required) {
    if (!payload[field]) throw new Error('Συμπλήρωσε όλα τα υποχρεωτικά πεδία.');
  }
  for (const [field, limit] of Object.entries(rules.limits)) {
    if (payload[field].length > limit) throw new Error(`Το πεδίο «${field}» είναι πολύ μεγάλο.`);
  }
  if (!EMAIL_PATTERN.test(payload.email)) throw new Error('Συμπλήρωσε μια έγκυρη διεύθυνση email.');
  return payload;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function emailContent(payload) {
  const submittedAt = new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens', timeZoneName: 'long' });
  const labels = payload.formType === 'contact'
    ? [['Τύπος φόρμας', 'Επικοινωνία'], ['Ονοματεπώνυμο', payload.name], ['Email επισκέπτη', payload.email], ['Τηλέφωνο', payload.phone], ['Κατηγορία / ενδιαφέρον', payload.category]]
    : [['Τύπος φόρμας', 'Χορηγία'], ['Υπεύθυνος επικοινωνίας', payload.name], ['Email επισκέπτη', payload.email], ['Τηλέφωνο', payload.phone], ['Επωνυμία', payload.company], ['Ιστότοπος / social', payload.website], ['Πακέτο χορηγίας', payload.package]];
  labels.push(['Ημερομηνία υποβολής', `${submittedAt} (Europe/Athens)`], ['Μήνυμα', payload.message]);
  const visible = labels.filter(([, value]) => value);
  return {
    subject: `[Seirios] ${payload.formType === 'contact' ? 'Νέα επικοινωνία' : 'Νέο αίτημα χορηγίας'} — ${payload.name}`,
    text: visible.map(([label, value]) => `${label}:\n${value}`).join('\n\n'),
    html: `<h1>${payload.formType === 'contact' ? 'Νέα επικοινωνία' : 'Νέο αίτημα χορηγίας'}</h1>${visible.map(([label, value]) => `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`).join('')}`,
  };
}

function validSameOrigin(request) {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && !['same-origin', 'same-site'].includes(fetchSite)) return false;
  return Boolean(origin && origin === new URL(request.url).origin);
}

async function readLimitedBody(request) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) return body + decoder.decode();
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

async function handleContact(request, env) {
  if (request.method !== 'POST') return jsonResponse({ ok: false, error: 'Η μέθοδος δεν επιτρέπεται.' }, 405, { allow: 'POST' });
  if (!validSameOrigin(request)) return jsonResponse({ ok: false, error: 'Η προέλευση της υποβολής δεν είναι έγκυρη.' }, 403);
  const contentType = request.headers.get('content-type') || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) return jsonResponse({ ok: false, error: 'Απαιτούνται δεδομένα JSON.' }, 415);
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return jsonResponse({ ok: false, error: 'Η υποβολή είναι πολύ μεγάλη.' }, 413);

  const body = await readLimitedBody(request);
  if (body === null) return jsonResponse({ ok: false, error: 'Η υποβολή είναι πολύ μεγάλη.' }, 413);
  let input;
  try { input = JSON.parse(body); } catch { return validationError('Τα δεδομένα της φόρμας δεν είναι έγκυρα.'); }
  if (!input || typeof input !== 'object' || !Object.hasOwn(FORM_RULES, input.formType)) return validationError('Μη έγκυρος τύπος φόρμας.');

  let payload;
  try { payload = normalizePayload(input, FORM_RULES[input.formType]); } catch (error) { return validationError(error.message); }
  if (payload.formType === 'contact' && !CONTACT_CATEGORIES.has(payload.category)) return validationError('Μη έγκυρη κατηγορία ενδιαφέροντος.');
  if (payload.formType === 'sponsorship' && !SPONSOR_PACKAGES.has(payload.package)) return validationError('Μη έγκυρο πακέτο χορηγίας.');
  if (payload.website) {
    try {
      const website = new URL(payload.website);
      if (!['http:', 'https:'].includes(website.protocol)) throw new Error();
    } catch { return validationError('Συμπλήρωσε έναν έγκυρο ιστότοπο ή social link.'); }
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) return jsonResponse({ ok: false, error: 'Η υπηρεσία αποστολής δεν είναι διαθέσιμη.' }, 503);

  const content = emailContent(payload);
  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, to: [env.CONTACT_TO_EMAIL], reply_to: payload.email, ...content }),
    });
  } catch {
    return jsonResponse({ ok: false, error: 'Δεν ήταν δυνατή η αποστολή. Δοκίμασε ξανά αργότερα.' }, 502);
  }
  if (!resendResponse.ok) return jsonResponse({ ok: false, error: 'Δεν ήταν δυνατή η αποστολή. Δοκίμασε ξανά αργότερα.' }, 502);
  let result;
  try { result = await resendResponse.json(); } catch { return jsonResponse({ ok: false, error: 'Δεν επιβεβαιώθηκε η αποστολή. Δοκίμασε ξανά.' }, 502); }
  if (!result.id) return jsonResponse({ ok: false, error: 'Δεν επιβεβαιώθηκε η αποστολή. Δοκίμασε ξανά.' }, 502);
  return jsonResponse({ ok: true }, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
};

export { handleContact };
