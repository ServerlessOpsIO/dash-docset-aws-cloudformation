import fs from 'fs-extra'
import path from 'path'


const DOCSET_DIR = 'aws-cloudformation.docset'
const DOCSET_CONTENTS_DIR = 'Contents'
const DOCSET_DOCS_DIR = path.join(DOCSET_CONTENTS_DIR, 'Resources/Documents')
const PLIST_FILE_NAME = 'Info.plist'
const PLIST_FILE_PATH = path.join(DOCSET_CONTENTS_DIR, PLIST_FILE_NAME)
const LOCAL_PLIST_FILE_PATH = path.join('static', PLIST_FILE_NAME)
const ICON_FILE_NAME = 'icon.png'
const LOCAL_ICON_FILE_PATH = path.join('static', ICON_FILE_NAME)


export interface WorkspaceDirs {
    docsetDir: string
    docsetContentsDir: string
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
    const docsetDocsDir = path.join(docsetDir, DOCSET_DOCS_DIR)
    const plistFilePath = path.join(docsetDir, PLIST_FILE_PATH)
    const iconFilePath = path.join(docsetDir, ICON_FILE_NAME)

    await fs.emptyDir(buildRoot);
    await fs.ensureDir(docsetDocsDir)   // deepest directory path
    await fs.promises.copyFile(path.join(appRoot, LOCAL_PLIST_FILE_PATH), plistFilePath)
    await fs.promises.copyFile(path.join(appRoot, LOCAL_ICON_FILE_PATH), iconFilePath)


    return {
        docsetDir,
        docsetContentsDir,
        docsetDocsDir,
        plistFilePath,
        iconFilePath
    }
}
