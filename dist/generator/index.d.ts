/**
 * Main Generator Orchestrator
 * Coordinates the entire skill generation pipeline
 */
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
    error?: string;
}
export declare class SkillGenerator {
    private aiClient;
    private authManager;
    constructor();
    /**
     * Generate a complete skill from description
     */
    generate(options: GeneratorOptions): Promise<GenerationResult>;
}
export default SkillGenerator;
//# sourceMappingURL=index.d.ts.map