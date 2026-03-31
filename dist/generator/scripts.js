/**
 * Script Scaffolding Generator (Pro Feature)
 * Generates implementation boilerplate code
 */
import { getScriptSystemPrompt, getScriptUserPrompt } from '../ai/prompts.js';
/**
 * Generate script boilerplate
 */
export async function generateScript(options) {
    const { description, skillName, classification, aiClient } = options;
    const systemPrompt = getScriptSystemPrompt(classification.language);
    const userPrompt = getScriptUserPrompt(description, skillName, classification.language);
    let content = await aiClient.completeWithSystem(systemPrompt, userPrompt);
    // Clean up any markdown code fences
    content = content
        .replace(/^```typescript\s*/i, '')
        .replace(/^```javascript\s*/i, '')
        .replace(/^```python\s*/i, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();
    const ext = classification.language === 'python' ? 'py' : classification.language === 'javascript' ? 'js' : 'ts';
    const fileName = `main.${ext}`;
    return { fileName, content };
}
/**
 * Generate a tools helper file for TypeScript/JavaScript
 */
export function generateToolsHelper(language) {
    if (language === 'typescript') {
        return `/**
 * Tools Helper — SkillForge Pro
 * Provides typed wrappers for OpenClaw tools
 */

export async function exec(command: string, options?: { cwd?: string; timeout?: number }): Promise<string> {
  // Implemented by OpenClaw runtime
  const { exec: execTool } = await import('child_process');
  return new Promise((resolve, reject) => {
    execTool(command, { cwd: options?.cwd }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout || stderr);
    });
  });
}

export async function read(path: string): Promise<string> {
  const { readFile } = await import('fs/promises');
  return readFile(path, 'utf-8');
}

export async function write(path: string, content: string): Promise<void> {
  const { writeFile, mkdir } = await import('fs/promises');
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (dir) await mkdir(dir, { recursive: true });
  await writeFile(path, content, 'utf-8');
}

export async function web_fetch(url: string): Promise<string> {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(url);
  return response.text();
}

export async function web_search(query: string): Promise<string> {
  // OpenClaw provides web_search natively
  throw new Error('web_search is provided by OpenClaw runtime');
}
`;
    }
    else {
        return `/**
 * Tools Helper — SkillForge Pro
 * Provides wrappers for OpenClaw tools
 */

const { exec: execSync, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout || stderr);
    });
  });
}

async function read(filePath) {
  return fs.readFile(filePath, 'utf-8');
}

async function write(filePath, content) {
  const dir = path.dirname(filePath);
  if (dir) await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

async function web_fetch(url) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url);
  return response.text();
}

module.exports = { exec: execAsync, read, write, web_fetch };
`;
    }
}
export default generateScript;
//# sourceMappingURL=scripts.js.map