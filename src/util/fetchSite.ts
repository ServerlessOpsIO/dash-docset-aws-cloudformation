import fs from 'fs-extra'
import path from 'path'
import { Toc, TocItem } from '../types.js'

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

export const APP_ROOT = path.resolve(
    __dirname,
    '../../..'
)
export const SITE_DIR = path.join(APP_ROOT, 'site')

export async function fetchDocs(
    tocItem: TocItem,
    urlRoot: string,
    docsDir: string
): Promise<void> {
    // Fetch the page
    console.info('Fetching doc page:', [urlRoot, tocItem.href].join('/'))
    const response = await fetch([urlRoot, tocItem.href].join('/'))
    const body = await response.text()

    // Save the page to a file
    const filePath = path.join(docsDir, tocItem.href)

    if (!fs.existsSync(filePath)) {
        await fs.promises.writeFile(filePath, body)
    }

    // Recursively fetch the contents tocItems
    if (tocItem.contents) {
        await Promise.all(
            tocItem.contents.map(async (content) => {
                return fetchDocs(content, urlRoot, docsDir)
            })
        )
    }

    if (tocItem.include_contents) {
        await fetchToc([urlRoot, tocItem.include_contents].join('/'), docsDir)
    }
}

export async function fetchToc(
    url: string,
    docsDir: string
): Promise<void> {
    console.info('Fetching TOC: ', url)
    const response = await fetch(url)
    const toc = await response.json() as Toc
    const filename = url.split('/').pop()
    await fs.promises.writeFile([docsDir, filename].join('/'), JSON.stringify(toc, null, 2))

    if (toc.contents) {
        for (const item of toc.contents) {
            await fetchDocs(item, AWS_CFN_DOC_ROOT, docsDir)
        }
    }
}

export async function main(siteRoot: string): Promise<void> {
    await fs.emptyDir(siteRoot)
    await fetchToc(AWS_CFN_TOC_URL, siteRoot)
}

if (require.main === module) {
    Promise.resolve()
        .then(() => main(SITE_DIR))
        .catch(err => {
            console.error(err)
            process.exit(1)
        })
}