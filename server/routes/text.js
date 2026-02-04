import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate text using GPT
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a prompt for text generation'
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides concise, well-formatted responses suitable for a vision board note. Keep responses focused, inspiring, and easy to read.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const generatedText = response.choices[0].message.content;

    res.json({
      success: true,
      text: generatedText
    });
  } catch (error) {
    console.error('Text generation error:', error);

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        success: false,
        error: 'Invalid OpenAI API key. Please check your configuration.'
      });
    }

    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        error: 'OpenAI API quota exceeded. Please check your billing.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate text'
    });
  }
});

export default router;
