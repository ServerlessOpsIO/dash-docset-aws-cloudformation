import fs from 'fs-extra'
import path from 'path'

import { open, Database } from 'sqlite'
import sqlite3 from 'sqlite3'

import {
    DOCSET_DIR,
    DOCSET_DOCS_DIR,
    DB_FILE_PATH
} from './paths.js'


export interface WorkspaceDirs {
    docsetDir: string
    docsetContentsDir: string
    docsetResourcesDir: string
    docsetDocsDir: string
    plistFilePath: string
    iconFilePath: string
}


/**
 * Initialize database
 *
 * Create searchIndex table with columns id, name, type, and path
 *
 * @param dbFile Database file path
 */
export async function initializeDb(dbFile: string): Promise<Database> {
    const db = await open({
        filename: dbFile,
        driver: sqlite3.Database,
    })

    await db.run(
        'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);'
    )
    await db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);')

    return db
}


/**
 * Create workspace for building docset
 *
 * @param appRoot Root directory for app
 * @param buildRoot Root directory for building docset
 */
export async function createWorkspace(appRoot: string, buildRoot: string): Promise<void> {

    const docsetDir = path.join(buildRoot, DOCSET_DIR)
    const docsetDocsDir = path.join(docsetDir, DOCSET_DOCS_DIR)

    await fs.emptyDir(buildRoot);
    await fs.ensureDir(docsetDocsDir)   // deepest directory path
    await fs.copy(path.join(appRoot, 'static'), docsetDir)

    await initializeDb(path.join(docsetDir, DB_FILE_PATH))

    return
}
