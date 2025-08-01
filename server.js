// Load environment variables from the .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const path = require('path'); // Import the 'path' module
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000; // Use port from environment or 3000

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Serve Static Frontend Files ---
// This tells Express to serve all static files (like index.html, css, etc.) from the root directory
app.use(express.static(path.join(__dirname, '')));

// --- API Endpoint ---
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

// --- Catch-all Route for Frontend ---
// This route handler must be placed after all other API routes.
// It sends the index.html file for any GET request that isn't an API call.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
