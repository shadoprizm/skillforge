/**
 * Prompt Templates for SkillForge
 * The OpenClaw AgentSkills spec is hardcoded here — no external API calls needed for spec knowledge.
 */
/**
 * System prompt for SKILL.md generation
 */
export declare function getSkillMdSystemPrompt(): string;
/**
 * User prompt for SKILL.md generation
 */
export declare function getSkillMdUserPrompt(description: string, skillType: string): string;
/**
 * System prompt for skill.json generation
 */
export declare function getSkillJsonSystemPrompt(): string;
/**
 * User prompt for skill.json generation
 */
export declare function getSkillJsonUserPrompt(description: string, skillName: string): string;
/**
 * System prompt for script scaffolding (Pro feature)
 */
export declare function getScriptSystemPrompt(language: 'typescript' | 'javascript' | 'python'): string;
/**
 * User prompt for script scaffolding
 */
export declare function getScriptUserPrompt(description: string, skillName: string, language: string): string;
/**
 * System prompt for reference doc generation (Pro feature)
 */
export declare function getReferenceSystemPrompt(): string;
/**
 * User prompt for reference doc generation
 */
export declare function getReferenceUserPrompt(serviceName: string, description: string): string;
/**
 * Prompt for classifying skill type
 */
export declare function getClassifierPrompt(description: string): string;
//# sourceMappingURL=prompts.d.ts.map