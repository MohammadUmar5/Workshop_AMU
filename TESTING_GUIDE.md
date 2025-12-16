# Email & Database Integration Testing Guide

## 🔧 Setup Check

### 1. Verify Backend Environment Variables
Check that `backend/.env` has:
```
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
```

### 2. Start Backend Server
```bash
cd backend
npm start
```

**Expected Output:**
```
📨 Mailer ready
Server running on port 4000
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

---

## 📊 Testing Workflow

### **Step 1: Import CSV**
1. Click "Import CSV" button in dashboard
2. Select your CSV file

**Browser Console - Expected Logs:**
```
📋 [WORKFLOW] Step 1: Importing CSV file...
   → File name: participants.csv
   → File size: 1234 bytes
   → Parsing CSV data...
   → Parsed 25 participants
💾 [DATABASE] Bulk inserting participants...
   → Workshop ID: abc-123
   → Count: 25
✅ [DATABASE] Bulk insert complete
   → Inserted: 25
   → Skipped: 0
```

---

### **Step 2: Start Workshop**
1. Set duration (e.g., 2 hours 30 minutes)
2. Click "Start Workshop"

**Browser Console - Expected Logs:**
```
🚀 [WORKFLOW] Step 2: Starting workshop...
   → Duration: 2 hours 30 minutes
   → Certificate threshold: 0 minutes
   → Workshop will end at: 12/16/2025, 3:30:00 PM
💾 [DATABASE] Creating new workshop...
✅ [DATABASE] Workshop created successfully
   → Workshop ID: workshop-uuid-here
✅ [WORKFLOW] Workshop started successfully!
```

---

### **Step 3a: Check-in Participant**
1. Go to "Check-in" view
2. Search for participant
3. Click "Admit"

**Browser Console - Expected Logs:**
```
👤 [WORKFLOW] Step 3a: Check-in participant...
   → Participant ID: participant-uuid
💾 [DATABASE] Updating participant status...
   → Participant ID: participant-uuid
   → New status: admitted
✅ [DATABASE] Participant status updated

🎫 [FRONTEND] Starting pass generation...
   → Participant: John Doe
   → Email: john@example.com
   → Workshop ID: workshop-uuid
   → Creating pass HTML...
   → Converting HTML to image...
   → Pass image generated successfully
   → Image size: 123456 bytes
   → Sending pass email...

📧 [FRONTEND] Starting to send PASS email...
   → Recipient: John Doe (john@example.com)
   → Attachment size: 120KB
   → Making API call to backend: POST http://localhost:4000/api/send-email
   → Backend response status: 200 OK
✅ [FRONTEND] Pass email sent successfully!
   → Message ID: <message-id@gmail.com>

💾 [DATABASE] Logging pass delivery...
✅ [DATABASE] Pass delivery logged
```

**Backend Console - Expected Logs:**
```
📨 [BACKEND] Received email send request
   → To: john@example.com
   → Name: John Doe
   → Subject: Workshop Check-in Confirmation - Your Pass
   → Has attachment: true
   → Preparing email with nodemailer...
   → Sending email via SMTP...
   → SMTP User: your-gmail@gmail.com
   → SMTP configured: true
✅ [BACKEND] Email sent successfully!
   → Message ID: <message-id@gmail.com>
   → Response: 250 OK
```

---

### **Step 3b: On-Spot Registration**
1. Go to "On-Spot" tab
2. Fill in participant details
3. Click "Register & Admit"

**Expected Logs:** Same as Step 3a, but with prefix:
```
👤 [WORKFLOW] Step 3b: On-spot registration...
   → Name: Jane Smith
   → Email: jane@example.com
```

---

### **Step 3c: Mark Early Leave**
1. Go to "Early Leave" view
2. Search for admitted participant
3. Enter reason and submit

**Browser Console - Expected Logs:**
```
👤 [WORKFLOW] Step 3c: Mark early leave...
   → Name: John Doe
   → Reason: Family emergency
💾 [DATABASE] Updating participant status...
   → Participant ID: participant-uuid
   → New status: left_early
✅ [DATABASE] Participant status updated
```

---

### **Step 4: Customize Templates** (Optional)
1. Go to "Certificates" view
2. Click "Customize Certificate" or "Customize Pass"
3. Make changes
4. Click "Save Template"

**Browser Console - Expected Logs:**
```
💾 [DATABASE] Logging certificate template save...
✅ [DATABASE] Template saved to database
```

---

### **Step 5: Send Certificates**
1. Wait for workshop to finish (or manually set workshop to finished for testing)
2. Click "Send All Certificates"
3. Confirm in modal

**Browser Console - Expected Logs:**
```
🎓 [WORKFLOW] Step 5: Sending certificates with manual approval...
Starting to send certificates to 3 pending participants...

🎓 [FRONTEND] Generating certificate via backend...
   → Participant: John Doe
   → Email: john@example.com
   → Calling backend API: POST http://localhost:4000/api/certificates/generate
   → Backend response status: 200
✅ [FRONTEND] Certificate generated and sent!
📊 [FRONTEND] Certificate result: {success: true, email: "john@example.com"}
💾 [DATABASE] Logging certificate delivery...
✅ [DATABASE] Certificate delivery logged

Certificate sending complete: 3 sent, 0 failed
```

**Backend Console - Expected Logs:**
```
📨 [BACKEND API] Certificate generation request received
   → Name: John Doe
   → Email: john@example.com
   → Calling certificate service...

🎓 [BACKEND] Certificate generation request
   → Name: John Doe
   → Email: john@example.com
   → Fonts - Name: cursive Title: elegant-serif Sig: cursive
   → Generating certificate image with Sharp...
   → Certificate image generated successfully
   → Preparing email...
   → Sending email via SMTP...
✅ [BACKEND] Certificate sent successfully!
   → Message ID: <message-id@gmail.com>
   → To: john@example.com

   → Certificate service result: SUCCESS
✅ [BACKEND API] Certificate sent successfully
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" or Network Error
**Cause:** Backend not running or wrong URL

**Solution:**
- Make sure backend is running on port 4000
- Check console for "Server running on port 4000"
- Verify URLs in code use `http://localhost:4000`

---

### Issue 2: "Email send error: Invalid login"
**Cause:** Wrong Gmail credentials or App Password not set

**Solution:**
1. Go to Google Account → Security → 2-Step Verification
2. Generate new App Password (16 characters)
3. Update `SMTP_PASS` in `backend/.env`
4. Restart backend server

---

### Issue 3: Pass/Certificate images not generating
**Cause:** `html-to-image` library not loaded

**Solution:**
- Check browser console for script loading errors
- Wait 2-3 seconds after page load before admitting
- Check Network tab for `html-to-image.js` (should be 200 OK)

---

### Issue 4: Database errors
**Cause:** Supabase connection issue or table not created

**Solution:**
1. Check Supabase project is active
2. Verify `frontend/src/supabase.js` and `backend/supabase.js` have correct URL and keys
3. Run SQL script from `frontend/src/supabase.sql` in Supabase SQL Editor

---

## ✅ Success Indicators

### Passes Sent Successfully:
- ✅ Browser console shows "✅ [FRONTEND] Pass email sent successfully!"
- ✅ Backend console shows "✅ [BACKEND] Email sent successfully!"
- ✅ Participant receives email with pass PNG attachment
- ✅ `delivery_logs` table has entry with `status = 'sent'`
- ✅ `participants` table has `pass_sent = true`

### Certificates Sent Successfully:
- ✅ Browser console shows "✅ [FRONTEND] Certificate generated and sent!"
- ✅ Backend console shows "✅ [BACKEND] Certificate sent successfully!"
- ✅ Participant receives email with certificate PNG attachment
- ✅ `delivery_logs` table has entry with `status = 'sent'` and `type = 'certificate'`
- ✅ `participants` table has `certificate_sent = true`

---

## 🔍 Debugging Tips

1. **Always check BOTH browser AND backend consoles**
2. **Look for emojis:** 📧 ✅ ❌ 💾 🎓 🎫 👤 - they indicate different stages
3. **Follow the flow:** Frontend → Backend → Email Provider → Database
4. **Check Message IDs:** Successful emails have a message ID
5. **Verify database:** Use Supabase dashboard to check tables after operations

---

## 📧 Email Verification

After sending, check:
1. **Gmail Sent folder** - Email should appear there
2. **Recipient inbox** - May take 10-30 seconds
3. **Spam folder** - First-time senders often land here
4. **Attachment** - Should be PNG image that opens properly

---

## 🎯 Quick Test Checklist

- [ ] Backend starts with "📨 Mailer ready"
- [ ] Frontend connects without CORS errors
- [ ] CSV imports successfully
- [ ] Workshop creates in database
- [ ] Participant admission works
- [ ] Pass email sends and arrives
- [ ] Early leave updates database
- [ ] Certificate email sends and arrives
- [ ] All operations logged in console
- [ ] Database tables updated correctly

---

**All logs use clear, simple language - even non-technical users can understand the flow by reading console messages!**
