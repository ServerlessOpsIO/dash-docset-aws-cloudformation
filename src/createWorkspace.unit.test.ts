jest.mock('fs-extra')
import path from 'path'
import { compilerOptions } from '../tsconfig.json'

import { createWorkspace } from './createWorkspace'

// Resolve APP_ROOT based on whether TS or compiled JS.
const APP_ROOT = path.resolve(
    __dirname,
    path.basename(path.dirname(__dirname)) == compilerOptions.outDir ? '../..' : '..'
)

const tmpDir = '/NONEXISTENT'

describe('createWorkspace', () => {
    describe('createWorkspace()', () => {
        describe('should succeed when', () => {
            test('given a valid buildRoot and plist', async () => {
                const {
                    docsetDir,
                    docsetContentsDir,
                    docsetDocsDir,
                    plistFilePath,
                    iconFilePath
                } = await createWorkspace(APP_ROOT, tmpDir)

                expect(docsetDir).toBe(`${tmpDir}/aws-cloudformation.docset`)
                expect(docsetContentsDir).toBe(`${tmpDir}/aws-cloudformation.docset/Contents`)
                expect(docsetDocsDir).toBe(`${tmpDir}/aws-cloudformation.docset/Contents/Resources/Documents`)
                expect(plistFilePath).toBe(`${tmpDir}/aws-cloudformation.docset/Contents/Info.plist`)
            })
        })
    })
})