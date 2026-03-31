/**
 * Reference Documentation Generator (Pro Feature)
 * Generates API reference docs for target services
 */
import AIClient from '../ai/client.js';
export interface ReferenceOptions {
    services: string[];
    description: string;
    aiClient: AIClient;
}
export interface ReferenceDoc {
    fileName: string;
    content: string;
}
/**
 * Generate reference documentation for detected services
 */
export declare function generateReferences(options: ReferenceOptions): Promise<ReferenceDoc[]>;
export default generateReferences;
//# sourceMappingURL=references.d.ts.map