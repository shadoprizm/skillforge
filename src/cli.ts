/**
 * SkillForge CLI
 * Entry point for the skill generation tool
 */

import { Command } from 'commander';
import { execSync } from 'child_process';
import { SkillGenerator } from './generator/index.js';
import { SkillAuditor, formatReport, type OutputFormat } from './auditor/index.js';
import AuthManager from './auth/index.js';

const program = new Command();

program
  .name('skillforge')
  .description('AI-powered CLI that generates complete, publish-ready OpenClaw agent skills from natural language descriptions')
  .version('0.3.0');

program
  .argument('<description>', 'Natural language description of the skill to generate')
  .option('-o, --output <path>', 'Output directory for the generated skill', './my-skill')
  .option('-l, --lang <language>', 'Scripting language (typescript, javascript, python)', undefined)
  .option('--pro', 'Enable Pro features (requires API key)', false)
  .option('--api-key <key>', 'API key for Pro features')
  .option('--publish', 'Publish to ClawHub (Pro feature)')
  .action(async (description: string, options: {
    output?: string;
    lang?: string;
    pro?: boolean;
    apiKey?: string;
    publish?: boolean;
  }) => {
    console.log('\n🔨 SkillForge — AI Skill Generator\n');
    console.log(`📝 Description: ${description}\n`);

    const authManager = new AuthManager();
    
    // Check API key for Pro features only (--publish is free tier)
    if (options.pro) {
      const key = options.apiKey || authManager.getApiKey();
      if (!key || !authManager.isProKey(key)) {
        console.error('❌ Pro features require a valid API key');
        console.error('   Use --api-key <key> or run `skillforge config --set-api-key <key>`');
        process.exit(1);
      }
    }

    // Generate the skill
    const generator = new SkillGenerator();
    const result = await generator.generate({
      description,
      output: options.output,
      language: options.lang,
      apiKey: options.apiKey,
      isPro: options.pro,
      publish: options.publish,
    });

    if (!result.success) {
      console.error(`\n❌ Generation failed: ${result.error || 'validation errors'}`);
      if (result.validation.errors.length > 0) {
        console.error(`\n   Validation errors:`);
        for (const error of result.validation.errors) {
          console.error(`      • ${error}`);
        }
      }
      process.exit(1);
    }

    // Report results
    console.log(`\n✅ Skill generated successfully!\n`);
    console.log(`   📁 Location: ${result.skillPath}`);
    console.log(`   📦 Name: ${result.skillName}`);
    console.log(`   🚀 Tier: ${result.isPro ? 'Pro' : 'Free'}`);
    console.log(`   📄 Files: ${result.files.length}`);
    
    console.log(`\n   Generated files:`);
    for (const file of result.files) {
      console.log(`      • ${file}`);
    }

    if (result.validation.warnings.length > 0) {
      console.log(`\n   ⚠️  Warnings:`);
      for (const warning of result.validation.warnings) {
        console.log(`      • ${warning}`);
      }
    }

    if (result.published) {
      console.log('\n   🚀 Published to ClawHub!');
    }

    if (!result.validation.valid) {
      console.log(`\n   ❌ Validation errors:`);
      for (const error of result.validation.errors) {
        console.log(`      • ${error}`);
      }
    }

    console.log('\n✨ Done!\n');
  });

// Config command
program
  .command('config')
  .description('Manage SkillForge configuration')
  .action(() => {
    const authManager = new AuthManager();
    const key = authManager.getApiKey();
    const lang = authManager.getDefaultLanguage();
    const output = authManager.getDefaultOutput();

    console.log('\n⚙️  SkillForge Configuration\n');
    console.log(`   API Key: ${key ? '***' + key.slice(-4) : 'not set'}`);
    console.log(`   Default Language: ${lang}`);
    console.log(`   Default Output: ${output}\n`);
  });

// Config set commands
program
  .command('config:set-api-key <key>')
  .description('Set your API key')
  .action((key: string) => {
    const authManager = new AuthManager();
    if (authManager.isProKey(key)) {
      authManager.setApiKey(key);
      console.log('✅ API key saved');
    } else {
      console.error('❌ Invalid API key');
      process.exit(1);
    }
  });

program
  .command('config:set-language <lang>')
  .description('Set default language (typescript, javascript, python)')
  .action((lang: string) => {
    if (!['typescript', 'javascript', 'python'].includes(lang)) {
      console.error('❌ Invalid language. Choose: typescript, javascript, python');
      process.exit(1);
    }
    const authManager = new AuthManager();
    authManager.setDefaultLanguage(lang);
    console.log(`✅ Default language set to ${lang}`);
  });

program
  .command('config:set-output <path>')
  .description('Set default output directory')
  .action((path: string) => {
    const authManager = new AuthManager();
    authManager.setDefaultOutput(path);
    console.log(`✅ Default output set to ${path}`);
  });

// Login command — open ClawHub login flow
program
  .command('login')
  .description('Authenticate with ClawHub to enable --publish')
  .action(() => {
    try {
      execSync('clawhub login', { stdio: 'inherit' });
    } catch {
      console.error('❌ ClawHub login failed or ClawHub CLI is not installed.');
      console.error('   Install: npm install -g clawhub');
      process.exit(1);
    }
  });

// Audit command
program
  .command('audit <skill-path>')
  .description('Audit an existing skill for quality, structure, completeness, and safety')
  .option('-f, --format <format>', 'Output format: table, json, markdown', 'table' as OutputFormat)
  .option('--pro', 'Enable Pro AI-powered deep analysis', false)
  .option('--api-key <key>', 'API key for Pro features')
  .action(async (skillPath: string, options: {
    format?: string;
    pro?: boolean;
    apiKey?: string;
  }) => {
    const fmt = (options.format || 'table') as OutputFormat;
    if (!['table', 'json', 'markdown'].includes(fmt)) {
      console.error(`❌ Invalid format: ${fmt}. Use table, json, or markdown.`);
      process.exit(1);
    }

    const auditor = new SkillAuditor();

    // Pro check
    let isPro = false;
    if (options.pro) {
      const authManager = new AuthManager();
      const key = options.apiKey || authManager.getApiKey();
      if (!key || !authManager.isProKey(key)) {
        console.error('❌ Pro features require a valid API key');
        console.error('   Use --api-key <key> or run `skillforge config:set-api-key <key>`');
        process.exit(1);
      }
      isPro = true;
    }

    try {
      const report = auditor.audit(skillPath, isPro);
      console.log(formatReport(report, fmt));
    } catch (err) {
      console.error(`\n❌ Audit failed: ${err instanceof Error ? err.message : String(err)}\n`);
      process.exit(1);
    }
  });

program.parse();

// Export for testing
export { program };
export default program;
