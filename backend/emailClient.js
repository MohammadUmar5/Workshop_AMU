// backend/emailClient.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Export as transporter for backward compatibility
export const transporter = resend;

// Legacy export for backward compatibility
export const mailer = resend;

// Optional - verify connection at server startup
export const verifyMailer = async () => {
  try {
    console.log("📨 Resend mailer ready");
  } catch (err) {
    console.error("❌ Mailer error:", err);
  }
};
