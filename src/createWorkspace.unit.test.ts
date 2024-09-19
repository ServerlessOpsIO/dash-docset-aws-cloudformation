jest.mock('fs-extra')

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

const tmpDir = '/NONEXISTENT'

describe('createWorkspace', () => {
    describe('createWorkspace()', () => {
        describe('should succeed when', () => {
            test('given a valid buildRoot and plist', async () => {
                const {
                    docsetDir,
                    docsetContentsDir,
                    docsetDocsDir,
                    plistFilePath
                } = await createWorkspace(tmpDir, PLIST)

                expect(docsetDir).toBe(`${tmpDir}/aws-cloudformation.docset`)
                expect(docsetContentsDir).toBe(`${tmpDir}/aws-cloudformation.docset/Contents`)
                expect(docsetDocsDir).toBe(`${tmpDir}/aws-cloudformation.docset/Contents/Resources/Documents`)
                expect(plistFilePath).toBe(`${tmpDir}/aws-cloudformation.docset/Contents/Info.plist`)
            })
        })
    })
})