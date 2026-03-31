/**
 * AI Client — OpenAI-compatible API client for skill generation
 * Supports any OpenAI-compatible endpoint (GLM-5, M2.7, GPT, etc.)
 */

import OpenAI from 'openai';

export interface AIConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

const DEFAULT_CONFIG: AIConfig = {
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'google/gemini-3-flash-preview',
};

export class AIClient {
  private client: OpenAI;
  private model: string;

  constructor(config: Partial<AIConfig> = {}) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    this.model = merged.model || DEFAULT_CONFIG.model!;
    
    this.client = new OpenAI({
      apiKey: merged.apiKey || 'sk-route-Token', // placeholder - needs real key
      baseURL: merged.baseURL,
    });
  }

  /**
   * Generate a completion from a prompt
   */
  async complete(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
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
   * Generate with system prompt for more structured output
   */
  async completeWithSystem(systemPrompt: string, userPrompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
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
