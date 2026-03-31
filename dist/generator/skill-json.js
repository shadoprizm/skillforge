/**
 * skill.json Generator
 * Generates ClawHub metadata
 */
import { getSkillJsonSystemPrompt, getSkillJsonUserPrompt } from '../ai/prompts.js';
/**
 * Generate skill.json content
 */
export async function generateSkillJson(options) {
    const { description, classification, aiClient } = options;
    const systemPrompt = getSkillJsonSystemPrompt();
    const userPrompt = getSkillJsonUserPrompt(description, classification.name);
    let content = await aiClient.completeWithSystem(systemPrompt, userPrompt);
    // Clean up any markdown code fences
    content = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();
    const data = JSON.parse(content);
    // Override name with our classified name
    data.name = classification.name;
    // Add detected services as tags if not present
    const serviceTags = classification.services.filter(s => !data.tags.includes(s));
    data.tags = [...data.tags, ...serviceTags];
    return data;
}
export default generateSkillJson;
//# sourceMappingURL=skill-json.js.map