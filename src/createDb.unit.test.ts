import fs from 'fs-extra'
import os from 'os'
import path from 'path'

import {
    createDb,
    initializeDb,
    DB_FILE_NAME
} from './createDb'

const DOCSET_CONTENTS_DIR = 'Contents'
const DOCSET_RESOURCES_DIR = path.join(DOCSET_CONTENTS_DIR, 'Resources')
const DOCSET_DOCS_DIR = path.join(DOCSET_RESOURCES_DIR, 'Documents')

describe('createDb', () => {
    let tmpDir: string
    let docsDir: string

    beforeEach( async () => {
        tmpDir = await fs.promises.mkdtemp(
            path.join(os.tmpdir(), 'dash-docset-aws-cloudformation-test-')
        )
        docsDir = path.join(tmpDir, DOCSET_DOCS_DIR)
        await fs.ensureDir(docsDir)
    })

    afterEach( async () => {
        await fs.remove(tmpDir)
    })

    describe('initializeDb()', () => {
        describe('should succeed when', () => {
            test('given a valid dbFile', async () => {
                const dbFile = path.join(tmpDir, 'Contents/Resources', DB_FILE_NAME)
                await initializeDb(dbFile)
                expect(fs.existsSync(dbFile)).toBe(true)
            })
        })
    })

    describe.skip('populateDb()', () => {
        describe('should succeed when', () => {
            test('given a valid db and file', async () => {})
        })
    })

    describe.skip('createDb()', () => {
        describe('should succeed when', () => {
            test('given a valid docsDir', async () => {
                const docsDir = path.join(tmpDir, DOCSET_DOCS_DIR)
                const expectedDbFile = path.join(tmpDir, DOCSET_RESOURCES_DIR, DB_FILE_NAME)
                //await createDb(docsDir)
                expect(fs.existsSync(expectedDbFile)).toBe(true)
            })
        })
    })
})