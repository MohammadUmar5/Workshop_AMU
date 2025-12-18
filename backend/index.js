// backend/index.js
import "dotenv/config"; // Add this at the very top
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./sendEmail.js";
import { verifyMailer } from "./emailClient.js";
import { generateAndSendCertificate } from "./services/certificateService.js";
import { supabase } from "./supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "templates"));
  },
  filename: (req, file, cb) => {
    // Only pass templates are customizable now
    let targetFilename;
    if (req.path.includes("pass")) {
      targetFilename = "pass-base.png";
    } else {
      targetFilename = file.originalname;
    }
    
    // Delete old template file if it exists to prevent overlap
    if (targetFilename !== file.originalname) {
      const oldFilePath = path.join(__dirname, "templates", targetFilename);
      try {
        if (require('fs').existsSync(oldFilePath)) {
          require('fs').unlinkSync(oldFilePath);
          console.log(`🗑️  Deleted old template: ${targetFilename}`);
        }
      } catch (err) {
        console.warn(`⚠️  Could not delete old template: ${err.message}`);
      }
    }
    
    cb(null, targetFilename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

verifyMailer(); // Check Gmail SMTP connection

app.post("/api/send-email", sendEmail);

// Certificate generation endpoint (uses fixed template)
app.post("/api/certificates/generate", async (req, res) => {
  console.log("\n📨 [BACKEND API] Certificate generation request received");
  console.log("   → Name:", req.body.name);
  console.log("   → Email:", req.body.email);

  try {
    const { name, email } = req.body;

    if (!name || !email) {
      console.error("❌ [BACKEND API] Missing required fields");
      return res
        .status(400)
        .json({ success: false, error: "Name and email are required" });
    }

    console.log("   → Calling certificate service with fixed template...");
    // Generate certificate and send email using the service (fixed template)
    const result = await generateAndSendCertificate({ name, email });

    console.log(
      "   → Certificate service result:",
      result.success ? "SUCCESS" : "FAILED"
    );

    if (!result.success) {
      console.error(
        "❌ [BACKEND API] Certificate service failed:",
        result.error
      );
      return res.status(500).json({
        success: false,
        error: result.error || "Certificate generation failed",
      });
    }

    console.log("✅ [BACKEND API] Certificate sent successfully");
    res.json({
      success: true,
      message: "Certificate generated and sent successfully",
      email: result.email,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error(
      "❌ [BACKEND API] Certificate generation error:",
      error.message
    );
    console.error("   → Full error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate certificate",
      details: error.message,
    });
  }
});

// Template upload endpoint (Pass only - certificates use fixed template)
app.post("/api/templates/pass", upload.single("template"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No template file uploaded" });
    }

    const templatePath = path.join("templates", req.file.filename);
    const config = req.body.config ? JSON.parse(req.body.config) : {};

    console.log(`Pass template saved: ${templatePath}`);

    res.json({
      success: true,
      message: "Pass template saved successfully",
      templatePath,
      filename: req.file.filename,
      config,
    });
  } catch (error) {
    console.error("Pass template upload error:", error);
    res.status(500).json({
      error: "Failed to save pass template",
      details: error.message,
    });
  }
});

// ============================================
// DATABASE API ENDPOINTS
// ============================================

// Workshop endpoints
app.post("/api/workshops", async (req, res) => {
  try {
    const { durationMinutes, certificateThreshold, startTime, endTime } =
      req.body;

    const { data, error } = await supabase
      .from("workshops")
      .insert({
        state: "active",
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        certificate_threshold: certificateThreshold,
        is_paused: false,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error creating workshop:", error);
    res
      .status(500)
      .json({ error: "Failed to create workshop", details: error.message });
  }
});

app.patch("/api/workshops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("workshops")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error updating workshop:", error);
    res
      .status(500)
      .json({ error: "Failed to update workshop", details: error.message });
  }
});

app.get("/api/workshops/active", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .eq("state", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching active workshop:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch active workshop",
        details: error.message,
      });
  }
});

// Participant endpoints
app.post("/api/participants/bulk", async (req, res) => {
  try {
    const { workshopId, participants } = req.body;

    // Check for existing participants
    const emails = participants.map((p) => p.email);
    const { data: existingParticipants } = await supabase
      .from("participants")
      .select("email")
      .eq("workshop_id", workshopId)
      .in("email", emails);

    const existingEmails = new Set(
      existingParticipants?.map((p) => p.email) || []
    );
    const newParticipants = participants
      .filter((p) => !existingEmails.has(p.email))
      .map((p) => ({
        workshop_id: workshopId,
        name: p.name,
        email: p.email,
        phone: p.phone || null,
        department: p.department || null,
        year: p.year || null,
        diet: p.diet || null,
        status: "pending",
        on_spot: false,
        certificate_sent: false,
        pass_sent: false,
      }));

    if (newParticipants.length === 0) {
      return res.json({
        success: true,
        inserted: 0,
        skipped: participants.length,
        message: "All participants already exist",
      });
    }

    const { data, error } = await supabase
      .from("participants")
      .insert(newParticipants)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      inserted: data.length,
      skipped: participants.length - data.length,
      data,
    });
  } catch (error) {
    console.error("Error bulk inserting participants:", error);
    res
      .status(500)
      .json({ error: "Failed to insert participants", details: error.message });
  }
});

app.post("/api/participants", async (req, res) => {
  try {
    const participant = req.body;

    const { data, error } = await supabase
      .from("participants")
      .insert(participant)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error adding participant:", error);
    res
      .status(500)
      .json({ error: "Failed to add participant", details: error.message });
  }
});

app.patch("/api/participants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("participants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error updating participant:", error);
    res
      .status(500)
      .json({ error: "Failed to update participant", details: error.message });
  }
});

app.get("/api/participants/:workshopId", async (req, res) => {
  try {
    const { workshopId } = req.params;

    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch participants", details: error.message });
  }
});

// Delivery log endpoints
app.post("/api/delivery-logs", async (req, res) => {
  try {
    const logEntry = req.body;

    const { data, error } = await supabase
      .from("delivery_logs")
      .insert(logEntry)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error logging delivery:", error);
    res
      .status(500)
      .json({ error: "Failed to log delivery", details: error.message });
  }
});

app.patch("/api/delivery-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("delivery_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error updating delivery log:", error);
    res
      .status(500)
      .json({ error: "Failed to update delivery log", details: error.message });
  }
});

app.get("/api/delivery-logs/:workshopId/stats", async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { type } = req.query;

    let query = supabase
      .from("delivery_logs")
      .select("status")
      .eq("workshop_id", workshopId);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data.length,
      sent: data.filter((log) => log.status === "sent").length,
      failed: data.filter((log) => log.status === "failed").length,
      pending: data.filter((log) => log.status === "pending").length,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching delivery stats:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch delivery stats",
        details: error.message,
      });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
