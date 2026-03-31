/**
 * Auth Module — API key management for SkillForge Pro
 */

import Conf from 'conf';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface SkillForgeConfig {
  apiKey?: string;
  defaultLanguage?: string;
  defaultOutput?: string;
}

/**
 * Accept any non-empty API key — the AI provider validates it.
 * Supports: Z.AI (alphanumeric), OpenAI (sk-...), OpenRouter (sk-or-...), Qwen
 */
function isValidApiKey(key: string): boolean {
  if (!key || key.trim().length < 10) return false;
  return true;
}

export class AuthManager {
  private config: Conf<SkillForgeConfig>;

  constructor() {
    const configDir = join(homedir(), '.skillforge');
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    this.config = new Conf<SkillForgeConfig>({
      cwd: configDir,
      projectName: 'skillforge',
    });
  }

  /**
   * Check if a provided API key is valid for Pro features
   */
  isProKey(key: string): boolean {
    return isValidApiKey(key);
  }

  /**
   * Get stored API key
   */
  getApiKey(): string | undefined {
    return this.config.get('apiKey');
  }

  /**
   * Store API key
   */
  setApiKey(key: string): void {
    this.config.set('apiKey', key);
  }

  /**
   * Get default language setting
   */
  getDefaultLanguage(): string {
    return this.config.get('defaultLanguage') || 'typescript';
  }

  /**
   * Set default language
   */
  setDefaultLanguage(lang: string): void {
    this.config.set('defaultLanguage', lang);
  }

  /**
   * Get default output directory
   */
  getDefaultOutput(): string {
    return this.config.get('defaultOutput') || './skills';
  }

  /**
   * Set default output directory
   */
  setDefaultOutput(dir: string): void {
    this.config.set('defaultOutput', dir);
  }

  /**
   * Clear all stored config
   */
  clear(): void {
    this.config.clear();
  }
}

export default AuthManager;
