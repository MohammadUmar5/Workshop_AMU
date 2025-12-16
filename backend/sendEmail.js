// backend/sendEmail.js
import { mailer } from "./emailClient.js";

export async function sendEmail(req, res) {
  console.log('\n📨 [BACKEND] Received email send request');
  console.log('   → To:', req.body.email);
  console.log('   → Name:', req.body.name);
  console.log('   → Subject:', req.body.subject);
  console.log('   → Has attachment:', !!req.body.attachmentBase64);
  
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
      console.error('❌ [BACKEND] Missing required fields');
      console.error('   → email:', !!email, 'subject:', !!subject, 'text:', !!text);
      return res.status(400).json({ ok: false, error: "Missing required fields (email, subject, or text)" });
    }

    console.log('   → Preparing email with nodemailer...');
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

    console.log('   → Sending email via SMTP...');
    console.log('   → SMTP User:', process.env.SMTP_USER);
    console.log('   → SMTP configured:', !!process.env.SMTP_PASS);
    
    const info = await mailer.sendMail(mailOptions);

    console.log('✅ [BACKEND] Email sent successfully!');
    console.log('   → Message ID:', info.messageId);
    console.log('   → Response:', info.response);

    return res.json({
      ok: true,
      email,
      messageId: info.messageId
    });

  } catch (err) {
    console.error('❌ [BACKEND] Email send error:', err.message);
    console.error('   → Error code:', err.code);
    console.error('   → Error response:', err.response);
    console.error('   → Full error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
