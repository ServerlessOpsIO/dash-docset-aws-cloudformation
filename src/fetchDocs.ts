import fs from 'fs-extra'
import path from 'path'
import * as cheerio from 'cheerio'

import { addTocAnchors } from './addTocAnchors'
import { TocItem } from './types'
import { template } from './template.html'

// FIXME: There's some missing CSS still
// eg. Note and Important on aws-attribute-metadata.html

/**
 * Create a page from the pageBody and add it to the template
 * 
 * @param pageBody Body of page to add anchor to
 */
export async function createPage(pageBody: string): Promise<cheerio.CheerioAPI> {
    const $ = cheerio.load(template)

    const $pageContents = cheerio.load(pageBody)
    const $mainContents = $pageContents('#main-col-body')
    $mainContents.find('.awsdocs-page-header-container').remove()
    $mainContents.find('awsdocs-language-banner').remove()
    $('#content').append($mainContents)

    return $
}

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
    console.info('Fetching doc page:', [urlRoot, tocItem.href].join('/'))
    const response = await fetch([urlRoot, tocItem.href].join('/'))
    const body = await response.text()
    const $page = await createPage(body)

    // Add the TOC anchors
    await addTocAnchors($page, tocItem)

    // Save the page to a file
    const filePath = path.join(docsDir, tocItem.href)

    if ( !fs.existsSync(filePath) ) {
        await fs.promises.writeFile(filePath, $page.html())
    } else {
        throw new Error(`File already exists: ${filePath}`)
    }

    // Recursively fetch the contents tocItems
    if (tocItem.contents) {
        await Promise.all(
            tocItem.contents.map(async (content) => {
                return fetchDocs(content, urlRoot, docsDir)
            })
        )
    }
}
