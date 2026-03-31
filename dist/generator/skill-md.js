/**
 * SKILL.md Generator
 * Generates the core skill definition file
 */
import { getSkillMdSystemPrompt, getSkillMdUserPrompt } from '../ai/prompts.js';
/**
 * Generate SKILL.md content
 */
export async function generateSkillMd(options) {
    const { description, skillType, aiClient } = options;
    const systemPrompt = getSkillMdSystemPrompt();
    const userPrompt = getSkillMdUserPrompt(description, skillType);
    const content = await aiClient.completeWithSystem(systemPrompt, userPrompt);
    // Clean up any markdown code fences if present
    return content
        .replace(/^```markdown\s*/i, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();
}
export default generateSkillMd;
//# sourceMappingURL=skill-md.js.map