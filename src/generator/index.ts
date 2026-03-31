/**
 * Main Generator Orchestrator
 * Coordinates the entire skill generation pipeline
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import AIClient from '../ai/client.js';
import AuthManager from '../auth/index.js';
import classifySkill, { SkillClassification } from './classifier.js';
import generateSkillMd from './skill-md.js';
import generateSkillJson, { SkillJsonData } from './skill-json.js';
import generateScript, { generateToolsHelper } from './scripts.js';
import generateReferences from './references.js';
import validateSkill from './validator.js';

export interface GeneratorOptions {
  description: string;
  output?: string;
  language?: string;
  apiKey?: string;
  isPro?: boolean;
  publish?: boolean;
}

export interface GenerationResult {
  success: boolean;
  skillPath: string;
  skillName: string;
  isPro: boolean;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  files: string[];
  published?: boolean;
  error?: string;
}

export class SkillGenerator {
  private aiClient: AIClient;
  private authManager: AuthManager;

  constructor() {
    this.aiClient = new AIClient();
    this.authManager = new AuthManager();
  }

  /**
   * Publish a generated skill to ClawHub
   */
  private async publishToClawHub(skillPath: string, skillName: string): Promise<boolean> {
    console.log('  🚀 Publishing to ClawHub...');

    // Check if clawhub is installed
    try {
      execSync('which clawhub', { stdio: 'pipe' });
    } catch {
      console.error('  ❌ ClawHub CLI is not installed.');
      console.error('     Install it with: npm install -g clawhub');
      console.error('     Then run: skillforge login');
      return false;
    }

    // Check if authenticated
    try {
      execSync('clawhub whoami', { stdio: 'pipe', encoding: 'utf-8' });
    } catch {
      console.error('  ❌ Not authenticated with ClawHub.');
      console.error('     Run `skillforge login` to authenticate, then try again.');
      return false;
    }

    // Generate slug from skill name
    const slug = skillName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const output = execSync(
        `clawhub publish "${skillPath}" --slug "${slug}" --name "${skillName}" --version "1.0.0" --tags "latest"`,
        { encoding: 'utf-8' }
      );
      console.log(`  ✅ Published to https://clawhub.ai/skills/${slug}`);
      if (output) console.log(output);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Extract message from exec error if possible
      const stderr = (error as any)?.stderr || '';
      console.error(`  ❌ Failed to publish: ${stderr || msg}`);
      return false;
    }
  }

  /**
   * Generate a complete skill from description
   */
  async generate(options: GeneratorOptions): Promise<GenerationResult> {
    const {
      description,
      output = './my-skill',
      language,
      apiKey,
      isPro = false,
    } = options;

    // Check Pro access
    let hasProAccess = false;
    if (apiKey) {
      hasProAccess = this.authManager.isProKey(apiKey);
      if (hasProAccess) {
        this.authManager.setApiKey(apiKey);
      }
    } else {
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
      classification.language = language as SkillClassification['language'];
    }

    // Determine output path
    const skillPath = output.startsWith('/') 
      ? output 
      : join(process.cwd(), output);
    
    const skillName = classification.name;

    try {
      // Create directory
      mkdirSync(skillPath, { recursive: true });
      
      const files: string[] = [];

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
      writeFileSync(
        join(skillPath, 'skill.json'),
        JSON.stringify(skillJsonData, null, 2),
        'utf-8'
      );
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
        const toolsHelper = generateToolsHelper(classification.language as 'typescript' | 'javascript');
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

      const success = validation.valid && !validation.errors.length;

      // Publish to ClawHub if requested
      let published = false;
      if (success && options.publish) {
        published = await this.publishToClawHub(skillPath, skillName);
      }

      return {
        success,
        skillPath,
        skillName,
        isPro: effectiveIsPro,
        validation,
        files,
        published,
      };

    } catch (error) {
      return {
        success: false,
        skillPath,
        skillName: classification.name,
        isPro: effectiveIsPro,
        validation: { valid: false, errors: [], warnings: [] },
        files: [],
        published: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Generate a README for Pro skills
 */
function generateReadme(name: string, description: string, meta: SkillJsonData): string {
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
