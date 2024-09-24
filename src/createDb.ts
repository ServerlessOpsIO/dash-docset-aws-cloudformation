import path from 'path'
import { open, Database } from 'sqlite'
import sqlite3 from 'sqlite3'

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

    await db.exec(
        'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);'
    )
    await db.exec('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);')

    return db
}

/**
 * Create database
 *
 * Initialize database and populate with documents
 *
 * @param docsDir Directory containing documents
 */
export async function createDb(docsDir: string): Promise<void> {
    const dbPath = path.resolve(`${docsDir}/../${DB_FILE_NAME}`)
    const db = await initializeDb(dbPath)
}