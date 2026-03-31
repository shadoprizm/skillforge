/**
 * Script Scaffolding Generator (Pro Feature)
 * Generates implementation boilerplate code
 */
import AIClient from '../ai/client.js';
import { SkillClassification } from './classifier.js';
export interface ScriptOptions {
    description: string;
    skillName: string;
    classification: SkillClassification;
    aiClient: AIClient;
}
/**
 * Generate script boilerplate
 */
export declare function generateScript(options: ScriptOptions): Promise<{
    fileName: string;
    content: string;
}>;
/**
 * Generate a tools helper file for TypeScript/JavaScript
 */
export declare function generateToolsHelper(language: 'typescript' | 'javascript'): string;
export default generateScript;
//# sourceMappingURL=scripts.d.ts.map