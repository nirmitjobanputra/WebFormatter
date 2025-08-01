require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// It's good practice to check if the API key is present on startup
if (!process.env.GOOGLE_API_KEY) {
    console.error("CRITICAL ERROR: GOOGLE_API_KEY is not set in the environment variables.");
    process.exit(1); // Exit if the key is missing
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- Serve Static Files ---
// This tells Express to serve any static files (like your index.html, css, etc.)
// from the root project directory.
app.use(express.static(__dirname));

// --- API Routes ---
// This is the proxy endpoint that the frontend will call.
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text }); // Send the AI's response back to the frontend
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
});

// --- Catch-all Route ---
// This is crucial for single-page applications (SPAs). It ensures that any request
// that doesn't match a static file or the API route above will be served your main
// index.html file. This allows your frontend to handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});