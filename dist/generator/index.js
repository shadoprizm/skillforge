/**
 * Main Generator Orchestrator
 * Coordinates the entire skill generation pipeline
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import AIClient from '../ai/client.js';
import AuthManager from '../auth/index.js';
import classifySkill from './classifier.js';
import generateSkillMd from './skill-md.js';
import generateSkillJson from './skill-json.js';
import generateScript, { generateToolsHelper } from './scripts.js';
import generateReferences from './references.js';
import validateSkill from './validator.js';
export class SkillGenerator {
    aiClient;
    authManager;
    constructor() {
        this.aiClient = new AIClient();
        this.authManager = new AuthManager();
    }
    /**
     * Generate a complete skill from description
     */
    async generate(options) {
        const { description, output = './my-skill', language, apiKey, isPro = false, } = options;
        // Check Pro access
        let hasProAccess = false;
        if (apiKey) {
            hasProAccess = this.authManager.isProKey(apiKey);
            if (hasProAccess) {
                this.authManager.setApiKey(apiKey);
            }
        }
        else {
            const storedKey = this.authManager.getApiKey();
            if (storedKey) {
                hasProAccess = this.authManager.isProKey(storedKey);
            }
        }
        const effectiveIsPro = isPro && hasProAccess;
        // Classify the skill
        const classification = classifySkill(description);
        // Override language if specified
        if (language && ['typescript', 'javascript', 'python'].includes(language)) {
            classification.language = language;
        }
        // Determine output path
        const skillPath = output.startsWith('/')
            ? output
            : join(process.cwd(), output);
        const skillName = classification.name;
        try {
            // Create directory
            mkdirSync(skillPath, { recursive: true });
            const files = [];
            // Generate SKILL.md
            console.log('  📝 Generating SKILL.md...');
            const skillMdContent = await generateSkillMd({
                description,
                skillType: classification.type,
                aiClient: this.aiClient,
            });
            writeFileSync(join(skillPath, 'SKILL.md'), skillMdContent, 'utf-8');
            files.push('SKILL.md');
            // Generate skill.json
            console.log('  📋 Generating skill.json...');
            const skillJsonData = await generateSkillJson({
                description,
                classification,
                aiClient: this.aiClient,
            });
            writeFileSync(join(skillPath, 'skill.json'), JSON.stringify(skillJsonData, null, 2), 'utf-8');
            files.push('skill.json');
            // Pro features
            if (effectiveIsPro) {
                console.log('  🚀 Pro: Generating scripts...');
                // Create scripts directory
                mkdirSync(join(skillPath, 'scripts'), { recursive: true });
                // Generate main script
                const script = await generateScript({
                    description,
                    skillName,
                    classification,
                    aiClient: this.aiClient,
                });
                writeFileSync(join(skillPath, 'scripts', script.fileName), script.content, 'utf-8');
                files.push(`scripts/${script.fileName}`);
                // Generate tools helper
                const toolsHelper = generateToolsHelper(classification.language);
                const toolsExt = classification.language === 'typescript' ? 'ts' : 'js';
                writeFileSync(join(skillPath, 'scripts', `tools.${toolsExt}`), toolsHelper, 'utf-8');
                files.push(`scripts/tools.${toolsExt}`);
                // Generate references if services detected
                if (classification.services.length > 0) {
                    console.log('  📚 Pro: Generating references...');
                    mkdirSync(join(skillPath, 'references'), { recursive: true });
                    const references = await generateReferences({
                        services: classification.services,
                        description,
                        aiClient: this.aiClient,
                    });
                    for (const ref of references) {
                        writeFileSync(join(skillPath, 'references', ref.fileName), ref.content, 'utf-8');
                        files.push(`references/${ref.fileName}`);
                    }
                }
                // Generate README
                console.log('  📖 Pro: Generating README.md...');
                const readme = generateReadme(skillName, description, skillJsonData);
                writeFileSync(join(skillPath, 'README.md'), readme, 'utf-8');
                files.push('README.md');
            }
            // Validate output
            console.log('  ✅ Validating...');
            const validation = validateSkill(skillPath);
            return {
                success: validation.valid && !validation.errors.length,
                skillPath,
                skillName,
                isPro: effectiveIsPro,
                validation,
                files,
            };
        }
        catch (error) {
            return {
                success: false,
                skillPath,
                skillName: classification.name,
                isPro: effectiveIsPro,
                validation: { valid: false, errors: [], warnings: [] },
                files: [],
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
/**
 * Generate a README for Pro skills
 */
function generateReadme(name, description, meta) {
    return `# ${meta.name}

${meta.description}

## Installation

\`\`\`bash
# Copy to your OpenClaw skills directory
cp -r ${name} ~/.openclaw/skills/
\`\`\`

## Usage

Describe how to use this skill in your OpenClaw agent.

## Files

- \`SKILL.md\` — Skill definition
- \`skill.json\` — Metadata
${meta.tags.includes('pro') ? '- \`scripts/\` — Implementation\n' : ''}- \`references/\` — API documentation

## Metadata

- **Version:** ${meta.version}
- **Author:** ${meta.author}
- **Category:** ${meta.category}
- **Tags:** ${meta.tags.join(', ')}

---
*Generated by SkillForge*
`;
}
export default SkillGenerator;
//# sourceMappingURL=index.js.map