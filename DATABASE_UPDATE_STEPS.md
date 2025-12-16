# Database Schema Update Instructions

## Overview
This document provides step-by-step instructions to update your Supabase database schema to prevent duplicate delivery logs for certificate and pass sending.

---

## ⚠️ IMPORTANT: When to Apply This Update

Apply this update **ONLY IF** you are experiencing duplicate delivery log entries. The application code has been updated to prevent duplicates at the application level, so this database constraint provides an additional safety layer.

---

## Steps to Update Schema in Supabase Web App

### Step 1: Access SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your **Workshop_AMU** project
3. Click on **SQL Editor** in the left sidebar (or navigate to `https://supabase.com/dashboard/project/<your-project-id>/sql`)

### Step 2: Create Unique Index
Copy and paste the following SQL command into the SQL editor:

```sql
-- Create unique index to prevent duplicate delivery logs
-- This ensures each participant can only have ONE 'sent' log per type per workshop
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_logs_unique 
ON delivery_logs(workshop_id, participant_id, type) 
WHERE status = 'sent';
```

### Step 3: Execute the SQL
1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for confirmation message: `Success. No rows returned`

### Step 4: Verify the Index
Run this verification query to confirm the index was created:

```sql
-- Verify the unique index exists
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'delivery_logs' 
AND indexname = 'idx_delivery_logs_unique';
```

**Expected Result:** You should see one row with:
- `indexname`: `idx_delivery_logs_unique`
- `indexdef`: Contains the CREATE UNIQUE INDEX statement

---

## What This Index Does

### Behavior:
- **Allows multiple 'pending' or 'failed' logs** for the same participant/type/workshop combination
- **Prevents duplicate 'sent' logs** - if you try to insert a second 'sent' log for the same participant/type/workshop, the database will reject it with an error
- **Works alongside application-level duplicate checking** in the `logDelivery()` function

### Example:
```
✅ ALLOWED:
- Workshop A, Participant 1, Certificate, Status: 'pending'
- Workshop A, Participant 1, Certificate, Status: 'sent'
- Workshop A, Participant 1, Certificate, Status: 'failed'
- Workshop A, Participant 1, Pass, Status: 'sent'

❌ BLOCKED:
- Workshop A, Participant 1, Certificate, Status: 'sent'
- Workshop A, Participant 1, Certificate, Status: 'sent'  ← DUPLICATE (rejected)
```

---

## Troubleshooting

### Error: "could not create unique index"
**Cause:** Existing duplicate 'sent' logs in your database

**Solution:**
1. Find duplicates:
   ```sql
   SELECT 
       workshop_id, 
       participant_id, 
       type, 
       COUNT(*) as duplicate_count
   FROM delivery_logs
   WHERE status = 'sent'
   GROUP BY workshop_id, participant_id, type
   HAVING COUNT(*) > 1;
   ```

2. Delete duplicates, keeping only the most recent one:
   ```sql
   -- This keeps the latest 'sent' log and deletes older duplicates
   DELETE FROM delivery_logs
   WHERE id IN (
       SELECT id
       FROM (
           SELECT 
               id,
               ROW_NUMBER() OVER (
                   PARTITION BY workshop_id, participant_id, type 
                   ORDER BY sent_at DESC NULLS LAST, created_at DESC
               ) as rn
           FROM delivery_logs
           WHERE status = 'sent'
       ) t
       WHERE rn > 1
   );
   ```

3. Try creating the index again

---

## Rollback Instructions

If you need to remove this index (not recommended):

```sql
-- Remove the unique index
DROP INDEX IF EXISTS idx_delivery_logs_unique;
```

---

## Testing the Update

After applying the index, test it works correctly:

```sql
-- Test 1: Insert a test 'sent' log (should succeed)
INSERT INTO delivery_logs (
    workshop_id, 
    participant_id, 
    participant_email, 
    participant_name, 
    type, 
    status
) VALUES (
    (SELECT id FROM workshops LIMIT 1),  -- Use existing workshop
    gen_random_uuid(),                    -- Random participant ID
    'test@example.com',
    'Test User',
    'certificate',
    'sent'
);

-- Test 2: Try to insert duplicate (should fail with unique constraint error)
INSERT INTO delivery_logs (
    workshop_id, 
    participant_id, 
    participant_email, 
    participant_name, 
    type, 
    status
) VALUES (
    (SELECT workshop_id FROM delivery_logs WHERE participant_email = 'test@example.com' LIMIT 1),
    (SELECT participant_id FROM delivery_logs WHERE participant_email = 'test@example.com' LIMIT 1),
    'test@example.com',
    'Test User',
    'certificate',
    'sent'
);  -- ❌ Should fail with: "duplicate key value violates unique constraint"

-- Clean up test data
DELETE FROM delivery_logs WHERE participant_email = 'test@example.com';
```

---

## Summary

✅ **What Changed:**
- Added unique index `idx_delivery_logs_unique` on delivery_logs table
- Prevents duplicate 'sent' status logs for same workshop/participant/type combination

✅ **Application Updates Already Applied:**
- CSV import now requires workshop to be started first
- Certificate eligibility changed to 75% attendance rule
- Certificate sending blocked until workshop ends
- Duplicate prevention logic added to `logDelivery()` function
- Old template files automatically deleted on new template save

⚠️ **Action Required:**
1. Open Supabase SQL Editor
2. Run the CREATE UNIQUE INDEX command
3. Verify with the verification query
4. Test with the provided test queries (optional)

---

**Last Updated:** December 16, 2025
**Schema Version:** 1.1
