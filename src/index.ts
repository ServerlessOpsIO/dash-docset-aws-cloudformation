import path from 'path'
import { compilerOptions } from '../tsconfig.json'

import { createWorkspace } from './createWorkspace'
import { fetchDocsToc } from './fetchDocsToc'
import { fetchDocs } from './fetchDocs'
import { createDb } from './createDb'

const AWS_CFN_DOC_ROOT = process.env.DOC_ROOT || 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

// Resolve APP_ROOT based on whether TS or compiled JS.
export const APP_ROOT = path.resolve(
    __dirname,
    path.basename(path.dirname(__dirname)) == compilerOptions.outDir ? '../..' : '..'
)
export const DOC_BUILD_ROOT = path.join(APP_ROOT, 'docbuild')

export async function main(appRoot: string, docBuildRoot: string): Promise<void> {
    const {
        docsetDocsDir,
        docsetResourcesDir
    } = await createWorkspace(appRoot, docBuildRoot)
    const tocSections = await fetchDocsToc(AWS_CFN_TOC_URL)

    await Promise.all(
        Object.entries(tocSections).map( async ([_, items]) => {
            return fetchDocs(items, AWS_CFN_DOC_ROOT, docsetDocsDir)
        })
    )

    await createDb(docsetResourcesDir, tocSections)
}

if (require.main === module) {
    Promise.resolve()
        .then(() => main(APP_ROOT, DOC_BUILD_ROOT))
        .catch(err => {
            console.error(err)
            process.exit(1)
        })
}