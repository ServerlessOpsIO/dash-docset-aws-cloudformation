import fs from 'fs-extra'

/**
 * Create workspace for building docset
 * @param buildRoot Root directory for building docset
 * @param docsetDir Directory for storing docset
 */
export async function createWorkspace(buildRoot: string, docsetDir: string): Promise<void> {
    await fs.emptyDir(buildRoot);
    await fs.ensureDir(docsetDir)
}
