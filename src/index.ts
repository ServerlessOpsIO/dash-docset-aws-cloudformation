import path from 'path'
import { compilerOptions } from '../tsconfig.json'

import { createWorkspace } from './createWorkspace'
import { fetchDocsToc } from './fetchDocsToc'
import { fetchDocs } from './fetchDocs'

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

// Resolve APP_ROOT based on whether TS or compiled JS.
const APP_ROOT = path.resolve(
    __dirname,
    path.basename(path.dirname(__dirname)) == compilerOptions.outDir ? '../..' : '..'
)
const DOC_BUILD_ROOT = path.join(APP_ROOT, 'docbuild')

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

        <key>DashDocSetFallbackURL</key>
        <string>http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide</string>
    </dict>
</plist>
`

enum DocumentTypes {
    RESOURCE = 'Resource',
    PROPERTY = 'Property',
    ATTRIBUTE = 'Attribute',
    FUNCTION = 'Function',
}

async function main(): Promise<void> {
    const {
        docsetDir,
        docsetContentsDir,
        docsetDocsDir,
        plistFilePath
    } = await createWorkspace(DOC_BUILD_ROOT, PLIST)
    const docSections = await fetchDocsToc(AWS_CFN_TOC_URL)
    await Promise.all(
        Object.entries(docSections).map(async ([_, tocItem]) => {
            return await fetchDocs(tocItem, AWS_CFN_DOC_ROOT, docsetDocsDir)
        })
    )
}

main();