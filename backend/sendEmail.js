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

    console.log('   → Preparing email with Resend...');
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject,
      text,
      html,
      attachments: attachmentBase64
        ? [
            {
              filename,
              content: attachmentBase64.split(",")[1] // remove prefix if present
            }
          ]
        : []
    };

    console.log('   → Sending email via Resend...');
    console.log('   → From:', mailOptions.from);
    console.log('   → Resend API configured:', !!process.env.RESEND_API_KEY);
    
    const info = await mailer.emails.send(mailOptions);

    console.log('✅ [BACKEND] Email sent successfully!');
    console.log('   → Message ID:', info.id);

    return res.json({
      ok: true,
      email,
      messageId: info.id
    });

  } catch (err) {
    console.error('❌ [BACKEND] Email send error:', err.message);
    console.error('   → Error code:', err.code);
    console.error('   → Error response:', err.response);
    console.error('   → Full error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
