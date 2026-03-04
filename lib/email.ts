import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const recipients = Array.isArray(to) ? to.join(",") : to;
  await transporter.sendMail({
    from: `NOD FLOW Gallery <${process.env.GMAIL_USER}>`,
    to: recipients,
    subject,
    html,
  });
}

export function newsletterTemplate({
  subject,
  body,
  email,
}: {
  subject: string;
  body: string;
  email?: string;
}) {
  const unsubLink = email ? `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(email)}` : "#";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#f5f4f0; font-family: Georgia, serif; }
      .wrap { max-width:600px; margin:0 auto; background:#fff; }
      .header { background:#0a0a0a; padding:40px 48px; }
      .logo { color:#fff; font-size:22px; letter-spacing:0.3em; text-transform:uppercase; }
      .content { padding:48px; color:#1a1a1a; line-height:1.8; font-size:16px; }
      h1 { font-size:28px; margin:0 0 24px; font-weight:400; }
      .footer { background:#f5f4f0; padding:32px 48px; font-size:13px; color:#666; }
      .unsubscribe { color:#888; text-decoration:underline; }
      .btn { display:inline-block; padding:12px 24px; background:#000; color:#fff; text-decoration:none; margin-top:20px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header"><div class="logo">NOD FLOW</div></div>
      <div class="content">
        <h1>${subject}</h1>
        <div>${body.replace(/\n/g, "<br/>")}</div>
      </div>
      <div class="footer">
        <p>NOD FLOW Gallery &mdash; Bucharest, Romania</p>
        <p>© ${new Date().getFullYear()} NOD FLOW. All rights reserved.</p>
        <p style="margin-top:20px;">
            Nu mai vrei aceste emailuri? 
            <a href="${unsubLink}" class="unsubscribe">Dezbonează-te aici</a>.
        </p>
      </div>
    </div>
  </body>
  </html>`;
}
