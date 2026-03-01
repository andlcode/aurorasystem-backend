export interface IEmailService {
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
export declare class EmailService implements IEmailService {
    private transporter;
    constructor();
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=EmailService.d.ts.map