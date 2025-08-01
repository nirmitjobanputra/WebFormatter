// Load environment variables from the .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoint ---
// IMPORTANT: API routes must be defined BEFORE the static file routes and catch-all.
app.post('/api/generate', async (req, res) => {
  console.log('Received request for /api/generate');
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
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
});

// --- Serve Static Frontend Files ---
// This tells Express to serve any static assets from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Catch-all Route for Frontend ---
// This MUST be the last route. It sends the index.html file for any GET request
// that doesn't match an API route or a static file.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
