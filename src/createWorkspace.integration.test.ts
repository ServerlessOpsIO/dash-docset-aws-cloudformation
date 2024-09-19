import fs from 'fs-extra'
import path from 'path'
import os from 'os'

import { createWorkspace } from './createWorkspace'

const PLIST = `
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>CFBundleIdentifier</key>
        <string>aws-cloudformation</string>

        <key>CFBundleName</key>
        <string>AWS CloudFormation</string>

        <key>DocSetPlatformFamily</key>
        <string>aws-cloudformation</string>

        <key>isDashDocset</key>
        <true/>

        <key>isJavaScriptEnabled</key>
        <true/>

        <key>dashIndexFilePath</key>
        <string>index.html</string>
    </dict>
</plist>
`

describe('createWorkspace', () => {
    describe('createWorkspace()', () => {
        let tmpDir: string

        beforeEach( async () => {
            tmpDir = await fs.promises.mkdtemp(
                path.join(os.tmpdir(),'dash-docset-aws-cloudformation-test-')
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
                } = await createWorkspace(tmpDir, PLIST)

                expect(await fs.pathExists(docsetDir)).toBe(true)
                expect(await fs.pathExists(docsetContentsDir)).toBe(true)
                expect(await fs.pathExists(docsetDocsDir)).toBe(true)
                expect(await fs.pathExists(plistFilePath)).toBe(true)
            })
        })
    })
})