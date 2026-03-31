/**
 * Reference Documentation Generator (Pro Feature)
 * Generates API reference docs for target services
 */

import AIClient from '../ai/client.js';
import { getReferenceSystemPrompt, getReferenceUserPrompt } from '../ai/prompts.js';

export interface ReferenceOptions {
  services: string[];
  description: string;
  aiClient: AIClient;
}

export interface ReferenceDoc {
  fileName: string;
  content: string;
}

/**
 * Generate reference documentation for detected services
 */
export async function generateReferences(options: ReferenceOptions): Promise<ReferenceDoc[]> {
  const { services, description, aiClient } = options;
  
  if (services.length === 0) {
    return [];
  }
  
  const docs: ReferenceDoc[] = [];
  
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
