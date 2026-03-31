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
/**
 * Classify a skill from its description
 */
export declare function classifySkill(description: string): SkillClassification;
export default classifySkill;
//# sourceMappingURL=classifier.d.ts.map