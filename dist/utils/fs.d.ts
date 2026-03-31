/**
 * File System Utilities
 */
/**
 * Ensure a directory exists, creating it if necessary
 */
export declare function ensureDir(path: string): void;
/**
 * Write a file, creating parent directories if needed
 */
export declare function writeFile(path: string, content: string, encoding?: BufferEncoding): void;
/**
 * Read a file
 */
export declare function readFile(path: string, encoding?: BufferEncoding): string;
/**
 * Check if a path exists
 */
export declare function exists(path: string): boolean;
/**
 * Copy a directory recursively
 */
export declare function copyDir(src: string, dest: string): void;
/**
 * Remove a directory recursively
 */
export declare function removeDir(path: string): void;
/**
 * Get the size of a directory in bytes
 */
export declare function getDirSize(path: string): number;
declare const _default: {
    ensureDir: typeof ensureDir;
    writeFile: typeof writeFile;
    readFile: typeof readFile;
    exists: typeof exists;
    copyDir: typeof copyDir;
    removeDir: typeof removeDir;
    getDirSize: typeof getDirSize;
};
export default _default;
//# sourceMappingURL=fs.d.ts.map