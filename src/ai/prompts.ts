/**
 * Prompt Templates for SkillForge
 * The OpenClaw AgentSkills spec is hardcoded here — no external API calls needed for spec knowledge.
 */

// The complete OpenClaw AgentSkills spec — this is the source of truth
// Split into parts to avoid template literal escaping issues
const SPEC_PART1 = `
# OpenClaw AgentSkills Specification

## Overview
An OpenClaw Skill is a specialized instruction set that extends an AI agent's capabilities for a specific task domain. Skills are stored as markdown files and registered in the agent's configuration.

## File Structure
skill-name/
  SKILL.md          # Required: The skill definition
  skill.json        # Required: ClawHub metadata
  references/       # Optional: External documentation
  scripts/          # Optional: Implementation code
  README.md          # Optional: User-facing documentation

## SKILL.md Format

### Required Frontmatter
# SKILL.md — <Skill Name>

<description>

## Triggers
- <trigger phrase 1>
- <trigger phrase 2>

## Instructions
[Detailed instructions using tool names: exec, read, write, edit, web_fetch, web_search, etc.]

### Required Fields
- <name> or first heading: The skill name (kebab-case becomes directory name)
- <description>: Comprehensive description of what the skill does. This is CRITICAL — OpenClaw uses this to match user requests to skills. Make it detailed and specific.
- <location>: Path to the skill directory (relative or absolute)
- <triggers>: List of phrases that activate this skill
- <instructions>: Step-by-step instructions using actual tool names
`;

const SPEC_PART2 = `
### Tool References
Instructions MUST reference tools by their exact names:
- exec: Run shell commands
- read: Read file contents
- write: Create or overwrite files
- edit: Make precise edits to files
- web_fetch: Fetch and extract readable content from a URL
- web_search: Search the web using Perplexity Sonar
- image: Analyze images
- pdf: Analyze PDF documents
- message: Send messages via channel plugins
- tts: Convert text to speech
- canvas: Control node canvases
- exec (elevated): Run with elevated permissions (when available)

### Instruction Style
- Be specific and actionable
- Include error handling guidance
- Reference file paths relative to workspace
- Break complex tasks into numbered steps

## skill.json Format

{
  "name": "skill-name",
  "version": "1.0.0",
  "author": "Your Name or Org",
  "description": "Comprehensive skill description for ClawHub listing",
  "tags": ["monitoring", "automation", "ai"],
  "category": "automation"
}

### Categories
- monitoring
- automation
- research
- browser
- data
- communication
- developer
- utility

### Tags
Use specific tags: hacker-news, weather, email, discord, github, twitter, finance, news, etc.
`;

const OPENCLAW_SPEC = SPEC_PART1 + SPEC_PART2;

/**
 * System prompt for SKILL.md generation
 */
export function getSkillMdSystemPrompt(): string {
  return `You are SkillForge, an AI that generates OpenClaw agent skills from natural language descriptions.

Follow the OpenClaw AgentSkills specification EXACTLY:

${OPENCLAW_SPEC}

Rules:
1. Generate a COMPLETE SKILL.md with all required fields
2. The description field MUST be comprehensive — this is what OpenClaw uses to match requests
3. Use specific tool names: exec, read, write, edit, web_fetch, web_search, etc.
4. Generate realistic trigger phrases that users would actually type
5. Instructions should be detailed enough that an AI agent can follow them WITHOUT additional context
6. Keep the skill FOCUSED on one domain — don't try to do too much
7. Output ONLY the SKILL.md content — no markdown code fences, no explanation
8. Start with the skill name as a heading`;
}

/**
 * User prompt for SKILL.md generation
 */
export function getSkillMdUserPrompt(description: string, skillType: string): string {
  return `Generate a complete SKILL.md for this skill:

Description: ${description}
Skill Type: ${skillType}

Generate the full SKILL.md content following the OpenClaw spec exactly.`;
}

/**
 * System prompt for skill.json generation
 */
export function getSkillJsonSystemPrompt(): string {
  return `You are SkillForge, an AI that generates OpenClaw skill metadata.

Generate a skill.json for a skill described by the user. Follow this format EXACTLY:

{
  "name": "kebab-case-skill-name",
  "version": "1.0.0",
  "author": "SkillForge",
  "description": "A comprehensive description of what this skill does, suitable for a marketplace listing",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "one-of: monitoring | automation | research | browser | data | communication | developer | utility"
}

Rules:
1. Name must be kebab-case (lowercase with hyphens)
2. Tags should be specific and useful for discovery
3. Category must be one of the allowed values
4. Output ONLY the JSON — no markdown, no explanation
5. Author is "SkillForge" unless you have specific attribution info`;
}

/**
 * User prompt for skill.json generation
 */
export function getSkillJsonUserPrompt(description: string, skillName: string): string {
  return `Generate skill.json for:

Name: ${skillName}
Description: ${description}`;
}

/**
 * System prompt for script scaffolding (Pro feature)
 */
export function getScriptSystemPrompt(language: 'typescript' | 'javascript' | 'python'): string {
  const configs = {
    typescript: {
      file: 'main.ts',
    },
    javascript: {
      file: 'main.js',
    },
    python: {
      file: 'main.py',
    },
  };

  const config = configs[language];

  return `You are SkillForge Pro, generating implementation boilerplate for an OpenClaw skill.

Generate a working ${config.file} that implements the skill's core functionality.

Rules:
1. Generate REAL, WORKING code — not pseudocode
2. Include proper error handling
3. Use the appropriate tools/API for the language
4. Make it runnable with minimal setup
5. Output ONLY the code — no markdown, no explanation
6. Include comments explaining key sections`;
}

/**
 * User prompt for script scaffolding
 */
export function getScriptUserPrompt(description: string, skillName: string, language: string): string {
  return `Generate ${language} implementation boilerplate for:

Skill: ${skillName}
Description: ${description}`;
}

/**
 * System prompt for reference doc generation (Pro feature)
 */
export function getReferenceSystemPrompt(): string {
  return `You are SkillForge Pro, generating API reference documentation for an OpenClaw skill.

Generate a comprehensive API reference document for the target service.

Rules:
1. Cover authentication, endpoints, rate limits, and common use cases
2. Include code examples in multiple languages if helpful
3. Output as markdown with proper headers
4. Be practical — focus on what a skill implementer needs
5. Output ONLY the markdown document — no explanation`;
}

/**
 * User prompt for reference doc generation
 */
export function getReferenceUserPrompt(serviceName: string, description: string): string {
  return `Generate API reference for:

Service: ${serviceName}
Purpose: ${description}`;
}

/**
 * Prompt for classifying skill type
 */
export function getClassifierPrompt(description: string): string {
  return `Classify this skill description and return ONLY a JSON object:

{
  "type": "monitoring | automation | research | browser | data | communication | developer | utility",
  "language": "typescript | javascript | python",
  "services": ["service1", "service2"],
  "name": "kebab-case-name-derived-from-description"
}

Description: ${description}

Output ONLY the JSON object, no markdown, no explanation.`;
}
