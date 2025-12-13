const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

/**
 * Universal AI Service
 * Supports Google Gemini, OpenAI GPT, and Anthropic Claude models
 */
class AIService {
  constructor() {
    // Initialize Gemini
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.gemini = this.geminiApiKey ? new GoogleGenerativeAI(this.geminiApiKey) : null;

    // Initialize OpenAI
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openai = this.openaiApiKey ? new OpenAI({ apiKey: this.openaiApiKey }) : null;

    // Initialize Anthropic Claude
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.anthropic = this.anthropicApiKey ? new Anthropic({ apiKey: this.anthropicApiKey }) : null;

    // Available models
    this.models = {
      // Anthropic Claude Models
      'claude-opus-4.5': { provider: 'anthropic', name: 'claude-opus-4-5-20251101' },
      'claude-sonnet-4.5': { provider: 'anthropic', name: 'claude-sonnet-4-5-20250514' },
      'claude-sonnet-3.5': { provider: 'anthropic', name: 'claude-3-5-sonnet-20241022' },
      'claude-haiku-3.5': { provider: 'anthropic', name: 'claude-3-5-haiku-20241022' },
      'claude-opus-3': { provider: 'anthropic', name: 'claude-3-opus-20240229' },

      // Gemini 2.0 Models (Latest - Completely FREE!)
      'gemini-2.0-flash': { provider: 'gemini', name: 'gemini-2.0-flash-exp' },

      // Gemini 1.5 Models (Stable & Widely Available - FREE!)
      'gemini-1.5-pro': { provider: 'gemini', name: 'gemini-1.5-pro' },
      'gemini-1.5-flash': { provider: 'gemini', name: 'gemini-1.5-flash' },
      'gemini-1.5-flash-8b': { provider: 'gemini', name: 'gemini-1.5-flash-8b' },

      // OpenAI GPT-5 Series (Frontier Models)
      'gpt-5.1': { provider: 'openai', name: 'gpt-5.1' },
      'gpt-5-mini': { provider: 'openai', name: 'gpt-5-mini' },
      'gpt-5-nano': { provider: 'openai', name: 'gpt-5-nano' },
      'gpt-5-pro': { provider: 'openai', name: 'gpt-5-pro' },
      'gpt-5': { provider: 'openai', name: 'gpt-5' },

      // OpenAI GPT-4.1 Series
      'gpt-4.1': { provider: 'openai', name: 'gpt-4.1' },
      'gpt-4.1-mini': { provider: 'openai', name: 'gpt-4.1-mini' },
      'gpt-4.1-nano': { provider: 'openai', name: 'gpt-4.1-nano' },

      // OpenAI GPT-4o Series
      'gpt-4o': { provider: 'openai', name: 'gpt-4o' },
      'gpt-4o-mini': { provider: 'openai', name: 'gpt-4o-mini' },

      // OpenAI GPT-4 Series
      'gpt-4': { provider: 'openai', name: 'gpt-4' },
      'gpt-4-turbo': { provider: 'openai', name: 'gpt-4-turbo' },

      // OpenAI o-series (Reasoning Models)
      'o3': { provider: 'openai', name: 'o3' },
      'o3-mini': { provider: 'openai', name: 'o3-mini' },
      'o1': { provider: 'openai', name: 'o1' },
      'o1-pro': { provider: 'openai', name: 'o1-pro' },
      'o1-mini': { provider: 'openai', name: 'o1-mini' },

      // Legacy
      'gpt-3.5-turbo': { provider: 'openai', name: 'gpt-3.5-turbo' },
    };
  }

  /**
   * Generate text using specified AI model
   * @param {string} prompt - The prompt to send to the AI
   * @param {string} modelKey - Model key from this.models
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, modelKey = 'gemini-1.5-flash', options = {}) {
    const model = this.models[modelKey];

    if (!model) {
      throw new Error(`Unknown model: ${modelKey}. Available models: ${Object.keys(this.models).join(', ')}`);
    }

    if (model.provider === 'gemini') {
      return await this.generateWithGemini(prompt, model.name, options);
    } else if (model.provider === 'openai') {
      return await this.generateWithOpenAI(prompt, model.name, options);
    } else if (model.provider === 'anthropic') {
      return await this.generateWithClaude(prompt, model.name, options);
    }

    throw new Error(`Unknown provider: ${model.provider}`);
  }

  /**
   * Generate text using Google Gemini
   */
  async generateWithGemini(prompt, modelName, options = {}) {
    if (!this.gemini) {
      throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in .env file.');
    }

    const model = this.gemini.getGenerativeModel({ model: modelName });

    const generationConfig = {
      temperature: options.temperature || 0.9,
      topP: options.topP || 1,
      topK: options.topK || 40,
      maxOutputTokens: options.maxTokens || 2048,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    return response.text();
  }

  /**
   * Generate text using OpenAI
   */
  async generateWithOpenAI(prompt, modelName, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in .env file.');
    }

    const response = await this.openai.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.9,
      max_tokens: options.maxTokens || 2048,
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate text using Anthropic Claude
   */
  async generateWithClaude(prompt, modelName, options = {}) {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env file.');
    }

    const response = await this.anthropic.messages.create({
      model: modelName,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 1.0,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    return response.content[0].text;
  }

  /**
   * Generate travel recommendations using AI
   */
  async generateTravelRecommendations(destination, preferences = {}, modelKey = 'gemini-2.0-flash') {
    const prompt = `You are a travel expert. Generate personalized travel recommendations for ${destination}.

Preferences:
- Budget: ${preferences.budget || 'moderate'}
- Duration: ${preferences.duration || '3-5 days'}
- Interests: ${preferences.interests || 'sightseeing, food, culture'}
- Travel style: ${preferences.travelStyle || 'relaxed'}

Please provide:
1. Top 5 must-visit attractions
2. 3 recommended hotels (budget, mid-range, luxury)
3. Local cuisine recommendations
4. Best time to visit
5. Cultural tips and etiquette
6. Estimated daily budget breakdown

Format the response as JSON with clear sections.`;

    const response = await this.generateText(prompt, modelKey);
    return response;
  }

  /**
   * Generate trip itinerary using AI
   */
  async generateItinerary(destination, days, preferences = {}, modelKey = 'gemini-2.0-flash') {
    const prompt = `Create a detailed ${days}-day itinerary for ${destination}.

Preferences:
- Budget: ${preferences.budget || 'moderate'}
- Interests: ${preferences.interests || 'sightseeing, food'}
- Pace: ${preferences.pace || 'moderate'}

For each day, provide:
- Morning, afternoon, and evening activities
- Restaurant recommendations
- Transportation tips
- Estimated costs
- Pro tips

Make it practical and realistic with travel times between locations.`;

    const response = await this.generateText(prompt, modelKey);
    return response;
  }

  /**
   * Chat with AI assistant
   */
  async chat(messages, modelKey = 'gemini-2.0-flash', options = {}) {
    const model = this.models[modelKey];

    if (!model) {
      throw new Error(`Unknown model: ${modelKey}`);
    }

    if (model.provider === 'gemini') {
      return await this.chatWithGemini(messages, model.name, options);
    } else if (model.provider === 'openai') {
      return await this.chatWithOpenAI(messages, model.name, options);
    } else if (model.provider === 'anthropic') {
      return await this.chatWithClaude(messages, model.name, options);
    }
  }

  async chatWithGemini(messages, modelName, options = {}) {
    if (!this.gemini) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.gemini.getGenerativeModel({ model: modelName });
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: options.temperature || 0.9,
        maxOutputTokens: options.maxTokens || 2048,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }

  async chatWithOpenAI(messages, modelName, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: modelName,
      messages: messages,
      temperature: options.temperature || 0.9,
      max_tokens: options.maxTokens || 2048,
    });

    return response.choices[0].message.content;
  }

  async chatWithClaude(messages, modelName, options = {}) {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert messages to Claude format (Claude doesn't use 'assistant' role for history in the same way)
    const claudeMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await this.anthropic.messages.create({
      model: modelName,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 1.0,
      messages: claudeMessages,
    });

    return response.content[0].text;
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    const available = [];

    if (this.anthropic) {
      available.push(
        { key: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', contextWindow: '200K tokens', description: 'Most intelligent Claude model' },
        { key: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', contextWindow: '200K tokens', description: 'Balanced intelligence and speed' },
        { key: 'claude-sonnet-3.5', name: 'Claude Sonnet 3.5', provider: 'Anthropic', contextWindow: '200K tokens', description: 'Previous Sonnet version' },
        { key: 'claude-haiku-3.5', name: 'Claude Haiku 3.5', provider: 'Anthropic', contextWindow: '200K tokens', description: 'Fastest Claude model' },
        { key: 'claude-opus-3', name: 'Claude Opus 3', provider: 'Anthropic', contextWindow: '200K tokens', description: 'Previous Opus version' }
      );
    }

    if (this.gemini) {
      available.push(
        { key: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Experimental)', provider: 'Google', contextWindow: '1M tokens' },
        { key: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', contextWindow: '2M tokens' },
        { key: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', contextWindow: '1M tokens' },
        { key: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', provider: 'Google', contextWindow: '1M tokens' }
      );
    }

    if (this.openai) {
      available.push(
        // GPT-5 Series (Frontier)
        { key: 'gpt-5.1', name: 'GPT-5.1', provider: 'OpenAI', contextWindow: '200K tokens', description: 'Best for coding and agentic tasks' },
        { key: 'gpt-5-mini', name: 'GPT-5 mini', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Faster, cost-efficient GPT-5' },
        { key: 'gpt-5-nano', name: 'GPT-5 nano', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Fastest, most cost-efficient GPT-5' },
        { key: 'gpt-5-pro', name: 'GPT-5 pro', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Smarter, more precise responses' },
        { key: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Previous intelligent reasoning model' },

        // GPT-4.1 Series
        { key: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Smartest non-reasoning model' },
        { key: 'gpt-4.1-mini', name: 'GPT-4.1 mini', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Smaller, faster GPT-4.1' },
        { key: 'gpt-4.1-nano', name: 'GPT-4.1 nano', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Fastest GPT-4.1' },

        // GPT-4o Series
        { key: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Fast, intelligent, flexible' },
        { key: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Fast, affordable small model' },

        // GPT-4 Series
        { key: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', contextWindow: '8K tokens' },
        { key: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', contextWindow: '128K tokens' },

        // o-series (Reasoning)
        { key: 'o3', name: 'o3', provider: 'OpenAI', contextWindow: '200K tokens', description: 'Reasoning model, successor to GPT-5' },
        { key: 'o3-mini', name: 'o3-mini', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Small alternative to o3' },
        { key: 'o1', name: 'o1', provider: 'OpenAI', contextWindow: '200K tokens', description: 'Previous o-series reasoning model' },
        { key: 'o1-pro', name: 'o1-pro', provider: 'OpenAI', contextWindow: '128K tokens', description: 'More compute for better responses' },
        { key: 'o1-mini', name: 'o1-mini', provider: 'OpenAI', contextWindow: '128K tokens', description: 'Small alternative to o1' },

        // Legacy
        { key: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', contextWindow: '16K tokens' }
      );
    }

    return available;
  }
}

module.exports = new AIService();
