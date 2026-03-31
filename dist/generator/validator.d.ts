/**
 * Output Validator
 * Validates generated skill structure
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validate a generated skill directory
 */
export declare function validateSkill(skillPath: string): ValidationResult;
/**
 * Validate skill name (kebab-case)
 */
export declare function validateSkillName(name: string): boolean;
export default validateSkill;
//# sourceMappingURL=validator.d.ts.map