/**
 * Auth Module — API key management for SkillForge Pro
 */
export interface SkillForgeConfig {
    apiKey?: string;
    defaultLanguage?: string;
    defaultOutput?: string;
}
export declare class AuthManager {
    private config;
    constructor();
    /**
     * Check if a provided API key is valid for Pro features
     */
    isProKey(key: string): boolean;
    /**
     * Get stored API key
     */
    getApiKey(): string | undefined;
    /**
     * Store API key
     */
    setApiKey(key: string): void;
    /**
     * Get default language setting
     */
    getDefaultLanguage(): string;
    /**
     * Set default language
     */
    setDefaultLanguage(lang: string): void;
    /**
     * Get default output directory
     */
    getDefaultOutput(): string;
    /**
     * Set default output directory
     */
    setDefaultOutput(dir: string): void;
    /**
     * Clear all stored config
     */
    clear(): void;
}
export default AuthManager;
//# sourceMappingURL=index.d.ts.map