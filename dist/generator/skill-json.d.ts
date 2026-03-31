/**
 * skill.json Generator
 * Generates ClawHub metadata
 */
import AIClient from '../ai/client.js';
import { SkillClassification } from './classifier.js';
export interface SkillJsonOptions {
    description: string;
    classification: SkillClassification;
    aiClient: AIClient;
}
export interface SkillJsonData {
    name: string;
    version: string;
    author: string;
    description: string;
    tags: string[];
    category: string;
}
/**
 * Generate skill.json content
 */
export declare function generateSkillJson(options: SkillJsonOptions): Promise<SkillJsonData>;
export default generateSkillJson;
//# sourceMappingURL=skill-json.d.ts.map