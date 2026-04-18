import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendEmail, welcomeEmailHtml } from '../../lib/email';

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: APIRoute = async ({ request }) => {
  let payload: { email?: string; referrer?: string | null } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const referrer = typeof payload.referrer === 'string' ? payload.referrer.slice(0, 500) : null;

  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const { error: insertError } = await supabase
    .from('waitlist')
    .insert([{ email, source: 'coming-soon', referrer }]);

  if (insertError) {
    const msg = insertError.message || '';
    const isUnique = insertError.code === '23505' || /duplicate key|unique/i.test(msg);
    if (isUnique) {
      return json({ ok: true, alreadySubscribed: true });
    }
    console.error('[waitlist] insert failed:', insertError);
    return json({ error: 'Could not save your email. Please try again.' }, 500);
  }

  const emailResult = await sendEmail({
    to: email,
    subject: "You're on the list — Mornings",
    html: welcomeEmailHtml(email),
    text: `You're on the list.\n\nThanks for pouring in early. We'll email ${email} the moment the first bag of Mornings is ready.\n\nNo spam. No launch noise. Just one slow, honest email when there's something worth brewing.\n\n— The Mornings team`,
  });

  if (!emailResult.ok) {
    console.warn('[waitlist] welcome email failed:', emailResult.error);
  }

  return json({ ok: true, alreadySubscribed: false });
};

export const GET: APIRoute = () =>
  json({ error: 'Method not allowed. POST email to /api/waitlist.' }, 405);
