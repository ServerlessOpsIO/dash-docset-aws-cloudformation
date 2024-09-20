import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { compilerOptions } from '../tsconfig.json'

import { createWorkspace } from './createWorkspace'

// Resolve APP_ROOT based on whether TS or compiled JS.
const APP_ROOT = path.resolve(
    __dirname,
    path.basename(path.dirname(__dirname)) == compilerOptions.outDir ? '../..' : '..'
)

describe('createWorkspace', () => {
    describe('createWorkspace()', () => {
        let tmpDir: string

        beforeEach( async () => {
            tmpDir = await fs.promises.mkdtemp(
                path.join(os.tmpdir(), 'dash-docset-aws-cloudformation-test-')
            )
        })

        afterEach( async () => {
            await fs.remove(tmpDir)
        })

        describe('should succeed when', () => {
            test('given a valid buildRoot and plist', async () => {
                const {
                    docsetDir,
                    docsetContentsDir,
                    docsetDocsDir,
                    plistFilePath
                } = await createWorkspace(APP_ROOT, tmpDir)

                expect(await fs.pathExists(docsetDir)).toBe(true)
                expect(await fs.pathExists(docsetContentsDir)).toBe(true)
                expect(await fs.pathExists(docsetDocsDir)).toBe(true)
                expect(await fs.pathExists(plistFilePath)).toBe(true)
                expect(await fs.pathExists(path.join(docsetDir, 'icon.png'))).toBe(true)
            })
        })
    })
})