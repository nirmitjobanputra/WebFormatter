// server.js with enhanced logging

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Import the File System module to check if files exist
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// --- DIAGNOSTIC LOGGING ---
console.log("--- Server Initialization ---");
console.log(`Current Working Directory (cwd): ${process.cwd()}`);
console.log(`Directory Name (__dirname): ${__dirname}`);
console.log("---------------------------\n");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

app.use(cors());
app.use(express.json());

// --- SERVE STATIC FILES ---
const publicFolderPath = path.join(__dirname, 'public');
console.log(`[Static Files] Attempting to serve static files from: ${publicFolderPath}`);

// Check if the public folder actually exists
if (fs.existsSync(publicFolderPath)) {
    console.log("[Static Files] 'public' directory FOUND.");
    app.use(express.static(publicFolderPath));
} else {
    console.error("[Static Files] ERROR: 'public' directory NOT FOUND at the expected path.");
}

// --- API ROUTES ---
app.post('/api/generate', async (req, res) => {
  console.log('[API] Request received for /api/generate');
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error('[API] Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
});

// --- CATCH-ALL ROUTE ---
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log(`[Catch-All] Request received for '${req.originalUrl}'. Attempting to send file: ${indexPath}`);

  // Check if index.html exists before trying to send it
  if (fs.existsSync(indexPath)) {
      console.log("[Catch-All] 'index.html' FOUND. Sending file...");
      res.sendFile(indexPath);
  } else {
      console.error("[Catch-All] ERROR: 'index.html' NOT FOUND at the expected path.");
      res.status(404).send("Error: Application entry point (index.html) not found on the server.");
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});
