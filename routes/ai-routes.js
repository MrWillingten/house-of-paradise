const express = require('express');
const router = express.Router();
const aiService = require('../services/ai-service');

/**
 * GET /api/ai/models
 * Get available AI models
 */
router.get('/models', async (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json({ success: true, models });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/generate
 * Generate text using AI
 * Body: { prompt, model, options }
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.0-flash', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const response = await aiService.generateText(prompt, model, options);
    res.json({ success: true, response, model });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/recommendations
 * Generate travel recommendations
 * Body: { destination, preferences, model }
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { destination, preferences = {}, model = 'gemini-2.0-flash' } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination is required' });
    }

    const recommendations = await aiService.generateTravelRecommendations(
      destination,
      preferences,
      model
    );

    res.json({ success: true, recommendations, destination, model });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/itinerary
 * Generate trip itinerary
 * Body: { destination, days, preferences, model }
 */
router.post('/itinerary', async (req, res) => {
  try {
    const { destination, days, preferences = {}, model = 'gemini-2.0-flash' } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        success: false,
        error: 'Destination and days are required'
      });
    }

    const itinerary = await aiService.generateItinerary(
      destination,
      days,
      preferences,
      model
    );

    res.json({ success: true, itinerary, destination, days, model });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI assistant
 * Body: { messages, model, options }
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-2.0-flash', options = {} } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    const response = await aiService.chat(messages, model, options);
    res.json({ success: true, response, model });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
