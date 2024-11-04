import path from 'path'

import { createWorkspace } from './createWorkspace.js'
import { fetchDocsToc } from './fetchDocsToc.js'
import { fetchDocs } from './fetchDocs.js'
import { createDb } from './createDb.js'

const AWS_CFN_DOC_ROOT = process.env.DOC_ROOT || 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

// Resolve APP_ROOT based on whether TS or compiled JS.
// NOTE: Note sure how ro read from tsconfig.json as ESM
export const APP_ROOT = path.resolve(
    import.meta.dirname,
    path.basename(path.dirname(import.meta.dirname)) == 'dist' ? '../..' : '..'
)
export const DOC_BUILD_ROOT = path.join(APP_ROOT, 'docbuild')

export async function main(appRoot: string, docBuildRoot: string): Promise<void> {
    const {
        docsetDocsDir,
        docsetResourcesDir
    } = await createWorkspace(appRoot, docBuildRoot)
    const tocSections = await fetchDocsToc(AWS_CFN_TOC_URL)

    await Promise.all(
        Object.entries(tocSections).map( ([_, items]) => {
            return fetchDocs(items, AWS_CFN_DOC_ROOT, docsetDocsDir)
        })
    )

    await createDb(docsetResourcesDir, tocSections)
}

// Check if the module is executed as the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    Promise.resolve()
        .then(() => main(APP_ROOT, DOC_BUILD_ROOT))
        .catch(err => {
            console.error(err)
            process.exit(1)
        })
}