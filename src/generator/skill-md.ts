/**
 * SKILL.md Generator
 * Generates the core skill definition file
 */

import AIClient from '../ai/client.js';
import { getSkillMdSystemPrompt, getSkillMdUserPrompt } from '../ai/prompts.js';

export interface SkillMdOptions {
  description: string;
  skillType: string;
  aiClient: AIClient;
}

/**
 * Generate SKILL.md content
 */
export async function generateSkillMd(options: SkillMdOptions): Promise<string> {
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
