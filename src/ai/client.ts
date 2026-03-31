/**
 * AI Client — OpenAI-compatible API client for skill generation
 * Supports multiple providers with auto-detection from environment variables
 * Falls back to template-based generation when no API key is available
 */

import OpenAI from 'openai';

export interface AIConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface ProviderInfo {
  provider: string;
  baseURL: string;
  model: string;
  available: boolean;
}

// Provider detection from environment variables (checked in priority order)
function detectProvider(): ProviderInfo | null {
  // Check ZAI first (free via OAuth in OpenClaw)
  if (process.env.ZAI_API_KEY) {
    return {
      provider: 'zai',
      baseURL: 'https://api.z.ai/api/coding/paas/v4',
      model: 'glm-5',
      available: true,
    };
  }

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      available: true,
    };
  }

  // Check OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: 'google/gemini-2-flash',
      available: true,
    };
  }

  // Check Qwen/Alibaba
  if (process.env.QWEN_API_KEY) {
    return {
      provider: 'qwen',
      baseURL: 'https://api.dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus',
      available: true,
    };
  }

  // No API key found - template mode
  return null;
}

export class AIClient {
  private client: OpenAI | null = null;
  private model: string;
  private provider: string;
  private useTemplateMode: boolean;

  constructor(config: Partial<AIConfig> = {}) {
    // If explicit config provided, use it
    if (config.apiKey && config.baseURL && config.model) {
      this.provider = 'custom';
      this.model = config.model;
      this.useTemplateMode = false;
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return;
    }

    // Auto-detect from environment
    const detected = detectProvider();

    if (!detected) {
      // No API key - template mode
      this.provider = 'template';
      this.model = 'none';
      this.useTemplateMode = true;
      this.client = null;
      return;
    }

    this.provider = detected.provider;
    this.model = detected.model;
    this.useTemplateMode = false;

    // Use detected provider
    const apiKey = config.apiKey || 
      process.env.ZAI_API_KEY || 
      process.env.OPENAI_API_KEY || 
      process.env.OPENROUTER_API_KEY || 
      process.env.QWEN_API_KEY!;

    this.client = new OpenAI({
      apiKey,
      baseURL: detected.baseURL,
    });
  }

  /**
   * Check if template mode is active (no API key)
   */
  isTemplateMode(): boolean {
    return this.useTemplateMode;
  }

  /**
   * Get provider name
   */
  getProvider(): string {
    return this.provider;
  }

  /**
   * Generate a completion from a prompt (requires API)
   */
  async complete(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (this.useTemplateMode || !this.client) {
      throw new Error('Template mode active - use generateFromTemplate() instead');
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from AI model');
    }
    return content;
  }

  /**
   * Generate with system prompt for more structured output (requires API)
   */
  async completeWithSystem(systemPrompt: string, userPrompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (this.useTemplateMode || !this.client) {
      throw new Error('Template mode active - use generateFromTemplate() instead');
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 8192,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from AI model');
    }
    return content;
  }

  getModel(): string {
    return this.model;
  }
}

export default AIClient;
