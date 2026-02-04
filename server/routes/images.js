import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate image using DALL-E
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Default prompt if none provided
    const imagePrompt = prompt || 'A beautiful, inspiring abstract image for a vision board, soft colors, artistic, dreamy atmosphere';

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0].url;

    res.json({
      success: true,
      imageUrl,
      revisedPrompt: response.data[0].revised_prompt
    });
  } catch (error) {
    console.error('Image generation error:', error);

    // Handle specific OpenAI errors
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
      error: error.message || 'Failed to generate image'
    });
  }
});

export default router;
