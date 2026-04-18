const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not set' };
  }

  const body = {
    from: input.from ?? 'Mornings <onboarding@resend.dev>',
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: input.replyTo,
  };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${text}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}

export function welcomeEmailHtml(email: string): string {
  const safeEmail = email.replace(/[<>&"]/g, '');
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf3e7;font-family:Georgia,serif;color:#3e2a1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf3e7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fdf9f1;border:1px solid #e9d3ae;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 8px 40px;">
                <div style="font-family:Georgia,'Playfair Display',serif;font-weight:700;font-size:28px;letter-spacing:-0.02em;color:#3e2a1f;">Mornings</div>
                <div style="font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#8a5a3b;margin-top:4px;">Coffee, slowly</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 0 40px;">
                <h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.25;margin:24px 0 12px 0;color:#3e2a1f;">You're on the list.</h1>
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px 0;color:#553424;">
                  Thanks for pouring in early. We're roasting small batches of single-origin
                  beans meant for the quiet half of the day &mdash; and we'll email <strong>${safeEmail}</strong>
                  the moment the first bag is ready.
                </p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 24px 0;color:#553424;">
                  No spam. No launch noise. Just one slow, honest email when there's something worth brewing.
                </p>
                <div style="border-top:1px solid #e9d3ae;margin:24px 0;"></div>
                <p style="font-size:13px;line-height:1.5;color:#8a5a3b;margin:0;">
                  Sent with care from the Mornings team.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 32px 40px;">
                <p style="font-size:11px;color:#8a5a3b;margin:0;">
                  You're getting this because you signed up at mornings.coffee. Reply to unsubscribe.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
