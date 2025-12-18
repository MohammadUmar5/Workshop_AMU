export const sendPassEmail = async (emailData) => {
  console.log('📧 [FRONTEND] Starting to send PASS email...');
  console.log('   → Recipient:', emailData.name, `(${emailData.email})`);
  console.log('   → Attachment size:', emailData.attachmentBase64 ? `${Math.round(emailData.attachmentBase64.length / 1024)}KB` : 'No attachment');
  
  try {
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/send-email`;
    console.log('   → Making API call to backend: POST', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('   → Backend response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [FRONTEND] Backend returned error:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ [FRONTEND] Pass email sent successfully!');
    console.log('   → Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ [FRONTEND] Error sending pass email:', error.message);
    console.error('   → Full error:', error);
    throw error;
  }
};

export const sendCertificateEmail = async (emailData) => {
  console.log('📧 [FRONTEND] Starting to send CERTIFICATE email...');
  console.log('   → Recipient:', emailData.name, `(${emailData.email})`);
  console.log('   → Attachment size:', emailData.attachmentBase64 ? `${Math.round(emailData.attachmentBase64.length / 1024)}KB` : 'No attachment');
  
  try {
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/send-email`;
    console.log('   → Making API call to backend: POST', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('   → Backend response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [FRONTEND] Backend returned error:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ [FRONTEND] Certificate email sent successfully!');
    console.log('   → Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ [FRONTEND] Error sending certificate email:', error.message);
    console.error('   → Full error:', error);
    throw error;
  }
};