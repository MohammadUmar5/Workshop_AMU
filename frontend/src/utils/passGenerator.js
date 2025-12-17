import { sendPassEmail } from './emailService';
import { logDelivery, updateDeliveryLog, updateParticipantDeliveryStatus } from '../hooks/useWorkshopDB';
import { supabase } from '../supabase';

// Standalone utility function to generate and send pass via email
export const generateAndSendPass = async (participant, workshopId = null) => {
  console.log('🎫 [FRONTEND] Starting pass generation...');
  console.log('   → Participant:', participant.name);
  console.log('   → Email:', participant.email);
  console.log('   → Workshop ID:', workshopId);
  
  // Check if pass already sent or is being sent (prevents duplicates on refresh during send)
  if (workshopId && participant.id) {
    const { data: existingLog } = await supabase
      .from('delivery_logs')
      .select('id, status')
      .eq('workshop_id', workshopId)
      .eq('participant_id', participant.id)
      .eq('type', 'pass')
      .in('status', ['pending', 'sent'])
      .maybeSingle();
    
    if (existingLog) {
      console.log(`⚠️ Pass already ${existingLog.status} for ${participant.name} - skipping`);
      return true;
    }
  }
  
  // Create pending delivery log at START to prevent race conditions
  let deliveryLogId = null;
  if (workshopId && participant.id) {
    console.log('💾 [DATABASE] Creating pending delivery log...');
    const pendingLog = await logDelivery(
      workshopId,
      participant.id,
      'pass',
      participant.email,
      participant.name,
      'pending'
    );
    deliveryLogId = pendingLog?.data?.id;
    console.log('✅ [DATABASE] Pending log created:', deliveryLogId);
  }
  
  try {
    const admissionTime = participant.admittedAt 
      ? new Date(participant.admittedAt).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true, 
          timeZone: 'Asia/Kolkata' 
        })
      : 'N/A';
    
    console.log('   → Creating pass HTML...');
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    
    // Create the card with proper structure
    const card = document.createElement('div');
    card.style.cssText = `
      width: 800px;
      padding: 24px;
      background-color: #eff6ff;
      border: 2px solid #60a5fa;
      border-radius: 8px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    card.innerHTML = `
      <div style="display: flex; align-items: center; padding-bottom: 16px; border-bottom: 2px solid #bfdbfe; margin-bottom: 20px;">
        <svg style="width: 40px; height: 40px; color: #2563eb; margin-right: 16px; flex-shrink: 0;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #1e3a8a; margin-bottom: 4px;">${participant.name}</div>
          <div style="font-size: 18px; font-weight: 500; color: #1d4ed8;">Has Been Admitted</div>
        </div>
      </div>

      <div style="margin-top: 20px; padding: 16px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <div style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Refreshment Preference</div>
        <div style="display: flex; align-items: center; font-size: 24px; font-weight: bold; color: #4f46e5;">
          <span style="margin-right: 12px;">☕</span>
          <span>${participant.diet || 'Not Specified'}</span>
        </div>
      </div>

      <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; color: #1f2937; font-size: 16px;">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 12px; font-size: 20px;">🏢</span>
          <strong>${participant.department}</strong>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 12px; font-size: 20px;">📚</span>
          <span>Year: <b>${participant.year}</b></span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 12px; font-size: 20px;">📞</span>
          <span>${participant.phone}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 12px; font-size: 20px;">✉️</span>
          <span style="word-break: break-all; overflow-wrap: break-word;">${participant.email}</span>
        </div>
        <div style="display: flex; align-items: center; grid-column: 1 / -1;">
          <span style="margin-right: 12px; font-size: 20px;">🕐</span>
          <span>Admitted at: <b>${admissionTime}</b></span>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #bfdbfe; display: flex; align-items: center; justify-content: space-between;">
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/7/7c/Logo-aps-no-tagline.svg" 
          alt="APS Logo" 
          style="height: 36px; width: auto;"
        />
        <img 
          src="https://olympiaacademia.github.io/images/logo.png" 
          alt="Olympia Academia Logo" 
          style="height: 40px; width: auto;"
        />
      </div>
    `;
    
    container.appendChild(card);
    document.body.appendChild(container);
    
    // Wait longer for images and fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('   → Converting HTML to image...');
    // Generate PNG
    const passImageBase64 = await window.htmlToImage.toPng(card, {
      backgroundColor: '#eff6ff',
      pixelRatio: 2,
      cacheBust: true,
      width: 800,
      height: card.offsetHeight || 600
    });
    
    console.log('   → Pass image generated successfully');
    console.log('   → Image size:', passImageBase64.length, 'bytes');
    
    // Remove temporary element
    document.body.removeChild(container);
    
    console.log('   → Sending pass email...');
    // Send email with attachment
    const emailResult = await sendPassEmail({
      email: participant.email,
      name: participant.name,
      subject: 'Workshop Check-in Confirmation - Your Pass',
      text: `Hello ${participant.name},\n\nThank you for checking in to the workshop!\n\nYour workshop pass is attached to this email. Please keep it for your records.\n\nWorkshop Details:\n- Department: ${participant.department}\n- Year: ${participant.year}\n- Refreshment: ${participant.diet || 'Not Specified'}\n- Admission Time: ${admissionTime}\n\nBest regards,\nWorkshop Team`,
      html: `
        <p>Hello <strong>${participant.name}</strong>,</p>
        <p>Thank you for checking in to the workshop!</p>
        <p>Your workshop pass is attached to this email. Please keep it for your records.</p>
        <h3>Workshop Details:</h3>
        <ul>
          <li><strong>Department:</strong> ${participant.department}</li>
          <li><strong>Year:</strong> ${participant.year}</li>
          <li><strong>Refreshment:</strong> ${participant.diet || 'Not Specified'}</li>
          <li><strong>Admission Time:</strong> ${admissionTime}</li>
        </ul>
        <p>Best regards,<br><strong>Workshop Team</strong></p>
      `,
      filename: `${participant.name.replace(/ /g, '_').toLowerCase()}_workshop_pass.png`,
      attachmentBase64: passImageBase64
    });

    console.log('✅ [FRONTEND] Pass sent successfully!');
    
    // Update delivery log to sent
    if (workshopId && participant.id) {
      if (deliveryLogId) {
        // Update existing pending log to sent
        console.log('💾 [DATABASE] Updating delivery log to sent...');
        await updateDeliveryLog(deliveryLogId, 'sent', { messageId: emailResult.messageId });
        console.log('✅ [DATABASE] Delivery log updated to sent');
      } else {
        // Fallback: create sent log (shouldn't happen, but safe)
        console.log('💾 [DATABASE] Creating sent log (fallback)...');
        await logDelivery(
          workshopId,
          participant.id,
          'pass',
          participant.email,
          participant.name,
          'sent',
          { messageId: emailResult.messageId }
        );
      }
      await updateParticipantDeliveryStatus(participant.id, 'pass', true);
    }
    
    return true;
  } catch (error) {
    console.error('❌ [FRONTEND] Pass generation/sending failed:', error.message);
    console.error('   → Full error:', error);
    
    // Update delivery log to failed
    if (workshopId && participant.id) {
      if (deliveryLogId) {
        // Update existing pending log to failed
        console.log('💾 [DATABASE] Updating delivery log to failed...');
        await updateDeliveryLog(deliveryLogId, 'failed', { errorMessage: error.message });
        console.log('✅ [DATABASE] Delivery log updated to failed');
      } else {
        // Fallback: create failed log
        console.log('💾 [DATABASE] Creating failed log (fallback)...');
        await logDelivery(
          workshopId,
          participant.id,
          'pass',
          participant.email,
          participant.name,
          'failed',
          { errorMessage: error.message }
        );
      }
    }
    
    return false;
  }
};