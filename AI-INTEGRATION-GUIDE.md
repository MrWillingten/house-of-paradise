# AI Integration Guide - Claude, Gemini & OpenAI

This project now supports **Anthropic Claude**, **Google Gemini**, and **OpenAI GPT** models for intelligent travel recommendations, itinerary generation, and chat assistance.

## 🚀 Available Models

### Anthropic Claude Models 🆕
- **Claude Opus 4.5** (`claude-opus-4.5`) - Most intelligent Claude model, 200K tokens
- **Claude Sonnet 4.5** (`claude-sonnet-4.5`) - Balanced intelligence and speed, 200K tokens
- **Claude Sonnet 3.5** (`claude-sonnet-3.5`) - Previous Sonnet version, 200K tokens
- **Claude Haiku 3.5** (`claude-haiku-3.5`) - Fastest Claude model, 200K tokens
- **Claude Opus 3** (`claude-opus-3`) - Previous Opus version, 200K tokens

### Google Gemini Models
- **Gemini 2.0 Flash Experimental** (`gemini-2.0-flash-exp`) - ⚡ Latest experimental model
- **Gemini 1.5 Pro** (`gemini-1.5-pro`) - Most capable, 2M token context
- **Gemini 1.5 Flash** (`gemini-1.5-flash`) - Fast and efficient, 1M tokens - **DEFAULT**
- **Gemini 1.5 Flash-8B** (`gemini-1.5-flash-8b`) - Ultra-fast, lightweight

### OpenAI GPT-5 Series (Frontier Models) 🆕
- **GPT-5.1** (`gpt-5.1`) - Best for coding and agentic tasks, 200K tokens
- **GPT-5 mini** (`gpt-5-mini`) - Faster, cost-efficient version
- **GPT-5 nano** (`gpt-5-nano`) - Fastest, most cost-efficient
- **GPT-5 pro** (`gpt-5-pro`) - Smarter, more precise responses
- **GPT-5** (`gpt-5`) - Previous intelligent reasoning model

### OpenAI GPT-4.1 Series
- **GPT-4.1** (`gpt-4.1`) - Smartest non-reasoning model
- **GPT-4.1 mini** (`gpt-4.1-mini`) - Smaller, faster variant
- **GPT-4.1 nano** (`gpt-4.1-nano`) - Fastest variant

### OpenAI GPT-4o Series
- **GPT-4o** (`gpt-4o`) - Fast, intelligent, flexible
- **GPT-4o mini** (`gpt-4o-mini`) - Fast, affordable small model

### OpenAI o-series (Reasoning Models)
- **o3** (`o3`) - Latest reasoning model, successor to GPT-5, 200K tokens
- **o3-mini** (`o3-mini`) - Small alternative to o3
- **o1** (`o1`) - Previous o-series reasoning model
- **o1-pro** (`o1-pro`) - More compute for better responses
- **o1-mini** (`o1-mini`) - Small alternative to o1

### Legacy Models
- **GPT-4** (`gpt-4`) - Classic GPT-4, 8K tokens
- **GPT-4 Turbo** (`gpt-4-turbo`) - Faster GPT-4, 128K tokens
- **GPT-3.5 Turbo** (`gpt-3.5-turbo`) - Fast and cost-effective, 16K tokens

## 📋 Setup Instructions

### Step 1: Install Dependencies
Already done! We've installed:
```bash
npm install @google/generative-ai openai
```

### Step 2: Get API Keys

#### For Gemini (Recommended - FREE):
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

#### For OpenAI:
1. Visit: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-`)

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Gemini API Key (Get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# OpenAI API Key (Get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_actual_openai_api_key_here

# Other settings
PORT=3000
NODE_ENV=development
```

**Note**: You only need ONE API key (either Gemini OR OpenAI), but having both gives you access to all models.

## 🧪 Test the Integration

Run the test script:

```bash
node test-ai.js
```

This will test all AI features and show you which models are available based on your API keys.

## 📡 API Endpoints

### 1. Get Available Models
```http
GET /api/ai/models
```

Response:
```json
{
  "success": true,
  "models": [
    { "key": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "Google" },
    { "key": "gpt-4", "name": "GPT-4", "provider": "OpenAI" }
  ]
}
```

### 2. Generate Text
```http
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "What are the top attractions in Paris?",
  "model": "gemini-2.0-flash",
  "options": {
    "temperature": 0.9,
    "maxTokens": 2048
  }
}
```

### 3. Get Travel Recommendations
```http
POST /api/ai/recommendations
Content-Type: application/json

{
  "destination": "Tokyo",
  "preferences": {
    "budget": "moderate",
    "duration": "5 days",
    "interests": "culture, food, technology"
  },
  "model": "gemini-1.5-pro"
}
```

### 4. Generate Itinerary
```http
POST /api/ai/itinerary
Content-Type: application/json

{
  "destination": "Barcelona",
  "days": 3,
  "preferences": {
    "budget": "moderate",
    "pace": "relaxed"
  },
  "model": "gemini-2.0-flash"
}
```

### 5. Chat with AI
```http
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "I want to visit Japan. What's the best season?" },
    { "role": "assistant", "content": "Spring (March-May) is ideal..." },
    { "role": "user", "content": "What about cherry blossoms?" }
  ],
  "model": "gemini-2.0-flash"
}
```

## 💻 Using in Your Code

### Import the Service
```javascript
const aiService = require('./services/ai-service');
```

### Example 1: Simple Text Generation
```javascript
const response = await aiService.generateText(
  'What are the top 3 attractions in Rome?',
  'gemini-2.0-flash'  // or 'gpt-4'
);
console.log(response);
```

### Example 2: Travel Recommendations
```javascript
const recommendations = await aiService.generateTravelRecommendations(
  'New York',
  {
    budget: 'luxury',
    duration: '7 days',
    interests: 'museums, fine dining, broadway'
  },
  'gemini-1.5-pro'
);
console.log(recommendations);
```

### Example 3: Create Itinerary
```javascript
const itinerary = await aiService.generateItinerary(
  'Paris',
  5,
  {
    budget: 'moderate',
    pace: 'moderate',
    interests: 'art, history, food'
  },
  'gemini-2.0-flash'
);
console.log(itinerary);
```

### Example 4: Chat Conversation
```javascript
const messages = [
  { role: 'user', content: 'Tell me about Bali' },
  { role: 'assistant', content: 'Bali is a beautiful island...' },
  { role: 'user', content: 'What about hotels?' }
];

const response = await aiService.chat(messages, 'gpt-4');
console.log(response);
```

## 🎯 Use Cases in Your App

1. **Smart Trip Planning**: Generate personalized itineraries based on user preferences
2. **Hotel Recommendations**: Get AI-powered hotel suggestions for any destination
3. **Travel Assistant Chatbot**: Answer user questions about destinations
4. **Activity Suggestions**: Generate day-by-day activity recommendations
5. **Budget Planning**: Create detailed budget breakdowns for trips
6. **Cultural Tips**: Provide etiquette and cultural information for destinations

## 🔧 Adding AI to Your Backend Server

If you have a main server file (like `server.js` or `app.js`), add this route:

```javascript
const express = require('express');
const aiRoutes = require('./routes/ai-routes');

const app = express();

// Add AI routes
app.use('/api/ai', aiRoutes);

app.listen(3000, () => {
  console.log('Server running with AI integration!');
});
```

## 💡 Model Selection Guide

### For Travel Planning & Recommendations

**Best Overall**: `gpt-5.1` or `gemini-1.5-pro`
- Complex itinerary planning
- Personalized recommendations
- Multi-day trip planning

**Fast & Free**: `gemini-1.5-flash` ⭐ **RECOMMENDED**
- Quick recommendations
- Simple queries
- Development/testing
- Completely free within generous limits

**Budget-Friendly**: `gpt-5-nano` or `gemini-1.5-flash-8b`
- High-volume applications
- Simple tasks
- Cost optimization

### For Coding & Agentic Tasks

**Best**: `gpt-5.1` (200K tokens)
- Code generation
- Debugging
- Architecture planning

**Alternative**: `o3` (200K tokens)
- Advanced reasoning
- Complex problem-solving

### For Chat & Conversational AI

**Best Balance**: `gpt-5-mini` or `gpt-4o`
- Natural conversations
- Context awareness
- Good speed/quality ratio

**Fastest**: `gpt-5-nano` or `gemini-1.5-flash-8b`
- Real-time chat
- High-throughput
- Cost-effective

### General Guidelines

**Use Gemini models when**:
- You want free tier (60 req/min, 1M tokens/day)
- Need large context (up to 2M tokens)
- Prototyping or development

**Use GPT-5 series when**:
- Need cutting-edge performance
- Complex reasoning required
- Coding and agentic tasks

**Use o-series when**:
- Advanced reasoning tasks
- Complex problem-solving
- Mathematical or logical tasks

## 🔒 Security Notes

1. **Never commit .env file** - It's already in .gitignore
2. **Use environment variables** - Don't hardcode API keys
3. **Rotate keys regularly** - Generate new keys periodically
4. **Monitor usage** - Check your API usage dashboards
5. **Set rate limits** - Implement rate limiting on your endpoints

## 💰 Cost Comparison

### Gemini (Google)
- **Free tier**: 60 requests/minute
- **Paid**: Pay as you go, very competitive pricing
- Best for: Development, testing, high-volume apps

### OpenAI
- **No free tier**: Requires payment
- **GPT-3.5**: ~$0.002 per 1K tokens
- **GPT-4**: ~$0.03 per 1K tokens
- Best for: Production apps requiring highest quality

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Gemini API Key](https://makersuite.google.com/app/apikey)
- [OpenAI API Keys](https://platform.openai.com/api-keys)

## 🐛 Troubleshooting

### "Gemini API key not configured"
- Make sure GEMINI_API_KEY is set in .env
- Restart your server after adding the key

### "OpenAI API key not configured"
- Make sure OPENAI_API_KEY is set in .env
- Verify the key starts with `sk-`

### "No models available"
- You need at least one API key (Gemini OR OpenAI)
- Check that .env file is in the root directory

### "Rate limit exceeded"
- Gemini free tier: 60 requests/minute
- Implement caching for repeated queries
- Consider upgrading to paid tier

## 🎉 You're Ready!

You now have access to the most powerful AI models from both Google and OpenAI in your travel booking application!

Test it with:
```bash
node test-ai.js
```

Happy coding! 🚀
