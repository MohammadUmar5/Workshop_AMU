import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { transporter } from '../emailClient.js';
import { createCanvas } from 'canvas';  // ADD THIS LINE

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Font family mapping - UPDATE THIS to use actual font names
const getFontFamily = (fontValue) => {
  const fontMap = {
    'cursive': 'Great Vibes',              // ✅ Now installed
    'handwriting': 'Dancing Script',       // ✅ Now installed
    'script-pacifico': 'Pacifico',         // ✅ Now installed
    'script-tangerine': 'Tangerine',       // ✅ Now installed
    'handwriting-caveat': 'Caveat',        // ✅ Now installed
    'casual-patrick': 'Patrick Hand',      // ✅ Now installed
    'elegant-serif': 'Playfair Display',   // ✅ Now installed
    'serif': 'Merriweather',               // ✅ Now installed
    'serif-lora': 'Lora',                  // ✅ Now installed
    'serif-zilla': 'Zilla Slab',           // ✅ Now installed
    'serif-old-tt': 'Old Standard TT',     // ✅ Now installed
    'serif-arvo': 'Arvo',                  // ✅ Now installed
    'sans': 'Noto Sans',                   // ✅ Already installed
    'sans-montserrat': 'Montserrat',       // ✅ Now installed
    'sans-nunito': 'Nunito',               // ✅ Now installed
    'mono': 'Roboto Mono'                  // ✅ From fonts-roboto
  };
  return fontMap[fontValue] || 'Noto Sans';
};

// Certificate generation with fixed template and fonts
export async function generateCertificate({ name }) {
  // Fixed configuration - no longer customizable
  const nameFont = 'sans';
  const certBody = 'for successfully participating in our workshop and demonstrating dedication to learning and growth.';
  const certTitleFont = 'elegant-serif';
  const sigFont = 'handwriting';
  try {
    const templatePath = path.join(__dirname, '../templates/certificate-base.png');
    
    console.log(`   → Loading template: ${templatePath}`);
    console.log(`   → Participant name: "${name}"`);
    console.log(`   → Font: ${nameFont} → ${getFontFamily(nameFont)}`);
    
    // Load template to get dimensions
    const template = sharp(templatePath);
    const metadata = await template.metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    console.log(`   → Template dimensions: ${width}x${height}`);
    
    // Template is 2x size (2400x1800), so all measurements must be doubled
    const scale = width / 1200;  // Calculate scale factor (should be 2)
    console.log(`   → Scale factor: ${scale}x`);
    
    // Create transparent canvas for text
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Configure text rendering (scale font size)
    const fontSize = 50 * scale;  // 72px base * 2 for display * scale
    const fontFamily = getFontFamily(nameFont);
    ctx.font = `normal ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate Y position for 2x template
    // Frontend layout: 60px padding + ~140px title + ~80px subtitle = ~280px
    // Double for 2x: 280 * 2 = 560
    // Add half of name space (112px / 2 * 2 = 112): 560 + 112 = 672
    const textX = width / 2;
    const textY = 405 * scale;  // Position accounting for scale
    
    console.log(`   → Drawing text at position (${textX}, ${textY}) with font size ${fontSize}px`);
    ctx.fillText(name, textX, textY);
    
    // Convert canvas to buffer
    const textBuffer = canvas.toBuffer('image/png');
    
    console.log('   → Compositing text onto template...');
    
    // Composite text onto template
    const certificateBuffer = await template
      .composite([{
        input: textBuffer,
        top: 0,
        left: 0,
        blend: 'over'
      }])
      .png({ quality: 100 })
      .toBuffer();
    
    console.log('✅ Certificate generated successfully');
    return certificateBuffer;
    
  } catch (error) {
    console.error('❌ Certificate generation error:', error);
    throw new Error(`Failed to generate certificate: ${error.message}`);
  }
}

// Generate and send certificate with fixed template
export async function generateAndSendCertificate({ name, email }) {
  console.log('\n🎓 [BACKEND] Certificate generation request');
  console.log('   → Name:', name);
  console.log('   → Email:', email);
  console.log('   → Using fixed template with default fonts');
  
  try {
    console.log('   → Generating certificate image with Sharp...');
    const certificateBuffer = await generateCertificate({ name });

    console.log('   → Certificate image generated successfully');
    console.log('   → Preparing email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_USER,
      to: email,
      subject: 'Workshop Certificate of Participation',
      text: `Dear ${name},\n\nCongratulations on completing the workshop!\n\nPlease find attached your Certificate of Participation. We hope you found the workshop valuable and look forward to seeing you at future events.\n\nBest regards,\nWorkshop Team\nOlympia Academia, AMU`,
      html: `
        <p>Dear <strong>${name}</strong>,</p>
        <p>Congratulations on completing the workshop!</p>
        <p>Please find attached your <strong>Certificate of Participation</strong>. We hope you found the workshop valuable and look forward to seeing you at future events.</p>
        <br>
        <p>Best regards,<br>
        <strong>Workshop Team</strong><br>
        Olympia Academia, AMU</p>
      `,
      attachments: [
        {
          filename: `${name.replace(/ /g, '_')}_Certificate.png`,
          content: certificateBuffer,
          contentType: 'image/png'
        }
      ]
    };

    console.log('   → Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [BACKEND] Certificate sent successfully!');
    console.log('   → Message ID:', info.messageId);
    console.log('   → To:', email);
    
    return { 
      success: true, 
      email,
      messageId: info.messageId,
      response: info.response 
    };

  } catch (error) {
    console.error('❌ [BACKEND] Certificate generation/send failed');
    console.error('   → Error:', error.message);
    console.error('   → To:', email);
    console.error('   → Full error:', error);
    
    return {
      success: false,
      email,
      error: error.message
    };
  }
}
