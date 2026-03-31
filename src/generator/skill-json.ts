/**
 * skill.json Generator
 * Generates ClawHub metadata
 */

import AIClient from '../ai/client.js';
import { getSkillJsonSystemPrompt, getSkillJsonUserPrompt } from '../ai/prompts.js';
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
export async function generateSkillJson(options: SkillJsonOptions): Promise<SkillJsonData> {
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
  
  const data = JSON.parse(content) as SkillJsonData;
  
  // Override name with our classified name
  data.name = classification.name;
  
  // Add detected services as tags if not present
  const serviceTags = classification.services.filter(s => !data.tags.includes(s));
  data.tags = [...data.tags, ...serviceTags];
  
  return data;
}

export default generateSkillJson;
