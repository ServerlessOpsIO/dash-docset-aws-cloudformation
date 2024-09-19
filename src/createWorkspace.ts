import fs from 'fs-extra'
import path from 'path'

const DOCSET_DIR = 'aws-cloudformation.docset'
const DOCSET_CONTENTS_DIR = 'Contents'
const DOCSET_DOCS_DIR = path.join(DOCSET_CONTENTS_DIR, 'Resources/Documents')
const PLIST_FILE_NAME = path.join('Info.plist')
const PLIST_FILE_PATH = path.join(DOCSET_CONTENTS_DIR, PLIST_FILE_NAME)

export interface WorkspaceDirs {
    docsetDir: string
    docsetContentsDir: string
    docsetDocsDir: string
    plistFilePath: string
}

/**
 * Create workspace for building docset
 *
 * @param buildRoot Root directory for building docset
 * @param plist Plist file content
 */
export async function createWorkspace(buildRoot: string, plist: string): Promise<WorkspaceDirs> {

    const docsetDir = path.join(buildRoot, DOCSET_DIR)
    const docsetContentsDir = path.join(docsetDir, DOCSET_CONTENTS_DIR)
    const docsetDocsDir = path.join(docsetDir, DOCSET_DOCS_DIR)
    const plistFilePath = path.join(docsetDir, PLIST_FILE_PATH)

    await fs.emptyDir(buildRoot);
    await fs.ensureDir(docsetDocsDir)   // deepest directory path
    await fs.writeFile(plistFilePath, plist, 'utf8')

    return {
        docsetDir,
        docsetContentsDir,
        docsetDocsDir,
        plistFilePath
    }
}
