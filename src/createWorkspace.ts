import fs from 'fs-extra'
import path from 'path'


const DOCSET_DIR = 'aws-cloudformation.docset'
const DOCSET_CONTENTS_DIR = 'Contents'
const DOCSET_RESOURCES_DIR = path.join(DOCSET_CONTENTS_DIR, 'Resources')
const DOCSET_DOCS_DIR = path.join(DOCSET_RESOURCES_DIR, 'Documents')
const PLIST_FILE_NAME = 'Info.plist'
const PLIST_FILE_PATH = path.join(DOCSET_CONTENTS_DIR, PLIST_FILE_NAME)
const ICON_FILE_NAME = 'icon.png'


export interface WorkspaceDirs {
    docsetDir: string
    docsetContentsDir: string
    docsetResourcesDir: string
    docsetDocsDir: string
    plistFilePath: string
    iconFilePath: string
}


/**
 * Create workspace for building docset
 *
 * @param appRoot Root directory for app
 * @param buildRoot Root directory for building docset
 */
export async function createWorkspace(appRoot: string, buildRoot: string): Promise<WorkspaceDirs> {

    const docsetDir = path.join(buildRoot, DOCSET_DIR)
    const docsetContentsDir = path.join(docsetDir, DOCSET_CONTENTS_DIR)
    const docsetResourcesDir = path.join(docsetDir, DOCSET_RESOURCES_DIR)
    const docsetDocsDir = path.join(docsetDir, DOCSET_DOCS_DIR)
    const plistFilePath = path.join(docsetDir, PLIST_FILE_PATH)
    const iconFilePath = path.join(docsetDir, ICON_FILE_NAME)

    await fs.emptyDir(buildRoot);
    await fs.ensureDir(docsetDocsDir)   // deepest directory path
    await fs.copy(path.join(appRoot, 'static'), docsetDir)


    return {
        docsetDir,
        docsetContentsDir,
        docsetResourcesDir,
        docsetDocsDir,
        plistFilePath,
        iconFilePath
    }
}
