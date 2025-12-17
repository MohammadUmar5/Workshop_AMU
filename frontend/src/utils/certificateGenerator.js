import { logDelivery, updateDeliveryLog, updateParticipantDeliveryStatus } from '../hooks/useWorkshopDB';

// Feature flag: Set to true to use legacy client-side generation (html-to-image)
const USE_LEGACY = false;

// Import legacy generator if needed

// Server-side generation using Sharp
const generateCertificateServer = async (participant, certificateConfig, workshopId = null) => {
  console.log('🎓 [FRONTEND] Generating certificate via backend...');
  console.log('   → Participant:', participant.name);
  console.log('   → Email:', participant.email);
  console.log('   → Config:', certificateConfig);
  
  try {
    const { certBody, nameFont, sigFont, certTitleFont } = certificateConfig;
    
    console.log('   → Calling backend API: POST http://localhost:4000/api/certificates/generate');
    
    const response = await fetch('http://localhost:4000/api/certificates/generate', {
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

    console.log('   → Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [FRONTEND] Backend certificate generation failed:', errorData);
      throw new Error(errorData.error || 'Failed to generate certificate');
    }

    const result = await response.json();
    console.log('✅ [FRONTEND] Certificate generated and sent!');
    console.log('   → Result:', result);
    return result;
    
  } catch (error) {
    console.error('❌ [FRONTEND] Certificate generation error:', error.message);
    console.error('   → Full error:', error);
    throw error;
  }
};

// Main export: Server-side certificate generation
export const generateAndSendCertificate = async (participant, certificateConfig, workshopId = null) => {
  // Create pending delivery log at START to prevent race conditions
  let deliveryLogId = null;
  if (workshopId && participant.id) {
    console.log('💾 [DATABASE] Creating pending certificate delivery log...');
    const pendingLog = await logDelivery(
      workshopId,
      participant.id,
      'certificate',
      participant.email,
      participant.name,
      'pending'
    );
    deliveryLogId = pendingLog?.data?.id;
    console.log('✅ [DATABASE] Pending certificate log created:', deliveryLogId);
  }
  
  try {
    const result = await generateCertificateServer(participant, certificateConfig, workshopId);
    
    console.log('📊 [FRONTEND] Certificate result:', result);
    
    // Check if backend returned success
    if (!result.success) {
      console.error('❌ [FRONTEND] Backend reported certificate failure');
      throw new Error(result.error || 'Certificate generation failed');
    }
    
    // Update delivery log to sent
    if (workshopId && participant.id) {
      if (deliveryLogId) {
        // Update existing pending log to sent
        console.log('💾 [DATABASE] Updating certificate delivery log to sent...');
        await updateDeliveryLog(deliveryLogId, 'sent', { messageId: result.messageId });
        console.log('✅ [DATABASE] Certificate delivery log updated to sent');
      } else {
        // Fallback: create sent log (shouldn't happen, but safe)
        console.log('💾 [DATABASE] Creating sent certificate log (fallback)...');
        await logDelivery(
          workshopId,
          participant.id,
          'certificate',
          participant.email,
          participant.name,
          'sent',
          { messageId: result.messageId }
        );
      }
      await updateParticipantDeliveryStatus(participant.id, 'certificate', true);
    }
    
    return result;
  } catch (error) {
    console.error('❌ [FRONTEND] Certificate sending failed:', error.message);
    
    // Update delivery log to failed
    if (workshopId && participant.id) {
      if (deliveryLogId) {
        // Update existing pending log to failed
        console.log('💾 [DATABASE] Updating certificate delivery log to failed...');
        await updateDeliveryLog(deliveryLogId, 'failed', { errorMessage: error.message });
        console.log('✅ [DATABASE] Certificate delivery log updated to failed');
      } else {
        // Fallback: create failed log
        console.log('💾 [DATABASE] Creating failed certificate log (fallback)...');
        await logDelivery(
          workshopId,
          participant.id,
          'certificate',
          participant.email,
          participant.name,
          'failed',
          { errorMessage: error.message }
        );
      }
    }
    
    throw error;
  }
};
