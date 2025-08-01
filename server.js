// Load environment variables from the .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
// Initialize Express app
const app = express();
const PORT = 3000; // The port our server will run on

// Initialize the Google AI client with the API key from our .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) to allow our frontend to make requests
app.use(cors());
// Enable the server to understand JSON formatted request bodies
app.use(express.json());

// --- API Endpoint ---
// Define a POST endpoint at /api/generate
app.post('/api/generate', async (req, res) => {
  // Log the incoming request for debugging
  console.log('Received request for /api/generate');

  // Get the 'prompt' from the request body sent by the frontend
  const { prompt } = req.body;

  // Check if a prompt was provided
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    // Send the prompt to the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send the generated text back to the frontend
    res.json({ text });

  } catch (error) {
    // Handle any errors from the API call
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
});

// --- Start the Server ---
// Make the server listen for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
