const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

/**
 * Universal AI Service - UPDATED WITH LATEST MODELS
 * Supports Google Gemini (2.0, 1.5) and OpenAI (GPT-4, O1)
 * 
 * NOTE: There is NO Gemini 2.5 or 3.0 yet (as of Dec 2024)
 */
class AIService {
  constructor() {
    // Initialize Gemini
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.gemini = this.geminiApiKey ? new GoogleGenerativeAI(this.geminiApiKey) : null;

    // Initialize OpenAI
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openai = this.openaiApiKey ? new OpenAI({ apiKey: this.openaiApiKey }) : null;

    // Available models (LATEST as of Dec 2024)
    this.models = {
      // ═══════════════════════════════════════════════════════
      // GEMINI 2.0 MODELS (Latest - Released Dec 2024)
      // ═══════════════════════════════════════════════════════
      'gemini-2.0-flash': { 
        provider: 'gemini', 
        name: 'gemini-2.0-flash-exp',
        description: 'Fastest Gemini model, multimodal, experimental'
      },
      'gemini-2.0-flash-thinking': { 
        provider: 'gemini', 
        name: 'gemini-2.0-flash-thinking-exp',
        description: 'Advanced reasoning, shows thinking process'
      },

      // ═══════════════════════════════════════════════════════
      // GEMINI 1.5 MODELS (Stable, Production-Ready)
      // ═══════════════════════════════════════════════════════
      'gemini-1.5-pro': { 
        provider: 'gemini', 
        name: 'gemini-1.5-pro-latest',
        description: 'Most capable, 2M token context'
      },
      'gemini-1.5-pro-002': { 
        provider: 'gemini', 
        name: 'gemini-1.5-pro-002',
        description: 'Latest stable Pro version'
      },
      'gemini-1.5-flash': { 
        provider: 'gemini', 
        name: 'gemini-1.5-flash-latest',
        description: 'Fast, 1M token context'
      },
      'gemini-1.5-flash-8b': { 
        provider: 'gemini', 
        name: 'gemini-1.5-flash-8b-latest',
        description: 'Smallest, fastest, most cost-effective'
      },

      // ═══════════════════════════════════════════════════════
      // OPENAI GPT-4 MODELS
      // ═══════════════════════════════════════════════════════
      'gpt-4': { 
        provider: 'openai', 
        name: 'gpt-4',
        description: 'Original GPT-4, 8K context'
      },
      'gpt-4-turbo': { 
        provider: 'openai', 
        name: 'gpt-4-turbo-preview',
        description: 'Faster GPT-4, 128K context'
      },
      'gpt-4o': { 
        provider: 'openai', 
        name: 'gpt-4o',
        description: 'GPT-4 Omni, multimodal, 128K context'
      },
      'gpt-4o-mini': { 
        provider: 'openai', 
        name: 'gpt-4o-mini',
        description: 'Smaller, faster, cheaper GPT-4o'
      },

      // ═══════════════════════════════════════════════════════
      // OPENAI O1 MODELS (Advanced Reasoning)
      // ═══════════════════════════════════════════════════════
      'o1-preview': { 
        provider: 'openai', 
        name: 'o1-preview',
        description: 'Advanced reasoning, complex problems'
      },
      'o1-mini': { 
        provider: 'openai', 
        name: 'o1-mini',
        description: 'Smaller O1, faster reasoning'
      },

      // ═══════════════════════════════════════════════════════
      // OPENAI GPT-3.5 (Budget Option)
      // ═══════════════════════════════════════════════════════
      'gpt-3.5-turbo': { 
        provider: 'openai', 
        name: 'gpt-3.5-turbo',
        description: 'Fast, cheap, 16K context'
      },
    };
  }
