import fs from 'fs-extra'
import path from 'path'
import { open, Database } from 'sqlite'
import sqlite3 from 'sqlite3'

import { TocItem, TocSections } from './types'

export const DB_FILE_NAME = 'docSet.dsidx'

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
 * Populate database with documents
 *
 * @param db Database instance
 * @param tocItem TocItem to populate database with
 */
export async function populateDb(db: Database, tocItem: TocItem): Promise<void> {
    console.info('Populating db with:', tocItem.title)
    await db.run(
        `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('${tocItem.title}', '${tocItem.docType}', '${tocItem.href}');`
    )
}

/**
 * Create database
 *
 * Initialize database and populate with documents
 *
 * @param docsDir Directory containing documents
 * @param tocSections Table of contents sections
 */
export async function createDb(docsDir: string, tocSections: TocSections): Promise<void> {
    const dbPath = path.resolve(path.join(docsDir, DB_FILE_NAME))
    const db = await initializeDb(dbPath)

    await Promise.all(
        Object.entries(tocSections).map(async ([_, item]) => {
            return populateDb(db, item)
        })
    )

    await Promise.all(
        Object.entries(tocSections).map(async ([_, tocSection]) => {
            if (tocSection.contents) {
                (tocSection.contents as TocItem[]).map(async (item) => {
                    return populateDb(db, item)
                })
            }
        })
    )

    await db.close()
}