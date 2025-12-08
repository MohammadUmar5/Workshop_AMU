import { sendCertificateEmail } from "./emailService";
import { colorPalette } from "../constants/constants";

// Font class mapping helper
const getFontFamily = (fontValue) => {
  const fontMap = {
    cursive: "'Great Vibes', cursive",
    handwriting: "'Dancing Script', cursive",
    "script-pacifico": "'Pacifico', cursive",
    "script-tangerine": "'Tangerine', cursive",
    "handwriting-caveat": "'Caveat', cursive",
    "casual-patrick": "'Patrick Hand', cursive",
    "elegant-serif": "'Playfair Display', serif",
    serif: "'Merriweather', serif",
    "serif-lora": "'Lora', serif",
    "serif-zilla": "'Zilla Slab', serif",
    "serif-old-tt": "'Old Standard TT', serif",
    "serif-arvo": "'Arvo', serif",
    sans: "'Inter', sans-serif",
    "sans-montserrat": "'Montserrat', sans-serif",
    "sans-nunito": "'Nunito', sans-serif",
    mono: "'Roboto Mono', monospace",
  };
  return fontMap[fontValue] || "'Inter', sans-serif";
};
// Generate Google Fonts URLs - matches CertificateComponents.jsx
const generateFontImports = () => {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
  `;
};
// Border style helper
const getBorderStyle = (borderStyle) => {
  if (borderStyle === "double") {
    return `
      <div style="border: 2px solid #6b7280; padding: 8px;">
        <div style="border: 6px solid #4338ca; padding: 32px;">
    `;
  }
  if (borderStyle === "ornate-gold") {
    return `
      <div style="border: 12px double #D4AF37; padding: 32px; background-image: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);">
    `;
  }
  if (borderStyle === "none") {
    return `<div style="padding: 32px;">`;
  }
  // Default 'simple'
  return `<div style="border: 8px solid #3730a3; padding: 32px;">`;
};

const getBorderCloseTag = (borderStyle) => {
  if (borderStyle === "double") {
    return `</div></div>`;
  }
  return `</div>`;
};

// Standalone utility function to generate and send certificate via email
export const generateAndSendCertificate = async (
  participant,
  certificateConfig
) => {
  try {
    const { certBody, nameFont, sigFont, certBg, certBorder, certTitleFont } =
      certificateConfig;

    // Get font families
    const nameFontFamily = getFontFamily(nameFont);
    const sigFontFamily = getFontFamily(sigFont);
    const titleFontFamily = getFontFamily(certTitleFont);
    const bodyFontFamily = "'Merriweather', serif";

    // Get background color
    const bgColorHex =
      colorPalette.find((c) => c.name === certBg)?.hex || "#FFFFFF";

    // Create a temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";

    // Create the certificate card
    const certificate = document.createElement("div");
    certificate.style.cssText = `
      width: 1200px;
      padding: 48px 80px;
      background-color: ${bgColorHex};
      border: 1px solid #d1d5db;
      font-family: ${bodyFontFamily};
    `;

    certificate.innerHTML = `
      ${getBorderStyle(certBorder)}
        <div style="text-align: center;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/7/7c/Logo-aps-no-tagline.svg" 
              alt="APS Logo" 
              style="height: 64px; width: auto;"
            />
            <img 
              src="https://olympiaacademia.github.io/images/logo.png" 
              alt="Olympia Academia Logo" 
              style="height: 80px; width: auto;"
            />
          </div>

          <h1 style="font-size: 48px; font-weight: bold; color: #4338ca; margin-bottom: 24px; font-family: ${titleFontFamily};">
            Certificate of Participation
          </h1>
          
          <p style="font-size: 20px; color: #4b5563; margin-bottom: 32px;">
            This certificate is proudly presented to
          </p>

          <h2 style="font-size: 72px; font-weight: bold; color: #111827; margin-bottom: 32px; font-family: ${nameFontFamily};">
            ${participant.name}
          </h2>

          <p style="font-size: 20px; color: #374151; margin-bottom: 40px; white-space: pre-line; line-height: 1.6;">
            ${certBody}
          </p>

          <div style="display: flex; justify-content: center; margin-top: 64px;">
            <div style="text-align: center; width: 320px;">
              <p style="font-size: 32px; font-weight: 500; color: #1f2937; padding-bottom: 4px; font-family: ${sigFontFamily};">Muneeb Basu</p>
              <hr style="border: 0; border-top: 1px solid #374151; margin: 0;" />
              <p style="font-size: 12px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">President, Olympia Academia, AMU</p>
              <p style="font-size: 12px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.1em;">Student Ambassador, APS</p>
            </div>
          </div>
        </div>
      ${getBorderCloseTag(certBorder)}
    `;

    // Load fonts before generating image
    const fontStyle = document.createElement("style");
    fontStyle.textContent = generateFontImports();
    document.head.appendChild(fontStyle);

    container.appendChild(certificate);
    document.body.appendChild(container);

    // Wait longer for fonts and images to load (3 seconds to ensure fonts are loaded)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate PNG
    const certificateImageBase64 = await window.htmlToImage.toPng(certificate, {
      backgroundColor: bgColorHex,
      pixelRatio: 2,
      cacheBust: true,
      width: 1200,
      height: certificate.offsetHeight || 900,
    });

    // Remove temporary elements
    document.body.removeChild(container);
    document.head.removeChild(fontStyle);

    // Send email with certificate attachment
    await sendCertificateEmail({
      email: participant.email,
      name: participant.name,
      subject: "🎉 Workshop Completion Certificate",
      text: `Dear ${participant.name},\n\nCongratulations on successfully completing the workshop!\n\nYour certificate of participation is attached to this email. We hope you found the workshop valuable and informative.\n\nThank you for your active participation.\n\nBest regards,\nWorkshop Team`,
      html: `
        <p>Dear <strong>${participant.name}</strong>,</p>
        <p>🎉 Congratulations on successfully completing the workshop!</p>
        <p>Your certificate of participation is attached to this email. We hope you found the workshop valuable and informative.</p>
        <p>Thank you for your active participation.</p>
        <p>Best regards,<br><strong>Workshop Team</strong></p>
      `,
      filename: `${participant.name
        .replace(/ /g, "_")
        .toLowerCase()}_certificate.png`,
      attachmentBase64: certificateImageBase64,
    });

    console.log(`Certificate sent to ${participant.email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send certificate to ${participant.email}`, error);
    return false;
  }
};
