/**
 * Auth Module — API key management for SkillForge Pro
 */
import Conf from 'conf';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
const VALID_PRO_KEYS = [
    'sk_pro_skillforge_001',
    'sk_pro_skillforge_002',
    'sk_pro_skillforge_dev',
];
export class AuthManager {
    config;
    constructor() {
        const configDir = join(homedir(), '.skillforge');
        if (!existsSync(configDir)) {
            mkdirSync(configDir, { recursive: true });
        }
        this.config = new Conf({
            cwd: configDir,
            projectName: 'skillforge',
        });
    }
    /**
     * Check if a provided API key is valid for Pro features
     */
    isProKey(key) {
        return VALID_PRO_KEYS.includes(key);
    }
    /**
     * Get stored API key
     */
    getApiKey() {
        return this.config.get('apiKey');
    }
    /**
     * Store API key
     */
    setApiKey(key) {
        this.config.set('apiKey', key);
    }
    /**
     * Get default language setting
     */
    getDefaultLanguage() {
        return this.config.get('defaultLanguage') || 'typescript';
    }
    /**
     * Set default language
     */
    setDefaultLanguage(lang) {
        this.config.set('defaultLanguage', lang);
    }
    /**
     * Get default output directory
     */
    getDefaultOutput() {
        return this.config.get('defaultOutput') || './skills';
    }
    /**
     * Set default output directory
     */
    setDefaultOutput(dir) {
        this.config.set('defaultOutput', dir);
    }
    /**
     * Clear all stored config
     */
    clear() {
        this.config.clear();
    }
}
export default AuthManager;
//# sourceMappingURL=index.js.map