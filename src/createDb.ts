import fs from 'fs-extra'
import path from 'path'
import { open, Database } from 'sqlite'
import sqlite3 from 'sqlite3'

export const DB_FILE_NAME = 'docSet.dsidx'

export interface ItemType {
    name: string
    type: string
    path: string
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
 * Identify item type
 *
 * Identify item type based on file name
 *
 * @param filename File name
 */
export async function identifyItem(filename: string): Promise<ItemType> {
    if ( filename.startsWith('AWS_') ) {
        return {
            name: filename.split('.')[0].replace('AWS_', ''),
            type: 'Service',
            path: filename
        }
    } else if ( filename.startsWith('aws-properties-') ) {
        return {
            name: filename.split('.')[0].split('-').slice(2).join(' '),
            type: 'Property',
            path: filename
        }
    } else if ( filename.startsWith('aws-resource-') ) {
        return {
            name: filename.split('.')[0].split('-').slice(2).join(' '),
            type: 'Resource',
            path: filename
        }
    } else if (filename.startsWith('aws-attribute-')) {
        return {
            name: filename.split('.')[0].split('-').slice(2).join(' '),
            type: 'Attribute',
            path: filename
        }
    } else if (filename.startsWith('intrinsic-function-reference')) {
        return {
            name: filename.split('.')[0].split('-').slice(3).join(' '),
            type: 'Function',
            path: filename
        }
    } else if (filename == 'pseudo-parameter-reference.html') {
        return {
            name: 'pseudo parameter',
            type: 'Parameter',
            path: filename
        }
    } else if ( filename.startsWith('Alexa_') ) {
        return {
            name: filename.split('.')[0].split('_').join(' '),
            type: 'Service',
            path: filename
        }
    } else if (filename.startsWith('alexa-properties-')) {
        return {
            name: [ 'Alexa', filename.split('.')[0].split('-').slice(2).join(' ')].join(' '),
            type: 'Property',
            path: filename
        }
    } else if (filename.startsWith('alexa-resource-')) {
        return {
            name: [ 'Alexa', filename.split('.')[0].split('-').slice(2).join(' ')].join(' '),
            type: 'Resource',
            path: filename
        }
    } else {
        //throw new Error('Unknown item type; filename: ' + filename)
        console.error('Unknown item type; filename: ' + filename)
        return {
            name: filename.split('.')[0],
            type: 'Unknown',
            path: filename
        }
    }
}

/**
 * Populate database with documents
 *
 * For the given docsDir get list of all files and for each file call insertItem()
 *
 * @param db Database instance
 * @param file File name
 */
export async function populateDb(db: Database, file: string): Promise<void> {
    const { name, type, path } = await identifyItem(file)
    await db.run(
        `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('${name}', '${type}', '${path}');`
    )
}

/**
 * Create database
 *
 * Initialize database and populate with documents
 *
 * @param docsDir Directory containing documents
 */
export async function createDb(docsDir: string): Promise<void> {
    const dbPath = path.resolve(path.join(docsDir, '..', DB_FILE_NAME))
    const db = await initializeDb(dbPath)

    await Promise.all(
        (await fs.readdir(docsDir)).map(async (file) => {
            await populateDb(db, file)
        })
    )
}