/**
 * File System Utilities
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

/**
 * Write a file, creating parent directories if needed
 */
export function writeFile(path: string, content: string, encoding: BufferEncoding = 'utf-8'): void {
  const dir = dirname(path);
  if (dir && dir !== '.') {
    ensureDir(dir);
  }
  writeFileSync(path, content, encoding);
}

/**
 * Read a file
 */
export function readFile(path: string, encoding: BufferEncoding = 'utf-8'): string {
  return readFileSync(path, encoding);
}

/**
 * Check if a path exists
 */
export function exists(path: string): boolean {
  return existsSync(path);
}

/**
 * Copy a directory recursively
 */
export function copyDir(src: string, dest: string): void {
  cpSync(src, dest, { recursive: true });
}

/**
 * Remove a directory recursively
 */
export function removeDir(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

/**
 * Get the size of a directory in bytes
 */
export function getDirSize(path: string): number {
  let size = 0;
  const { readdirSync, statSync } = require('fs');
  
  function walk(dir: string): void {
    const files = readdirSync(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else {
        size += stat.size;
      }
    }
  }
  
  walk(path);
  return size;
}

export default {
  ensureDir,
  writeFile,
  readFile,
  exists,
  copyDir,
  removeDir,
  getDirSize,
};
