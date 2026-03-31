import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendDownloadEmail(
  to: string,
  productName: string,
  downloadUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@wb-incode.pl",
    to,
    subject: `Twój szablon: ${productName} — WB InCode Shop`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px; border-radius: 16px;">
        <h1 style="color: #30e87a; font-size: 24px; margin-bottom: 8px;">Dziękujemy za zakup!</h1>
        <p style="color: #999; margin-bottom: 24px;">Twój szablon <strong style="color: #ededed;">${productName}</strong> jest gotowy do pobrania.</p>
        <a href="${downloadUrl}" style="display: inline-block; background: #30e87a; color: #0a0a0a; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Pobierz szablon
        </a>
        <p style="color: #666; font-size: 13px; margin-top: 24px;">
          Link jest ważny przez 7 dni i można go użyć maksymalnie 5 razy.
        </p>
        <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
        <p style="color: #444; font-size: 12px;">WB InCode Shop — shop.wb-incode.pl</p>
      </div>
    `,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeSubject = escapeHtml(data.subject);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, "<br />");

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@wb-incode.pl",
    to: "technical-support@wb-partners.pl",
    replyTo: data.email,
    subject: `[Kontakt Shop] ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px; border-radius: 16px;">
        <h1 style="color: #30e87a; font-size: 24px; margin-bottom: 8px;">Nowa wiadomość z formularza kontaktowego</h1>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr>
            <td style="color: #999; padding: 8px 0; vertical-align: top; width: 100px;">Imię:</td>
            <td style="color: #ededed; padding: 8px 0;">${safeName}</td>
          </tr>
          <tr>
            <td style="color: #999; padding: 8px 0; vertical-align: top;">Email:</td>
            <td style="color: #ededed; padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #30e87a;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="color: #999; padding: 8px 0; vertical-align: top;">Temat:</td>
            <td style="color: #ededed; padding: 8px 0;">${safeSubject}</td>
          </tr>
        </table>
        <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin-top: 16px;">
          <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">Wiadomość:</p>
          <p style="color: #ededed; margin: 0; line-height: 1.6;">${safeMessage}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
        <p style="color: #444; font-size: 12px;">WB InCode Shop — shop.wb-incode.pl</p>
      </div>
    `,
  });
}

export async function sendContactConfirmation(data: {
  name: string;
  email: string;
  subject: string;
}): Promise<void> {
  const safeName = escapeHtml(data.name);
  const safeSubject = escapeHtml(data.subject);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@wb-incode.pl",
    to: data.email,
    subject: `Potwierdzenie wiadomości: ${data.subject} — WB InCode Shop`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px; border-radius: 16px;">
        <h1 style="color: #30e87a; font-size: 24px; margin-bottom: 8px;">Dziękujemy za wiadomość!</h1>
        <p style="color: #999; margin-bottom: 24px;">
          Cześć <strong style="color: #ededed;">${safeName}</strong>,<br />
          otrzymaliśmy Twoją wiadomość dotyczącą: <strong style="color: #ededed;">${safeSubject}</strong>.
        </p>
        <p style="color: #999; margin-bottom: 24px;">
          Nasz zespół odpowie najszybciej jak to możliwe, zazwyczaj w ciągu 24 godzin w dni robocze.
        </p>
        <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
        <p style="color: #444; font-size: 12px;">WB InCode Shop — shop.wb-incode.pl</p>
      </div>
    `,
  });
}
