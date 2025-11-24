// backend/sendEmail.js
import { mailer } from "./emailClient.js";

export async function sendEmail(req, res) {
  try {
    const {
      email,
      name,
      subject,
      text,
      html,
      filename,
      attachmentBase64
    } = req.body;

    if (!email || !subject || !text) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const mailOptions = {
      from: `"Workshop Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
      html,
      attachments: attachmentBase64
        ? [
            {
              filename,
              content: attachmentBase64.split(",")[1], // remove prefix if present
              encoding: "base64"
            }
          ]
        : []
    };

    const info = await mailer.sendMail(mailOptions);

    return res.json({
      ok: true,
      email,
      messageId: info.messageId
    });

  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
