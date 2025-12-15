// backend/index.js
import "dotenv/config";  // Add this at the very top
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./sendEmail.js";
import { verifyMailer } from "./emailClient.js";
import { generateAndSendCertificate } from "./services/certificateService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'templates'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

verifyMailer(); // Check Gmail SMTP connection

app.post("/api/send-email", sendEmail);

// Certificate generation endpoint
app.post("/api/certificates/generate", async (req, res) => {
  try {
    const { name, email, nameFont, certBody, certTitleFont, sigFont } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    
    // Generate certificate and send email using the service
    const result = await generateAndSendCertificate({
      name,
      email,
      nameFont,
      certBody,
      certTitleFont,
      sigFont
    });
    
    res.json({ 
      success: true, 
      message: "Certificate generated and sent successfully",
      email: result.email
    });
    
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate certificate", 
      details: error.message 
    });
  }
});

// Template upload endpoints
app.post("/api/templates/certificate", upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No template file uploaded" });
    }

    const templatePath = path.join('templates', req.file.filename);
    const config = req.body.config ? JSON.parse(req.body.config) : {};

    console.log(`Certificate template saved: ${templatePath}`);
    
    res.json({ 
      success: true, 
      message: "Certificate template saved successfully",
      templatePath,
      filename: req.file.filename,
      config
    });
  } catch (error) {
    console.error("Certificate template upload error:", error);
    res.status(500).json({ 
      error: "Failed to save certificate template", 
      details: error.message 
    });
  }
});

app.post("/api/templates/pass", upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No template file uploaded" });
    }

    const templatePath = path.join('templates', req.file.filename);
    const config = req.body.config ? JSON.parse(req.body.config) : {};

    console.log(`Pass template saved: ${templatePath}`);
    
    res.json({ 
      success: true, 
      message: "Pass template saved successfully",
      templatePath,
      filename: req.file.filename,
      config
    });
  } catch (error) {
    console.error("Pass template upload error:", error);
    res.status(500).json({ 
      error: "Failed to save pass template", 
      details: error.message 
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
