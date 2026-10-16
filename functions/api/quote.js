// Cloudflare Pages Function: POST /api/quote
// Receives the quote form, validates it, filters spam, and passes it to deliver().
//
// Environment variables (Cloudflare Pages → Settings → Variables and Secrets):
//   QUOTE_TO       where requests are delivered, e.g. info@alttab4shipping.com
//   QUOTE_FROM     sender address on a verified domain, e.g. "Alttab Website <website@alttab4shipping.com>"
//   RESEND_API_KEY (secret) API key for the email provider

const FIELDS = {
  name:       { required: true,  max: 120 },
  company:    { required: false, max: 160 },
  email:      { required: true,  max: 200 },
  phone:      { required: true,  max: 40 },
  service:    { required: true,  max: 60 },
  from:       { required: true,  max: 120 },
  to:         { required: true,  max: 120 },
  weight:     { required: false, max: 20 },
  dimensions: { required: false, max: 60 },
  message:    { required: false, max: 3000 },
};

const SERVICES = new Set([
  'International courier', 'Air freight', 'E-commerce shipping',
  'Document courier', 'Customs paperwork', 'Pickup & packing',
]);

const LABELS = {
  name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', service: 'Service',
  from: 'From', to: 'To', weight: 'Weight (kg)', dimensions: 'Size (cm)', message: 'Contents & notes',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Invalid form data.' }, 400);
  }

  // Spam checks: the hidden "website" field must be empty, and the form
  // must have been open for at least 3 seconds. Bots get a fake success.
  const started = Number(form.get('started'));
  if (form.get('website') || !started || Date.now() - started < 3000) {
    return json({ ok: true });
  }

  const data = {};
  for (const [key, rule] of Object.entries(FIELDS)) {
    const value = String(form.get(key) ?? '').trim();
    if (rule.required && !value) return json({ ok: false, error: `${LABELS[key]} is required.` }, 422);
    if (value.length > rule.max) return json({ ok: false, error: `${LABELS[key]} is too long.` }, 422);
    data[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ ok: false, error: 'Email address is not valid.' }, 422);
  }
  if (!SERVICES.has(data.service)) {
    return json({ ok: false, error: 'Choose a service from the list.' }, 422);
  }

  try {
    await deliver(data, env);
  } catch (err) {
    console.error('Quote delivery failed:', err.message);
    return json({ ok: false, error: 'Could not send the request.' }, 502);
  }
  return json({ ok: true });
}

// Sends the request by email. Swap this function to change provider.
async function deliver(data, env) {
  if (!env.RESEND_API_KEY || !env.QUOTE_TO || !env.QUOTE_FROM) {
    throw new Error('Email delivery is not configured (RESEND_API_KEY, QUOTE_TO, QUOTE_FROM).');
  }

  const rows = Object.keys(FIELDS)
    .filter((k) => data[k])
    .map((k) => `<tr><td style="padding:6px 16px 6px 0;color:#696969;vertical-align:top">${LABELS[k]}</td>` +
                `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(data[k])}</td></tr>`)
    .join('');
  const text = Object.keys(FIELDS).filter((k) => data[k]).map((k) => `${LABELS[k]}: ${data[k]}`).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.QUOTE_FROM,
      to: [env.QUOTE_TO],
      reply_to: data.email,
      subject: `Quote request: ${data.service}, ${data.from} → ${data.to}`,
      html: `<h2 style="font-family:Arial,sans-serif">New quote request</h2>` +
            `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
