import nodemailer from "nodemailer";

export interface IEmailService {
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}

function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (isSmtpConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    if (!this.transporter) {
      console.log("[DEV] E-mail de reset (SMTP não configurado):");
      console.log("  resetLink:", resetLink);
      return;
    }

    const from = process.env.EMAIL_FROM ?? "noreply@local";
    const subject = "Recuperação de senha";
    const text = `Você solicitou a recuperação de senha. Acesse o link abaixo para definir uma nova senha (válido por 30 minutos):\n\n${resetLink}\n\nSe não foi você, ignore este e-mail.`;

    await this.transporter.sendMail({ from, to, subject, text });
  }
}

export const emailService = new EmailService();
