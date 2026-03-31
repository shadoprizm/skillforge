/**
 * Reference Documentation Generator (Pro Feature)
 * Generates API reference docs for target services
 */
import { getReferenceSystemPrompt, getReferenceUserPrompt } from '../ai/prompts.js';
/**
 * Generate reference documentation for detected services
 */
export async function generateReferences(options) {
    const { services, description, aiClient } = options;
    if (services.length === 0) {
        return [];
    }
    const docs = [];
    for (const service of services) {
        const systemPrompt = getReferenceSystemPrompt();
        const userPrompt = getReferenceUserPrompt(service, description);
        let content = await aiClient.completeWithSystem(systemPrompt, userPrompt);
        // Clean up
        content = content
            .replace(/^```markdown\s*/i, '')
            .replace(/^```\s*/m, '')
            .replace(/```\s*$/m, '')
            .trim();
        docs.push({
            fileName: `${service}-api.md`,
            content,
        });
    }
    return docs;
}
export default generateReferences;
//# sourceMappingURL=references.js.map