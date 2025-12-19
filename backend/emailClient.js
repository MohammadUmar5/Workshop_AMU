// backend/emailClient.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,      // your Gmail address
    pass: process.env.SMTP_PASS       // Gmail App Password (16 chars)
  }
});

// Legacy export for backward compatibility
export const mailer = transporter;

// Optional - verify connection at server startup
export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log("📨 Mailer ready");
  } catch (err) {
    console.error("❌ Mailer error:", err);
  }
};
