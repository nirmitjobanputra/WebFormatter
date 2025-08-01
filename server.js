// Load environment variables from the .env file for local development
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const path = require('path'); // The 'path' module is essential for creating reliable file paths
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
const app = express();
// Render provides its own port via the PORT environment variable.
// We fall back to 3000 for local development.
const PORT = process.env.PORT || 3000;

// --- Initialize Google AI ---
// This setup remains the same.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Middleware ---
// These functions run on every request.
app.use(cors()); // Allows requests from different origins (your frontend).
app.use(express.json()); // Parses incoming JSON request bodies.

// --- SERVE STATIC FILES ---
// This is a crucial step. It tells Express: "If a request comes in for a file,
// look for it inside the 'public' folder."
// This is how your browser gets index.html, and any future CSS or JS files you add.
const publicPath = path.join(__dirname, 'public');
console.log(`Serving static files from: ${publicPath}`); // Debugging log
app.use(express.static(publicPath));

// --- API ROUTES ---
// All your API endpoints must be defined *before* the final catch-all route.
app.post('/api/generate', async (req, res) => {
  console.log('API call received at /api/generate'); // Debugging log
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

// --- CATCH-ALL ROUTE ---
// This is the final and most important piece for fixing "Cannot GET /".
// It MUST be the LAST route defined in your file.
// It tells the server: "If a request has made it this far, it means it didn't match
// any static file or API route. Therefore, it must be a request for the main application.
// Just send back the index.html file and let the frontend handle the routing."
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log(`Catch-all route triggered. Sending file: ${indexPath}`); // Debugging log
  res.sendFile(indexPath);
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});
