/**
 * Skill Auditor
 * Evaluates OpenClaw skills for quality, structure, completeness, and safety.
 * Supports both template-based (free) and AI-powered (pro) analysis.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

// ── Types ────────────────────────────────────────────────────────────

export interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  category: AuditCategory;
  file: string;
  line?: number;
  message: string;
}

export interface CategoryScore {
  score: number;      // 0–100
  issues: AuditIssue[];
}

export type AuditCategory = 'structure' | 'completeness' | 'quality' | 'safety' | 'compatibility';

export interface AuditReport {
  skillName: string;
  overallScore: number;
  grade: string;
  categories: Record<AuditCategory, CategoryScore>;
  issues: AuditIssue[];
  recommendations: Recommendation[];
  isPro: boolean;
}

export interface Recommendation {
  impact: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedCategories: AuditCategory[];
}

export type OutputFormat = 'table' | 'json' | 'markdown';

// ── Weights for overall score ───────────────────────────────────────

const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  structure: 0.20,
  completeness: 0.25,
  quality: 0.25,
  safety: 0.20,
  compatibility: 0.10,
};

// ── Grade thresholds ────────────────────────────────────────────────

function toGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// ── Core Auditor ────────────────────────────────────────────────────

export class SkillAuditor {
  /**
   * Resolve the skill path — handles ClawHub URLs and local paths.
   */
  resolvePath(input: string): string {
    // ClawHub URL pattern: clawhub.ai/author/skill-name
    if (/clawhub\.ai\//i.test(input)) {
      // For now, suggest using `clawhub install` first
      throw new Error(
        'ClawHub URLs detected. Install the skill first, then audit the local directory.\n' +
        '  clawhub install ' + input + '\n' +
        '  skillforge audit ./installed-skill-name'
      );
    }
    return resolve(input);
  }

  /**
   * Run a full audit on a skill directory.
   */
  audit(skillPath: string, isPro = false): AuditReport {
    const skillPathRes = resolve(skillPath);

    if (!existsSync(skillPathRes)) {
      throw new Error(`Skill directory not found: ${skillPathRes}`);
    }

    const categories: Record<AuditCategory, CategoryScore> = {
      structure: this.checkStructure(skillPathRes),
      completeness: this.checkCompleteness(skillPathRes),
      quality: this.checkQuality(skillPathRes),
      safety: this.checkSafety(skillPathRes),
      compatibility: this.checkCompatibility(skillPathRes),
    };

    const allIssues = Object.values(categories).flatMap(c => c.issues);
    const recommendations = this.generateRecommendations(categories);

    const overallScore = Math.round(
      Object.entries(categories).reduce(
        (sum, [cat, data]) => sum + data.score * CATEGORY_WEIGHTS[cat as AuditCategory],
        0
      )
    );

    const skillName = this.inferSkillName(skillPathRes);

    return {
      skillName,
      overallScore,
      grade: toGrade(overallScore),
      categories,
      issues: allIssues,
      recommendations,
      isPro,
    };
  }

  // ── Category: Structure ───────────────────────────────────────

  private checkStructure(dir: string): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    // Required files
    const required = ['SKILL.md', 'skill.json'];
    for (const f of required) {
      if (!existsSync(join(dir, f))) {
        issues.push({ severity: 'error', category: 'structure', file: f, message: `Missing required file: ${f}` });
        score -= 30;
      }
    }

    // Expected directories (warnings if missing, not errors)
    if (!existsSync(join(dir, 'references')) && !existsSync(join(dir, 'scripts'))) {
      issues.push({ severity: 'info', category: 'structure', file: '/', message: 'No references/ or scripts/ directory found — consider adding implementation files' });
      score -= 5;
    }

    // Orphan / unexpected files at root level
    const allowedRoot = new Set(['SKILL.md', 'skill.json', 'README.md', 'references', 'scripts', 'assets', 'tests']);
    const rootEntries = readdirSync(dir);
    const orphans = rootEntries.filter(e => !allowedRoot.has(e) && !e.startsWith('.'));
    if (orphans.length > 2) {
      issues.push({ severity: 'warning', category: 'structure', file: '/', message: `Many unexpected root files: ${orphans.join(', ')}` });
      score -= 10;
    }

    // skill.json must be valid JSON
    const sjPath = join(dir, 'skill.json');
    if (existsSync(sjPath)) {
      try {
        JSON.parse(readFileSync(sjPath, 'utf-8'));
      } catch {
        issues.push({ severity: 'error', category: 'structure', file: 'skill.json', message: 'skill.json is not valid JSON' });
        score -= 25;
      }
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  // ── Category: Completeness ────────────────────────────────────

  private checkCompleteness(dir: string): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;
    const skillMd = join(dir, 'SKILL.md');
    const sjPath = join(dir, 'skill.json');

    // SKILL.md required sections
    if (existsSync(skillMd)) {
      const content = readFileSync(skillMd, 'utf-8').toLowerCase();
      const requiredSections = ['description', 'trigger', 'workflow', 'tool'];
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          issues.push({ severity: 'warning', category: 'completeness', file: 'SKILL.md', message: `SKILL.md may be missing "${section}" section` });
          score -= 15;
        }
      }
      // Constraints / edge cases section
      if (!content.includes('constraint') && !content.includes('not for') && !content.includes('do not')) {
        issues.push({ severity: 'info', category: 'completeness', file: 'SKILL.md', message: 'Consider adding constraints or "NOT for" guidance' });
        score -= 5;
      }
    }

    // skill.json required fields
    if (existsSync(sjPath)) {
      try {
        const data = JSON.parse(readFileSync(sjPath, 'utf-8'));
        const requiredFields = ['name', 'version', 'author', 'description', 'tags', 'category'];
        for (const field of requiredFields) {
          if (!data[field]) {
            issues.push({ severity: 'warning', category: 'completeness', file: 'skill.json', message: `Missing field: ${field}` });
            score -= 10;
          }
        }
        if (data.tags && Array.isArray(data.tags) && data.tags.length < 2) {
          issues.push({ severity: 'info', category: 'completeness', file: 'skill.json', message: 'Consider adding more tags for discoverability' });
          score -= 5;
        }
      } catch { /* already caught in structure check */ }
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  // ── Category: Quality ─────────────────────────────────────────

  private checkQuality(dir: string): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 70; // start at 70, earn points

    const skillMd = join(dir, 'SKILL.md');
    if (!existsSync(skillMd)) {
      return { score: 0, issues: [{ severity: 'error', category: 'quality', file: 'SKILL.md', message: 'No SKILL.md to evaluate' }] };
    }

    const content = readFileSync(skillMd, 'utf-8');
    const lines = content.split('\n');

    // Description quality — check it's more than a one-liner
    const descMatch = content.match(/#+\s*(description|overview|about)/i);
    if (descMatch) {
      const descIdx = lines.findIndex(l => /#+\s*(description|overview|about)/i.test(l));
      const descBlock = lines.slice(descIdx, descIdx + 5).join('\n');
      if (descBlock.length > 100) score += 10;
    } else if (content.length > 200) {
      score += 5; // reasonable content even without explicit section
    }

    // Trigger specificity — look for trigger phrases
    const triggers = (content.match(/(?:trigger|when the|use when|triggers on)/gi) || []).length;
    if (triggers >= 2) score += 8;
    else if (triggers >= 1) score += 4;

    // Workflow detail — step-by-step indicators
    const steps = (content.match(/\d+\.\s|step\s*\d|- \*\*/gi) || []).length;
    if (steps >= 4) score += 12;
    else if (steps >= 2) score += 6;

    // Examples present
    if (content.includes('example') || content.includes('```') || content.includes('e.g.')) {
      score += 8;
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  // ── Category: Safety ──────────────────────────────────────────

  private checkSafety(dir: string): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    const dangerousPatterns = [
      { pattern: /rm\s+-rf|rm\s+ -rf/i, msg: 'Potentially dangerous rm -rf pattern' },
      { pattern: /sudo\s+|doas\s+/i, msg: 'Privilege escalation (sudo/doas)' },
      { pattern: /curl.*\|\s*(ba)?sh/i, msg: 'Piped curl|bash — injection risk' },
      { pattern: /eval\s*\(/i, msg: 'Dynamic eval() usage' },
      { pattern: /child_process.*exec\(/i, msg: 'Raw exec() without sanitization warning' },
      { pattern: /--dangerously-set-innerhtml/i, msg: 'DangerouslySetInnerHTML usage' },
      { pattern: /WRITE\s+TO\s+DATABASE|DROP\s+TABLE|DELETE\s+FROM/i, msg: 'Destructive SQL pattern' },
    ];

    const secretPatterns = [
      { pattern: /(?:api[_-]?key|password|secret|token)\s*[:=]\s*['"][^'"]{8,}/i, msg: 'Possible hardcoded secret detected' },
      { pattern: /sk_[a-zA-Z0-9]{20,}/, msg: 'Hardcoded API key-like string' },
    ];

    // Scan all files
    const walkFiles = (d: string): string[] => {
      const results: string[] = [];
      for (const entry of readdirSync(d)) {
        const full = join(d, entry);
        if (statSync(full).isDirectory()) {
          if (!entry.startsWith('.') && entry !== 'node_modules') results.push(...walkFiles(full));
        } else {
          results.push(full);
        }
      }
      return results;
    };

    const files = walkFiles(dir);
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const relPath = file.replace(dir + '/', '');

        for (const { pattern, msg } of dangerousPatterns) {
          if (pattern.test(content)) {
            const line = content.split('\n').findIndex(l => pattern.test(l)) + 1;
            issues.push({ severity: 'warning', category: 'safety', file: relPath, line: line || undefined, message: msg });
            score -= 15;
          }
        }

        for (const { pattern, msg } of secretPatterns) {
          if (pattern.test(content)) {
            const line = content.split('\n').findIndex(l => pattern.test(l)) + 1;
            issues.push({ severity: 'error', category: 'safety', file: relPath, line: line || undefined, message: msg });
            score -= 25;
          }
        }
      } catch { /* skip binary files */ }
    }

    // Deduplicate issues by message
    const seen = new Set<string>();
    const deduped = issues.filter(i => {
      const key = `${i.file}:${i.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { score: Math.max(0, Math.min(100, score)), issues: deduped };
  }

  // ── Category: Compatibility ───────────────────────────────────

  private checkCompatibility(dir: string): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    const sjPath = join(dir, 'skill.json');
    if (existsSync(sjPath)) {
      try {
        const data = JSON.parse(readFileSync(sjPath, 'utf-8'));

        // Category check
        const validCategories = ['monitoring', 'automation', 'research', 'browser', 'data', 'communication', 'developer', 'utility'];
        if (data.category && !validCategories.includes(data.category)) {
          issues.push({ severity: 'warning', category: 'compatibility', file: 'skill.json', message: `Unknown category "${data.category}" — expected one of: ${validCategories.join(', ')}` });
          score -= 15;
        }

        // Version format
        if (data.version && !/^\d+\.\d+\.\d+/.test(data.version)) {
          issues.push({ severity: 'warning', category: 'compatibility', file: 'skill.json', message: 'Version should follow semver (x.y.z)' });
          score -= 10;
        }
      } catch { /* already caught */ }
    }

    // Tool availability — check referenced tools are real OpenClaw tools
    const skillMd = join(dir, 'SKILL.md');
    if (existsSync(skillMd)) {
      const content = readFileSync(skillMd, 'utf-8');
      const knownTools = ['exec', 'read', 'write', 'edit', 'web_fetch', 'web_search', 'message', 'canvas', 'image', 'image_generate', 'pdf', 'tts', 'sessions_spawn', 'sessions_yield', 'subagents'];
      const toolRefs = (content.match(/\b([a-z_]+)\b(?=\s*tool)/gi) || []);
      const unknown = toolRefs.filter(t => !knownTools.includes(t.toLowerCase()));
      if (unknown.length > 0) {
        const unique = [...new Set(unknown)];
        issues.push({ severity: 'info', category: 'compatibility', file: 'SKILL.md', message: `Referenced tools may not exist: ${unique.join(', ')}` });
        score -= 10;
      }
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  // ── Recommendations ───────────────────────────────────────────

  private generateRecommendations(categories: Record<AuditCategory, CategoryScore>): Recommendation[] {
    const recs: Recommendation[] = [];

    if (categories.structure.score < 80) {
      recs.push({ impact: 'high', title: 'Fix structural issues', description: 'Ensure SKILL.md and valid skill.json exist at the root level. Remove orphan files.', affectedCategories: ['structure'] });
    }
    if (categories.completeness.score < 70) {
      recs.push({ impact: 'high', title: 'Add missing sections to SKILL.md', description: 'Include description, triggers, workflow, tools, and constraints sections.', affectedCategories: ['completeness'] });
    }
    if (categories.quality.score < 70) {
      recs.push({ impact: 'medium', title: 'Improve content quality', description: 'Add detailed step-by-step workflows, specific trigger phrases, and usage examples.', affectedCategories: ['quality'] });
    }
    if (categories.safety.score < 80) {
      recs.push({ impact: 'high', title: 'Address safety concerns', description: 'Remove hardcoded secrets, replace dangerous exec patterns with bounded operations.', affectedCategories: ['safety'] });
    }
    if (categories.compatibility.score < 80) {
      recs.push({ impact: 'medium', title: 'Fix compatibility issues', description: 'Use valid skill.json category, semver versioning, and verified tool references.', affectedCategories: ['compatibility'] });
    }
    if (categories.quality.score >= 70 && categories.quality.score < 90) {
      recs.push({ impact: 'low', title: 'Polish skill content', description: 'Add more examples, edge case handling, and detailed workflow steps for higher scores.', affectedCategories: ['quality'] });
    }

    return recs.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.impact] - order[b.impact];
    });
  }

  // ── Helpers ───────────────────────────────────────────────────

  private inferSkillName(dir: string): string {
    const sjPath = join(dir, 'skill.json');
    if (existsSync(sjPath)) {
      try {
        return JSON.parse(readFileSync(sjPath, 'utf-8')).name || dir.split('/').pop() || 'unknown';
      } catch { /* fall through */ }
    }
    return dir.split('/').pop() || 'unknown';
  }
}

// ── Formatters ──────────────────────────────────────────────────────

export function formatTable(report: AuditReport): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(`🔍 Skill Audit: ${report.skillName}`);
  lines.push('─'.repeat(50));
  lines.push(`  Overall: ${report.overallScore}/100  Grade: ${report.grade}  ${report.isPro ? '(Pro)' : '(Free)'}`);
  lines.push('');

  for (const [cat, data] of Object.entries(report.categories)) {
    const bar = '█'.repeat(Math.round(data.score / 5)) + '░'.repeat(20 - Math.round(data.score / 5));
    lines.push(`  ${cat.padEnd(15)} ${data.score.toString().padStart(3)}/100  ${bar}`);
  }

  if (report.issues.length > 0) {
    lines.push('');
    lines.push('  Issues:');
    const icons = { error: '❌', warning: '⚠️ ', info: 'ℹ️ ' };
    for (const issue of report.issues.slice(0, 15)) {
      const loc = issue.line ? `:${issue.line}` : '';
      lines.push(`    ${icons[issue.severity]} [${issue.category}] ${issue.file}${loc} — ${issue.message}`);
    }
    if (report.issues.length > 15) {
      lines.push(`    ... and ${report.issues.length - 15} more issues`);
    }
  }

  if (report.recommendations.length > 0) {
    lines.push('');
    lines.push('  Recommendations:');
    const impactIcons = { high: '🔴', medium: '🟡', low: '🟢' };
    for (const rec of report.recommendations) {
      lines.push(`    ${impactIcons[rec.impact]} [${rec.impact}] ${rec.title}`);
      lines.push(`       ${rec.description}`);
    }
  }

  lines.push('');
  lines.push('─'.repeat(50));
  lines.push('');
  return lines.join('\n');
}

export function formatJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatMarkdown(report: AuditReport): string {
  const lines: string[] = [];
  lines.push(`# 🔍 Skill Audit: ${report.skillName}`);
  lines.push('');
  lines.push(`**Overall:** ${report.overallScore}/100 | **Grade:** ${report.grade} | **Mode:** ${report.isPro ? 'Pro' : 'Free'}`);
  lines.push('');

  lines.push('## Category Scores');
  lines.push('');
  lines.push('| Category | Score |');
  lines.push('|----------|-------|');
  for (const [cat, data] of Object.entries(report.categories)) {
    lines.push(`| ${cat.charAt(0).toUpperCase() + cat.slice(1)} | ${data.score}/100 |`);
  }
  lines.push('');

  if (report.issues.length > 0) {
    lines.push('## Issues');
    lines.push('');
    for (const issue of report.issues) {
      const loc = issue.line ? `:${issue.line}` : '';
      lines.push(`- **[${issue.severity.toUpperCase()}]** [${issue.category}] \`${issue.file}${loc}\` — ${issue.message}`);
    }
    lines.push('');
  }

  if (report.recommendations.length > 0) {
    lines.push('## Recommendations');
    lines.push('');
    for (const rec of report.recommendations) {
      lines.push(`### ${rec.impact.toUpperCase()}: ${rec.title}`);
      lines.push('');
      lines.push(rec.description);
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function formatReport(report: AuditReport, format: OutputFormat): string {
  switch (format) {
    case 'json': return formatJson(report);
    case 'markdown': return formatMarkdown(report);
    default: return formatTable(report);
  }
}
