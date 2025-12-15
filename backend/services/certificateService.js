import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { transporter } from '../emailClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Font family mapping
const getFontFamily = (fontValue) => {
  const fontMap = {
    'cursive': 'Great Vibes',
    'handwriting': 'Dancing Script',
    'script-pacifico': 'Pacifico',
    'script-tangerine': 'Tangerine',
    'handwriting-caveat': 'Caveat',
    'casual-patrick': 'Patrick Hand',
    'elegant-serif': 'Playfair Display',
    'serif': 'Merriweather',
    'serif-lora': 'Lora',
    'serif-zilla': 'Zilla Slab',
    'serif-old-tt': 'Old Standard TT',
    'serif-arvo': 'Arvo',
    'sans': 'Inter',
    'sans-montserrat': 'Montserrat',
    'sans-nunito': 'Nunito',
    'mono': 'Roboto Mono'
  };
  return fontMap[fontValue] || 'Inter';
};

// Generate certificate with Sharp
export async function generateCertificate({ 
  name, 
  nameFont = 'cursive',
  certBody = 'for successfully participating in our workshop and demonstrating dedication to learning and growth.',
  certTitleFont = 'elegant-serif',
  sigFont = 'handwriting'
}) {
  try {
    // Path to template (will be created next)
    const templatePath = path.join(__dirname, '../templates/certificate-base.png');
    
    // Get font families
    const nameFontFamily = getFontFamily(nameFont);
    const titleFontFamily = getFontFamily(certTitleFont);
    const sigFontFamily = getFontFamily(sigFont);
    
    // Create SVG overlay with text
    // Position coordinates: name at center (x: 600, y: 480)
    // Title at (x: 600, y: 180)
    // Body text at (x: 600, y: 580)
    // Signature at (x: 600, y: 800)
    
    const svgOverlay = `
      <svg width="1200" height="900">
        <defs>
          <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=${nameFontFamily.replace(/ /g, '+')}:wght@700&amp;display=swap');
            @import url('https://fonts.googleapis.com/css2?family=${titleFontFamily.replace(/ /g, '+')}:wght@700&amp;display=swap');
            @import url('https://fonts.googleapis.com/css2?family=${sigFontFamily.replace(/ /g, '+')}:wght@500&amp;display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400&amp;display=swap');
          </style>
        </defs>
        
        <!-- Certificate Title -->
        <text 
          x="600" 
          y="180" 
          text-anchor="middle" 
          font-family="${titleFontFamily}, serif" 
          font-size="48" 
          font-weight="bold"
          fill="#4338ca"
        >Certificate of Participation</text>
        
        <!-- Presented to text -->
        <text 
          x="600" 
          y="240" 
          text-anchor="middle" 
          font-family="Merriweather, serif" 
          font-size="20" 
          fill="#4b5563"
        >This certificate is proudly presented to</text>
        
        <!-- Participant Name -->
        <text 
          x="600" 
          y="340" 
          text-anchor="middle" 
          font-family="${nameFontFamily}, cursive" 
          font-size="72" 
          font-weight="bold"
          fill="#111827"
        >${name}</text>
        
        <!-- Certificate Body (will be wrapped manually if needed) -->
        <text 
          x="600" 
          y="450" 
          text-anchor="middle" 
          font-family="Merriweather, serif" 
          font-size="20" 
          fill="#374151"
        >${certBody.substring(0, 80)}</text>
        
        ${certBody.length > 80 ? `
        <text 
          x="600" 
          y="480" 
          text-anchor="middle" 
          font-family="Merriweather, serif" 
          font-size="20" 
          fill="#374151"
        >${certBody.substring(80, 160)}</text>
        ` : ''}
        
        <!-- Signature Name -->
        <text 
          x="600" 
          y="750" 
          text-anchor="middle" 
          font-family="${sigFontFamily}, cursive" 
          font-size="32" 
          font-weight="500"
          fill="#1f2937"
        >Muneeb Basu</text>
        
        <!-- Signature Line -->
        <line x1="400" y1="760" x2="800" y2="760" stroke="#374151" stroke-width="1"/>
        
        <!-- Signature Titles -->
        <text 
          x="600" 
          y="785" 
          text-anchor="middle" 
          font-family="Inter, sans-serif" 
          font-size="12" 
          fill="#4b5563"
          letter-spacing="0.1em"
        >PRESIDENT, OLYMPIA ACADEMIA, AMU</text>
        
        <text 
          x="600" 
          y="805" 
          text-anchor="middle" 
          font-family="Inter, sans-serif" 
          font-size="12" 
          fill="#4b5563"
          letter-spacing="0.1em"
        >STUDENT AMBASSADOR, APS</text>
      </svg>
    `;
    
    // Generate certificate by compositing SVG on template
    const certificateBuffer = await sharp(templatePath)
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }])
      .png({ quality: 100 })
      .toBuffer();
    
    return certificateBuffer;
    
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw new Error(`Failed to generate certificate: ${error.message}`);
  }
}

// Generate certificate and send via email
export async function generateAndSendCertificate({
  name,
  email,
  nameFont = 'cursive',
  certBody = 'for successfully participating in our workshop and demonstrating dedication to learning and growth.',
  certTitleFont = 'elegant-serif',
  sigFont = 'handwriting'
}) {
  try {
    // Generate the certificate buffer
    const certificateBuffer = await generateCertificate({
      name,
      nameFont,
      certBody,
      certTitleFont,
      sigFont
    });

    // Send email with certificate attachment
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

    await transporter.sendMail(mailOptions);
    console.log(`Certificate sent successfully to ${email}`);
    return { success: true, email };

  } catch (error) {
    console.error(`Failed to send certificate to ${email}:`, error);
    throw new Error(`Failed to send certificate: ${error.message}`);
  }
}
