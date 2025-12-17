-- ////////////////////////////////////////////////////////////////////////////////
-- Workshops Table
-- ////////////////////////////////////////////////////////////////////////////////
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(20) CHECK (state IN ('idle', 'active', 'finished')) DEFAULT 'idle',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL,
  certificate_threshold INTEGER DEFAULT 0,
  is_paused BOOLEAN DEFAULT false,
  paused_at TIMESTAMPTZ,
  paused_time_left INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (change later)
CREATE POLICY "Allow all access to workshops" ON workshops
  FOR ALL USING (true);




-- ////////////////////////////////////////////////////////////////////////////////
-- Participants Table
-- ////////////////////////////////////////////////////////////////////////////////
  CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  year VARCHAR(50),
  diet VARCHAR(50),
  
  -- Status
  status VARCHAR(20) CHECK (status IN ('pending', 'admitted', 'left_early', 'absent')) DEFAULT 'pending',
  admitted_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  leave_reason TEXT,
  on_spot BOOLEAN DEFAULT false,
  
  -- Delivery tracking
  certificate_sent BOOLEAN DEFAULT false,
  pass_sent BOOLEAN DEFAULT false,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_participants_workshop ON participants(workshop_id);
CREATE INDEX idx_participants_status ON participants(status);
CREATE INDEX idx_participants_email ON participants(email);

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now
CREATE POLICY "Allow all access to participants" ON participants
  FOR ALL USING (true);


-- // ////////////////////////////////////////////////////////////////////////////////
-- Certificate Templates Table  
-- //////////////////////////////////////////////////////////////////////////////
  CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Content
  title VARCHAR(255) DEFAULT 'Certificate of Participation',
  body TEXT NOT NULL,
  signature VARCHAR(255),
  sig_title1 VARCHAR(255),
  sig_title2 VARCHAR(255),
  
  -- Typography
  name_font VARCHAR(50) DEFAULT 'cursive',
  title_font VARCHAR(50) DEFAULT 'elegant-serif',
  sig_font VARCHAR(50) DEFAULT 'cursive',
  
  -- Colors
  bg_color VARCHAR(7) DEFAULT '#ffffff',
  title_color VARCHAR(7) DEFAULT '#4338ca',
  text_color VARCHAR(7) DEFAULT '#374151',
  border_style VARCHAR(20) DEFAULT 'elegant',
  
  -- Storage
  template_image_url TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active templates
CREATE INDEX idx_cert_templates_active ON certificate_templates(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now
CREATE POLICY "Allow all access to certificate_templates" ON certificate_templates
  FOR ALL USING (true);

-- ////////////////////////////////////////////////////////////////////////////////
-- Pass Templates Table
-- ////////////////////////////////////////////////////////////////////////////////
  CREATE TABLE pass_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Colors
  bg_color VARCHAR(7) DEFAULT '#eff6ff',
  border_color VARCHAR(7) DEFAULT '#60a5fa',
  title_color VARCHAR(7) DEFAULT '#1e3a8a',
  subtitle_color VARCHAR(7) DEFAULT '#1d4ed8',
  text_color VARCHAR(7) DEFAULT '#1f2937',
  highlight_bg_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#4f46e5',
  
  -- Layout
  show_logos BOOLEAN DEFAULT true,
  border_width VARCHAR(10) DEFAULT '2px',
  
  -- Storage
  template_image_url TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active templates
CREATE INDEX idx_pass_templates_active ON pass_templates(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE pass_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now
CREATE POLICY "Allow all access to pass_templates" ON pass_templates
  FOR ALL USING (true);


-- ////////////////////////////////////////////////////////////////////////////////
-- Delivery Logs Table
-- ////////////////////////////////////////////////////////////////////////////////
  CREATE TABLE delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  
  -- Denormalized for quick queries
  participant_email VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  
  -- Delivery metadata
  type VARCHAR(20) CHECK (type IN ('pass', 'certificate')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  
  -- Email metadata
  message_id VARCHAR(255),
  email_provider VARCHAR(50) DEFAULT 'nodemailer'
);

-- Create indexes for performance
CREATE INDEX idx_delivery_logs_participant ON delivery_logs(participant_id);
CREATE INDEX idx_delivery_logs_status ON delivery_logs(status);
CREATE INDEX idx_delivery_logs_type ON delivery_logs(type);
CREATE INDEX idx_delivery_logs_workshop ON delivery_logs(workshop_id);

-- Enable Row Level Security
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now
CREATE POLICY "Allow all access to delivery_logs" ON delivery_logs
  FOR ALL USING (true);


-- ///////////////////////////////////////////////////////////////////////////
-- Function to update updated_at timestamp
-- ///////////////////////////////////////////////////////////////////////////
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to participants table
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to certificate_templates table
CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to pass_templates table
CREATE TRIGGER update_pass_templates_updated_at
  BEFORE UPDATE ON pass_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();