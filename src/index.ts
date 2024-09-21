import path from 'path'
import { compilerOptions } from '../tsconfig.json'

import { createWorkspace } from './createWorkspace'
import { fetchDocsToc } from './fetchDocsToc'
import { fetchDocs } from './fetchDocs'
import { createDb } from './createDb'

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

// Resolve APP_ROOT based on whether TS or compiled JS.
const APP_ROOT = path.resolve(
    __dirname,
    path.basename(path.dirname(__dirname)) == compilerOptions.outDir ? '../..' : '..'
)
const DOC_BUILD_ROOT = path.join(APP_ROOT, 'docbuild')

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
        plistFilePath,
        iconFilePath
    } = await createWorkspace(APP_ROOT, DOC_BUILD_ROOT)
    const docSections = await fetchDocsToc(AWS_CFN_TOC_URL)
    await Promise.all(
        Object.entries(docSections).map(async ([_, tocItem]) => {
            return await fetchDocs(tocItem, AWS_CFN_DOC_ROOT, docsetDocsDir)
        })
    )

    await createDb(docsetDocsDir)
}

main();