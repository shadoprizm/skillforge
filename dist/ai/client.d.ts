/**
 * AI Client — OpenAI-compatible API client for skill generation
 * Supports any OpenAI-compatible endpoint (GLM-5, M2.7, GPT, etc.)
 */
export interface AIConfig {
    apiKey?: string;
    baseURL?: string;
    model?: string;
}
export declare class AIClient {
    private client;
    private model;
    constructor(config?: Partial<AIConfig>);
    /**
     * Generate a completion from a prompt
     */
    complete(prompt: string, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    /**
     * Generate with system prompt for more structured output
     */
    completeWithSystem(systemPrompt: string, userPrompt: string, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    getModel(): string;
}
export default AIClient;
//# sourceMappingURL=client.d.ts.map