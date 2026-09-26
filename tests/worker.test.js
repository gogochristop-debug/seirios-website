import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';

const origin = 'https://seirios2025.com';
const env = {
  RESEND_API_KEY: 'test-placeholder',
  CONTACT_TO_EMAIL: 'destination@example.test',
  CONTACT_FROM_EMAIL: 'Website <sender@example.test>',
  ASSETS: { fetch: () => new Response('static asset') },
};

const contact = {
  formType: 'contact',
  name: ' Δοκιμή ',
  email: 'visitor@example.com',
  phone: '',
  category: 'Indoor Volleyball',
  message: 'Καλησπέρα',
  nickname: '',
};

function request(body, options = {}) {
  return new Request(`${origin}/api/contact`, {
    method: options.method || 'POST',
    headers: { origin, 'content-type': 'application/json', ...options.headers },
    body: options.method === 'GET' ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
  });
}

test('passes non-API requests to the static asset binding', async () => {
  const response = await worker.fetch(new Request(`${origin}/contact.html`), env);
  assert.equal(await response.text(), 'static asset');
});

test('allows only POST requests', async () => {
  const response = await worker.fetch(request(null, { method: 'GET' }), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
});

test('rejects cross-origin, non-JSON, and malformed requests', async () => {
  assert.equal((await worker.fetch(request(contact, { headers: { origin: 'https://attacker.test' } }), env)).status, 403);
  assert.equal((await worker.fetch(request(contact, { headers: { 'content-type': 'text/plain' } }), env)).status, 415);
  assert.equal((await worker.fetch(request('{bad json'), env)).status, 400);
});

test('rejects missing fields, unexpected fields, invalid controlled values, and honeypot', async () => {
  assert.equal((await worker.fetch(request({ ...contact, message: '' }), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...contact, destination: 'other@example.com' }), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...contact, category: 'Unlisted' }), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...contact, nickname: 'spam' }), env)).status, 400);
  const sponsorship = { formType: 'sponsorship', company: 'Company', name: 'Contact', email: 'sponsor@example.com', phone: '', website: 'javascript:alert(1)', package: 'Plus Sponsor', message: 'Interested', nickname: '' };
  assert.equal((await worker.fetch(request(sponsorship), env)).status, 400);
});

test('rejects invalid email and oversized fields or bodies', async () => {
  assert.equal((await worker.fetch(request({ ...contact, email: 'invalid' }), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...contact, name: 'a'.repeat(121) }), env)).status, 400);
  assert.equal((await worker.fetch(request('x'.repeat(16_385)), env)).status, 413);
});

test('sends both form types through Resend using only server addresses', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  const sent = [];
  globalThis.fetch = async (url, init) => {
    sent.push({ url, init, payload: JSON.parse(init.body) });
    return Response.json({ id: 'accepted-message-id' });
  };

  const sponsorship = {
    formType: 'sponsorship', company: 'Company', name: 'Contact', email: 'sponsor@example.com', phone: '123',
    website: 'https://example.com', package: 'Plus Sponsor', message: 'Interested', nickname: '',
  };
  assert.equal((await worker.fetch(request(contact), env)).status, 200);
  assert.equal((await worker.fetch(request(sponsorship), env)).status, 200);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].url, 'https://api.resend.com/emails');
  assert.equal(sent[0].payload.from, env.CONTACT_FROM_EMAIL);
  assert.deepEqual(sent[0].payload.to, [env.CONTACT_TO_EMAIL]);
  assert.equal(sent[0].payload.reply_to, contact.email);
  assert.match(sent[1].payload.text, /Europe\/Athens/);
});

test('reports failure unless Resend confirms acceptance with an id', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({}, { status: 200 });
  assert.equal((await worker.fetch(request(contact), env)).status, 502);
  globalThis.fetch = async () => Response.json({ message: 'failure' }, { status: 500 });
  assert.equal((await worker.fetch(request(contact), env)).status, 502);
});
