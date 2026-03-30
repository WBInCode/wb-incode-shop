import nodemailer from "nodemailer";

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
