import fs from 'fs-extra'
import os from 'os'
import path from 'path'

import {
    createDb,
    identifyItem,
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

    describe('identifyItem()', () => {
        describe('should succeed when', () => {
            test.each([
                [ 'AWS_Example.html', 'Service', 'Example' ],
                [ 'aws-properties-example-prop.html', 'Property', 'example prop' ],
                [ 'aws-resource-example-res.html', 'Resource', 'example res' ],
                [ 'aws-attribute-example-attr.html', 'Attribute', 'example attr' ],
                [ 'intrinsic-function-reference-example-fn.html', 'Function', 'example fn' ],
                [ 'Alexa_Example.html', 'Service', 'Alexa Example' ],
                [ 'alexa-properties-example-prop.html', 'Property', 'Alexa example prop' ],
                [ 'alexa-resource-example-res.html', 'Resource', 'Alexa example res' ],
            ])('given a filename with an expected prefix', async (filename, expectedType, expectedName) => {
                const { name, type, path } = await identifyItem(filename)
                expect(name).toBe(expectedName)
                expect(type).toBe(expectedType)
                expect(path).toBe(filename)
            })
        })

        describe('should fail when', () => {
            // Still some unmatched files I'm not sure yet what to do with.
            test.skip('given a filename with an unknown prefix', async () => {
                const filename = 'unknown-example.html'
                await expect(identifyItem(filename)).rejects.toThrow(Error)
            })
        })
    })

    describe.skip('createDb()', () => {
        describe('should succeed when', () => {
            test('given a valid docsDir', async () => {
                const docsDir = path.join(tmpDir, DOCSET_DOCS_DIR)
                const expectedDbFile = path.join(tmpDir, DOCSET_RESOURCES_DIR, DB_FILE_NAME)
                await createDb(docsDir)
                expect(fs.existsSync(expectedDbFile)).toBe(true)
            })
        })
    })
})