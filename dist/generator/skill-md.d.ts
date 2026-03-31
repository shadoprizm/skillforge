/**
 * SKILL.md Generator
 * Generates the core skill definition file
 */
import AIClient from '../ai/client.js';
export interface SkillMdOptions {
    description: string;
    skillType: string;
    aiClient: AIClient;
}
/**
 * Generate SKILL.md content
 */
export declare function generateSkillMd(options: SkillMdOptions): Promise<string>;
export default generateSkillMd;
//# sourceMappingURL=skill-md.d.ts.map