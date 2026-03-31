/**
 * Output Validator
 * Validates generated skill structure
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
/**
 * Validate a generated skill directory
 */
export function validateSkill(skillPath) {
    const errors = [];
    const warnings = [];
    // Check SKILL.md exists
    const skillMdPath = join(skillPath, 'SKILL.md');
    if (!existsSync(skillMdPath)) {
        errors.push('SKILL.md is missing');
    }
    else {
        const content = readFileSync(skillMdPath, 'utf-8');
        // Check for required elements
        if (!content.includes('<description>') && !content.toLowerCase().includes('description')) {
            warnings.push('SKILL.md may be missing description section');
        }
        // Check for tool references
        const hasTools = [
            'exec', 'read', 'write', 'edit', 'web_fetch', 'web_search'
        ].some(tool => content.includes(tool));
        if (!hasTools) {
            warnings.push('SKILL.md does not reference any OpenClaw tools');
        }
    }
    // Check skill.json exists
    const skillJsonPath = join(skillPath, 'skill.json');
    if (!existsSync(skillJsonPath)) {
        errors.push('skill.json is missing');
    }
    else {
        try {
            const data = JSON.parse(readFileSync(skillJsonPath, 'utf-8'));
            // Check required fields
            const requiredFields = ['name', 'version', 'author', 'description', 'tags', 'category'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    errors.push(`skill.json missing required field: ${field}`);
                }
            }
            // Validate category
            const validCategories = ['monitoring', 'automation', 'research', 'browser', 'data', 'communication', 'developer', 'utility'];
            if (data.category && !validCategories.includes(data.category)) {
                errors.push(`skill.json has invalid category: ${data.category}`);
            }
        }
        catch (e) {
            errors.push('skill.json is not valid JSON');
        }
    }
    // Check references directory (Pro)
    const referencesPath = join(skillPath, 'references');
    if (existsSync(referencesPath)) {
        warnings.push('References directory found (Pro feature)');
    }
    // Check scripts directory (Pro)
    const scriptsPath = join(skillPath, 'scripts');
    if (existsSync(scriptsPath)) {
        warnings.push('Scripts directory found (Pro feature)');
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Validate skill name (kebab-case)
 */
export function validateSkillName(name) {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}
export default validateSkill;
//# sourceMappingURL=validator.js.map