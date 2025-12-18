import { supabase } from '../supabase';

/**
 * Database operations for Workshop Management
 * These functions maintain existing app logic while adding persistence
 */

// ============================================
// WORKSHOP OPERATIONS
// ============================================

/**
 * Create a new workshop in the database
 * @param {number} durationHours - Workshop duration in hours
 * @param {number} durationMinutes - Workshop duration in minutes
 * @param {number} certificateThreshold - Minutes before end for certificate eligibility
 * @returns {Object} Created workshop record with id
 */
export async function createWorkshop(durationHours, durationMinutes, certificateThreshold) {
  console.log('💾 [DATABASE] Creating new workshop...');
  console.log('   → Duration:', durationHours, 'hours', durationMinutes, 'minutes');
  console.log('   → Certificate threshold:', certificateThreshold, 'minutes');
  
  try {
    const totalMinutes = (durationHours * 60) + durationMinutes;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + totalMinutes * 60000);

    const { data, error } = await supabase
      .from('workshops')
      .insert({
        state: 'active',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: totalMinutes,
        certificate_threshold: certificateThreshold,
        is_paused: false
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ [DATABASE] Workshop created successfully');
    console.log('   → Workshop ID:', data.id);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DATABASE] Failed to create workshop:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Update workshop state (active/paused/finished)
 * @param {string} workshopId - Workshop UUID
 * @param {string} state - New state ('active', 'idle', 'finished')
 * @param {boolean} isPaused - Pause status
 * @returns {Object} Update result
 */
export async function updateWorkshopState(workshopId, state, isPaused = false) {
  try {
    const updates = {
      state,
      is_paused: isPaused
    };

    if (isPaused) {
      updates.paused_at = new Date().toISOString();
    }

    if (state === 'finished') {
      updates.finished_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', workshopId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating workshop state:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get active or finished workshop (for resume functionality)
 * @returns {Object} Active/finished workshop or null
 */
export async function getActiveWorkshop() {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .in('state', ['active', 'finished'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching active workshop:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update workshop end time (when duration is changed)
 * @param {string} workshopId - Workshop UUID
 * @param {Date} endTime - New end time
 * @returns {Object} Update result
 */
export async function updateWorkshopEndTime(workshopId, endTime) {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .update({ end_time: endTime.toISOString() })
      .eq('id', workshopId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating workshop end time:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update paused time left (when pausing timer)
 * @param {string} workshopId - Workshop UUID
 * @param {number|null} timeLeft - Remaining time in seconds (null to clear)
 * @returns {Object} Update result
 */
export async function updatePausedTimeLeft(workshopId, timeLeft) {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .update({ paused_time_left: timeLeft })
      .eq('id', workshopId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating paused time left:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PARTICIPANT OPERATIONS
// ============================================

/**
 * Bulk insert participants from CSV import
 * @param {string} workshopId - Workshop UUID
 * @param {Array} participants - Array of participant objects
 * @returns {Object} Insert result with counts
 */
export async function bulkInsertParticipants(workshopId, participants) {
  console.log('💾 [DATABASE] Bulk inserting participants...');
  console.log('   → Workshop ID:', workshopId);
  console.log('   → Count:', participants.length);
  
  try {
    // Check for existing participants by email to avoid duplicates
    const emails = participants.map(p => p.email);
    const { data: existingParticipants, error: checkError } = await supabase
      .from('participants')
      .select('email')
      .eq('workshop_id', workshopId)
      .in('email', emails);

    if (checkError) throw checkError;

    const existingEmails = new Set(existingParticipants?.map(p => p.email) || []);
    const newParticipants = participants
      .filter(p => !existingEmails.has(p.email))
      .map(p => ({
        workshop_id: workshopId,
        name: p.name,
        email: p.email,
        phone: p.phone || null,
        department: p.department || null,
        year: p.year || null,
        diet: p.diet || null,
        status: 'pending',
        on_spot: false,
        certificate_sent: false,
        pass_sent: false
      }));

    if (newParticipants.length === 0) {
      return { 
        success: true, 
        inserted: 0, 
        skipped: participants.length,
        message: 'All participants already exist' 
      };
    }

    const { data, error } = await supabase
      .from('participants')
      .insert(newParticipants)
      .select();

    if (error) throw error;

    console.log('✅ [DATABASE] Bulk insert complete');
    console.log('   → Inserted:', data.length);
    console.log('   → Skipped:', participants.length - data.length);

    return { 
      success: true, 
      inserted: data.length,
      skipped: participants.length - data.length,
      data 
    };
  } catch (error) {
    console.error('❌ [DATABASE] Bulk insert failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Add a single on-spot participant
 * @param {string} workshopId - Workshop UUID
 * @param {Object} participant - Participant data
 * @returns {Object} Created participant
 */
export async function addOnSpotParticipant(workshopId, participant) {
  try {
    const { data, error } = await supabase
      .from('participants')
      .insert({
        workshop_id: workshopId,
        name: participant.name,
        email: participant.email,
        phone: participant.phone || null,
        department: participant.department || null,
        year: participant.year || null,
        diet: participant.diet || null,
        status: 'admitted',
        admitted_at: new Date().toISOString(),
        on_spot: true,
        certificate_sent: false,
        pass_sent: false
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding on-spot participant:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update participant status (admit, early leave, absent)
 * @param {string} participantId - Participant UUID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional fields to update
 * @returns {Object} Updated participant
 */
export async function updateParticipantStatus(participantId, status, additionalData = {}) {
  console.log('💾 [DATABASE] Updating participant status...');
  console.log('   → Participant ID:', participantId);
  console.log('   → New status:', status);
  
  try {
    const updates = { status, ...additionalData };

    if (status === 'admitted' && !additionalData.admitted_at) {
      updates.admitted_at = new Date().toISOString();
    }

    if (status === 'left_early' && !additionalData.left_at) {
      updates.left_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participantId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ [DATABASE] Participant status updated');
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DATABASE] Failed to update participant status:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all pending participants as absent (when workshop finishes)
 * @param {string} workshopId - Workshop UUID
 * @returns {Object} Update result
 */
export async function markPendingAsAbsent(workshopId) {
  try {
    const { data, error } = await supabase
      .from('participants')
      .update({ status: 'absent' })
      .eq('workshop_id', workshopId)
      .eq('status', 'pending')
      .select();

    if (error) throw error;
    return { success: true, count: data.length, data };
  } catch (error) {
    console.error('Error marking participants as absent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all participants for a workshop
 * @param {string} workshopId - Workshop UUID
 * @returns {Array} Participants array
 */
export async function getWorkshopParticipants(workshopId) {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching participants:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Search participants by name or email
 * @param {string} workshopId - Workshop UUID
 * @param {string} searchTerm - Search string
 * @param {string} status - Filter by status (optional)
 * @returns {Array} Matching participants
 */
export async function searchParticipants(workshopId, searchTerm, status = null) {
  try {
    let query = supabase
      .from('participants')
      .select('*')
      .eq('workshop_id', workshopId);

    if (status) {
      query = query.eq('status', status);
    }

    // Search in name or email
    query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error searching participants:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update participant pass/certificate sent flags
 * @param {string} participantId - Participant UUID
 * @param {string} type - 'pass' or 'certificate'
 * @param {boolean} sent - Sent status
 * @returns {Object} Update result
 */
export async function updateParticipantDeliveryStatus(participantId, type, sent) {
  try {
    const field = type === 'pass' ? 'pass_sent' : 'certificate_sent';
    const { data, error } = await supabase
      .from('participants')
      .update({ [field]: sent })
      .eq('id', participantId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TEMPLATE OPERATIONS
// ============================================

/**
 * DEPRECATED: Certificate templates are now fixed
 * Save or update certificate template
 * @deprecated Certificates now use a fixed template image
 * @param {string} workshopId - Workshop UUID
 * @param {Object} templateConfig - Certificate configuration
 * @returns {Object} Template record
 */
export async function saveCertificateTemplate(workshopId, templateConfig) {
  try {
    // Deactivate existing active templates for this workshop
    await supabase
      .from('certificate_templates')
      .update({ is_active: false })
      .eq('workshop_id', workshopId)
      .eq('is_active', true);

    // Insert new active template
    const { data, error } = await supabase
      .from('certificate_templates')
      .insert({
        workshop_id: workshopId,
        is_active: true,
        title: 'Certificate of Participation',
        body: templateConfig.certBody,
        signature: 'Muneeb Basu',
        sig_title1: 'President, Olympia Academia, AMU',
        sig_title2: 'Student Ambassador, APS',
        name_font: templateConfig.nameFont,
        title_font: templateConfig.certTitleFont,
        sig_font: templateConfig.sigFont,
        bg_color: templateConfig.certBg,
        border_style: templateConfig.certBorder,
        title_color: '#4338ca',
        text_color: '#374151',
        template_image_url: templateConfig.templateImageUrl || null
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving certificate template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * DEPRECATED: Certificate templates are now fixed
 * Get active certificate template for a workshop
 * @deprecated Certificates now use a fixed template image
 * @param {string} workshopId - Workshop UUID
 * @returns {Object} Template configuration
 */
export async function getActiveCertificateTemplate(workshopId) {
  try {
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching certificate template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save or update pass template
 * @param {string} workshopId - Workshop UUID
 * @param {Object} templateConfig - Pass configuration
 * @returns {Object} Template record
 */
export async function savePassTemplate(workshopId, templateConfig) {
  try {
    // Deactivate existing active templates for this workshop
    await supabase
      .from('pass_templates')
      .update({ is_active: false })
      .eq('workshop_id', workshopId)
      .eq('is_active', true);

    // Insert new active template
    const { data, error } = await supabase
      .from('pass_templates')
      .insert({
        workshop_id: workshopId,
        is_active: true,
        bg_color: templateConfig.bgColor || '#eff6ff',
        border_color: templateConfig.borderColor || '#60a5fa',
        title_color: templateConfig.titleColor || '#1e3a8a',
        subtitle_color: templateConfig.subtitleColor || '#1d4ed8',
        text_color: templateConfig.textColor || '#1f2937',
        highlight_bg_color: templateConfig.highlightBgColor || '#ffffff',
        accent_color: templateConfig.accentColor || '#4f46e5',
        show_logos: templateConfig.showLogos !== false,
        border_width: templateConfig.borderWidth || '2px',
        template_image_url: templateConfig.templateImageUrl || null
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving pass template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get active pass template for a workshop
 * @param {string} workshopId - Workshop UUID
 * @returns {Object} Template configuration
 */
export async function getActivePassTemplate(workshopId) {
  try {
    const { data, error } = await supabase
      .from('pass_templates')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching pass template:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DELIVERY LOG OPERATIONS
// ============================================

/**
 * Log email delivery attempt
 * @param {string} workshopId - Workshop UUID
 * @param {string} participantId - Participant UUID
 * @param {string} type - 'pass' or 'certificate'
 * @param {string} email - Participant email
 * @param {string} name - Participant name
 * @param {string} status - 'pending', 'sent', or 'failed'
 * @param {Object} additionalData - Error message, message ID, etc.
 * @returns {Object} Log entry
 */
export async function logDelivery(workshopId, participantId, type, email, name, status, additionalData = {}) {
  try {
    // Check for existing log to prevent duplicates (any status)
    const { data: existing } = await supabase
      .from('delivery_logs')
      .select('id, status')
      .eq('workshop_id', workshopId)
      .eq('participant_id', participantId)
      .eq('type', type)
      .maybeSingle();
    
    if (existing) {
      console.log(`⚠️ Delivery log already exists for ${type} to ${name} (status: ${existing.status})`);
      return { success: true, data: existing, skipped: true };
    }
    
    const logEntry = {
      workshop_id: workshopId,
      participant_id: participantId,
      participant_email: email,
      participant_name: name,
      type,
      status,
      email_provider: 'nodemailer'
    };

    if (status === 'sent') {
      logEntry.sent_at = new Date().toISOString();
      logEntry.message_id = additionalData.messageId || null;
    } else if (status === 'failed') {
      logEntry.failed_at = new Date().toISOString();
      logEntry.error_message = additionalData.errorMessage || null;
    }

    const { data, error } = await supabase
      .from('delivery_logs')
      .insert(logEntry)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error logging delivery:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update delivery log status
 * @param {string} logId - Delivery log UUID
 * @param {string} status - New status ('sent' or 'failed')
 * @param {Object} additionalData - Error message, message ID, etc.
 * @returns {Object} Updated log entry
 */
export async function updateDeliveryLog(logId, status, additionalData = {}) {
  try {
    const updates = { status };

    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
      updates.message_id = additionalData.messageId || null;
    } else if (status === 'failed') {
      updates.failed_at = new Date().toISOString();
      updates.error_message = additionalData.errorMessage || null;
      updates.retry_count = additionalData.retryCount || 0;
      updates.last_retry_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('delivery_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating delivery log:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get delivery statistics for a workshop
 * @param {string} workshopId - Workshop UUID
 * @param {string} type - 'pass' or 'certificate' (optional)
 * @returns {Object} Statistics
 */
export async function getDeliveryStats(workshopId, type = null) {
  try {
    let query = supabase
      .from('delivery_logs')
      .select('status')
      .eq('workshop_id', workshopId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data.length,
      sent: data.filter(log => log.status === 'sent').length,
      failed: data.filter(log => log.status === 'failed').length,
      pending: data.filter(log => log.status === 'pending').length
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching delivery stats:', error);
    return { success: false, error: error.message };
  }
}
