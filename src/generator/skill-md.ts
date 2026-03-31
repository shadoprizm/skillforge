/**
 * SKILL.md Generator
 * Generates the core skill definition file
 * Supports both AI-powered and template-based generation
 */

import AIClient from '../ai/client.js';
import { getSkillMdSystemPrompt, getSkillMdUserPrompt } from '../ai/prompts.js';
import { SkillClassification } from './classifier.js';

export interface SkillMdOptions {
  description: string;
  skillType: string;
  aiClient: AIClient;
}

export interface TemplateOptions {
  description: string;
  classification: SkillClassification;
}

/**
 * Generate SKILL.md content using AI
 */
export async function generateSkillMd(options: SkillMdOptions): Promise<string> {
  const { description, skillType, aiClient } = options;
  
  // Check if template mode
  if (aiClient.isTemplateMode()) {
    throw new Error('AI client is in template mode - use generateSkillMdFromTemplate() instead');
  }
  
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

/**
 * Get the skill type display name
 */
function getSkillTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    automation: 'Automation & Scripts',
    api: 'API & Integration',
    data: 'Data Processing',
    monitoring: 'Monitoring & Alerts',
    communication: 'Communication & Notifications',
    analysis: 'Analysis & Intelligence',
    utility: 'Utility & Tools',
    default: 'General',
  };
  return labels[type] || labels.default;
}

/**
 * Get default triggers based on skill type
 */
function getDefaultTriggers(skillType: string, name: string): string[] {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const triggersByType: Record<string, string[]> = {
    automation: [
      `Triggers on phrases like "run ${slug}"`,
      `Triggers on phrases like "execute ${slug}"`,
      `Triggers on phrases like "start the ${slug} process"`,
    ],
    api: [
      `Triggers on phrases like "call ${slug}"`,
      `Triggers on phrases like "fetch from ${slug}"`,
      `Triggers on phrases like "query the ${slug} API"`,
    ],
    data: [
      `Triggers on phrases like "process ${slug} data"`,
      `Triggers on phrases like "analyze ${slug}"`,
      `Triggers on phrases like "run ${slug} report"`,
    ],
    monitoring: [
      `Triggers on phrases like "check ${slug} status"`,
      `Triggers on phrases like "monitor ${slug}"`,
      `Triggers on phrases like "alert on ${slug}"`,
    ],
    communication: [
      `Triggers on phrases like "send ${slug} message"`,
      `Triggers on phrases like "notify via ${slug}"`,
      `Triggers on phrases like "post to ${slug}"`,
    ],
    analysis: [
      `Triggers on phrases like "analyze ${slug}"`,
      `Triggers on phrases like "run ${slug} analysis"`,
      `Triggers on phrases like "generate ${slug} report"`,
    ],
    utility: [
      `Triggers on phrases like "use ${slug}"`,
      `Triggers on phrases like "run ${slug}"`,
      `Triggers on phrases like "execute ${slug} task"`,
    ],
    default: [
      `Triggers on phrases like "use ${slug}"`,
      `Triggers on phrases like "run ${slug}"`,
      `Triggers on phrases like "${slug}"`,
    ],
  };
  
  const typeKey = Object.keys(triggersByType).includes(skillType) ? skillType : 'default';
  return triggersByType[typeKey];
}

/**
 * Get default tools based on skill type and services
 */
function getDefaultTools(skillType: string, services: string[]): string[] {
  const baseTools = ['exec', 'read', 'write'];
  
  const typeTools: Record<string, string[]> = {
    automation: ['exec'],
    api: ['web_fetch', 'read'],
    data: ['exec', 'read', 'write'],
    monitoring: ['web_fetch', 'exec'],
    communication: ['message', 'exec'],
    analysis: ['web_fetch', 'read', 'exec'],
    utility: ['exec', 'read', 'write'],
  };
  
  const tools = new Set([...baseTools, ...(typeTools[skillType] || typeTools.utility)]);
  
  // Add web_fetch for any service that needs web access
  if (services.some(s => ['web', 'api', 'http', 'fetch', 'search'].includes(s.toLowerCase()))) {
    tools.add('web_fetch');
  }
  
  return Array.from(tools);
}

/**
 * Generate SKILL.md content from template (no AI required)
 */
export function generateSkillMdFromTemplate(options: TemplateOptions): string {
  const { description, classification } = options;
  
  const { name, type, language, services } = classification;
  const triggers = getDefaultTriggers(type, name);
  const tools = getDefaultTools(type, services);
  const skillTypeLabel = getSkillTypeLabel(type);
  
  return `# ${name}

> ${description}

## Metadata

- **Skill Type:** ${skillTypeLabel}
- **Language:** ${language || 'typescript'}
- **Services:** ${services.length > 0 ? services.join(', ') : 'None detected'}

## When to Use

${triggers.map(t => `- ${t}`).join('\n')}

Triggers on any request that matches the skill's purpose as described above.

## How to Use

1. Install this skill in your OpenClaw skills directory
2. Reference the skill by name when making requests
3. The skill will process your request and return results

## Workflow

\`\`\`typescript
// Example usage flow
const result = await executeSkill("${name}", {
  // Pass relevant parameters based on request
});
\`\`\`

### Step 1: Parse Request
Understand the user's intent and extract relevant parameters from the request.

### Step 2: Execute Task
Perform the core action based on the skill's purpose:
- Use appropriate tools (${tools.join(', ')})
- Handle errors gracefully
- Return structured results

### Step 3: Format Response
Present results in a clear, actionable format.

## Tools Needed

The following OpenClaw tools are used by this skill:

| Tool | Purpose |
|------|---------|
${tools.map(t => `| \`${t}\` | Tool for ${t.replace('_', ' ')} operations |`).join('\n')}

## Configuration

No additional configuration required beyond default OpenClaw setup.

## Examples

### Example 1: Basic Request
\`\`\`
User: ${triggers[0].replace('Triggers on phrases like ', '')}
Skill: Processes the request and returns results
\`\`\`

### Example 2: Parameterized Request
\`\`\`
User: ${triggers[1].replace('Triggers on phrases like ', '')} with specific parameters
Skill: Extracts parameters, executes task, returns formatted output
\`\`\`

## References

${services.length > 0 ? services.map(s => `- [${s}](references/${s.toLowerCase().replace(/\s+/g, '-')}-api.md)`).join('\n') : 'No external references required.'}

## Limitations

- Results depend on available tools and permissions
- Rate limits may apply for external API calls
- Some features may require Pro tier

---
*Generated by SkillForge (Template Mode)*
*For enhanced generation with AI, set one of: ZAI_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY, or QWEN_API_KEY*
`;
}

export default generateSkillMd;
