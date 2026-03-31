/**
 * Skill Type Classifier
 * Determines the skill type, language, and name from a description
 */

export interface SkillClassification {
  type: 'monitoring' | 'automation' | 'research' | 'browser' | 'data' | 'communication' | 'developer' | 'utility';
  language: 'typescript' | 'javascript' | 'python';
  services: string[];
  name: string;
}

const SKILL_TYPE_KEYWORDS: Record<string, string[]> = {
  monitoring: ['monitor', 'watch', 'track', 'alert', 'check', 'observe', 'sense'],
  automation: ['automate', 'schedule', 'cron', 'run', 'execute', 'pipeline', 'workflow'],
  research: ['research', 'analyze', 'investigate', 'explore', 'find', 'discover'],
  browser: ['browse', 'scrape', 'crawl', 'navigate', 'click', 'fill', 'login'],
  data: ['parse', 'extract', 'transform', 'convert', 'process', 'aggregate', 'csv', 'json'],
  communication: ['email', 'send', 'message', 'notify', 'slack', 'discord', 'telegram', 'post'],
  developer: ['build', 'create', 'generate', 'compile', 'deploy', 'test', 'git'],
  utility: ['utility', 'helper', 'tool', 'convert', 'calculate', 'compute'],
};

const SERVICE_PATTERNS: Record<string, RegExp[]> = {
  'hacker-news': [/hacker\s*news/i, /hn\b/i, /y\s*combinator/i],
  'github': [/github\b/i, /git\s*hub/i, /repo/i],
  'twitter': [/twitter\b/i, /x\.com/i, /tweet/i],
  'discord': [/discord\b/i],
  'slack': [/slack\b/i],
  'telegram': [/telegram\b/i],
  'email': [/email\b/i, /gmail/i, /mail/i],
  'weather': [/weather\b/i, /forecast/i, /temperature/i],
  'news': [/news\b/i, /headline/i, /article/i],
  'reddit': [/reddit\b/i, /subreddit/i],
  'stripe': [/stripe\b/i, /payment/i, /billing/i],
  'openai': [/openai\b/i, /gpt\b/i, /chatgpt/i],
  'filesystem': [/file\b/i, /directory\b/i, /folder\b/i, /disk\b/i],
  'database': [/database\b/i, /db\b/i, /sql/i, /query/i],
  'api': [/api\b/i, /rest\b/i, /endpoint/i],
  'docker': [/docker\b/i, /container/i],
  'kubernetes': [/kubernetes\b/i, /k8s\b/i],
};

const LANGUAGE_PATTERNS: Record<string, string[]> = {
  typescript: ['typescript', 'ts-node', 'tsx'],
  javascript: ['javascript', 'node', 'nodejs'],
  python: ['python', 'pip', 'python3', 'py'],
};

/**
 * Classify a skill from its description
 */
export function classifySkill(description: string): SkillClassification {
  const lowerDesc = description.toLowerCase();
  
  // Determine skill type
  let type: SkillClassification['type'] = 'utility';
  let maxScore = 0;
  
  for (const [skillType, keywords] of Object.entries(SKILL_TYPE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      type = skillType as SkillClassification['type'];
    }
  }
  
  // Determine language
  let language: SkillClassification['language'] = 'typescript';
  let langScore = 0;
  
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerDesc.includes(pattern)) {
        langScore++;
        language = lang as SkillClassification['language'];
        break;
      }
    }
  }
  
  // Detect services
  const services: string[] = [];
  for (const [service, patterns] of Object.entries(SERVICE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerDesc)) {
        if (!services.includes(service)) {
          services.push(service);
        }
        break;
      }
    }
  }
  
  // Generate name from description
  const name = generateNameFromDescription(description);
  
  return { type, language, services, name };
}

/**
 * Generate a kebab-case name from description
 */
function generateNameFromDescription(description: string): string {
  // Remove common words
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'my', 'daily', 'automated', 'ai', 'skill'];
  
  let words = description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));
  
  // Take first 3-4 meaningful words
  const selected = words.slice(0, 4);
  
  // If too short, add more words
  if (selected.length < 2 && words.length > 0) {
    selected.push(...words.slice(0, 3));
  }
  
  return selected.join('-').replace(/-+/g, '-');
}

export default classifySkill;
