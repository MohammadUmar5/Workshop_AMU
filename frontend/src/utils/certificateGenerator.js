// Feature flag: Set to true to use legacy client-side generation (html-to-image)
const USE_LEGACY = false;

// Import legacy generator if needed
import { generateAndSendCertificate as generateLegacy } from './certificateGeneratorLegacy.js';

// New server-side generation using Sharp
const generateCertificateServer = async (participant, certificateConfig) => {
  try {
    const { certBody, nameFont, sigFont, certTitleFont } = certificateConfig;
    
    const response = await fetch('/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: participant.name,
        email: participant.email,
        nameFont: nameFont,
        certBody: certBody,
        certTitleFont: certTitleFont,
        sigFont: sigFont
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate certificate');
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Server-side certificate generation failed:', error);
    throw error;
  }
};

// Main export: Router function that chooses between server-side and legacy
export const generateAndSendCertificate = async (participant, certificateConfig) => {
  if (USE_LEGACY) {
    // Use legacy client-side html-to-image generation
    return await generateLegacy(participant, certificateConfig);
  } else {
    // Use new server-side Sharp generation
    return await generateCertificateServer(participant, certificateConfig);
  }
};
