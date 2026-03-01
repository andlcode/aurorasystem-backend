"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
function isSmtpConfigured() {
    return !!(process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS);
}
class EmailService {
    transporter = null;
    constructor() {
        if (isSmtpConfigured()) {
            this.transporter = nodemailer_1.default.createTransport({
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
    async sendPasswordResetEmail(to, resetLink) {
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
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=EmailService.js.map