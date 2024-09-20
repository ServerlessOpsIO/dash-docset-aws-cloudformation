import fs from 'fs-extra'
import path from 'path'

import { TocItem } from './fetchDocsToc'

/**
 * Given a tocItem and urlRoot fetch the page from the href property and save it as a file in
 * the docRoot directory. Then iterate through the contents property calling itself on the
 * TocItems in the array.
 * 
 * @param tocItem TocItem to fetch
 * @param urlRoot Root URL for the docs
 * @param docsDir Directory to save the docs
 */
export async function fetchDocs(
    tocItem: TocItem,
    urlRoot: string,
    docsDir: string
): Promise<void> {
    // Fetch the page
    const response = await fetch([urlRoot, tocItem.href].join('//'))
    const body = await response.text()

    // Save the page to a file
    const filePath = path.join(docsDir, tocItem.href)

    if ( !fs.existsSync(filePath) ) {
        await fs.promises.writeFile(filePath, body)
    } else {
        throw new Error(`File already exists: ${filePath}`)
    }

    // Recursively fetch the contents tocItems
    if (tocItem.contents) {
        await Promise.all(
            tocItem.contents.map(async (content) => {
                return await fetchDocs(content, urlRoot, docsDir)
            })
        )
    }
}