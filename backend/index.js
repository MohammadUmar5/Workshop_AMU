// backend/index.js
import "dotenv/config";  // Add this at the very top
import express from "express";
import cors from "cors";
import { sendEmail } from "./sendEmail.js";
import { verifyMailer } from "./emailClient.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

verifyMailer(); // Check Gmail SMTP connection

app.post("/api/send-email", sendEmail);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
