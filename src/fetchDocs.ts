import fs from 'fs-extra'
import got from 'got'
import path from 'path'
import * as cheerio from 'cheerio'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

import { addTocAnchors } from './addTocAnchors.js'
import { highlightCode } from './highlightCode.js'
import {
    DB_FILE_PATH,
    DOCSET_DIR,
    DOCSET_DOCS_DIR
} from './paths.js'
import { TocItem } from './types.js'
import { template } from './template.html.js'

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
 * Populate database with documents
 *
 * @param db Database instance
 * @param tocItem TocItem to populate database with
 */
export async function populateDb(dbFile: string, tocItem: TocItem): Promise<void> {
    console.info('Populating db with:', tocItem.title)

    const db = await open({
        filename: dbFile,
        driver: sqlite3.Database,
    })

    let title = tocItem.title
    if (tocItem.docType === 'Service') {
        title = tocItem.title.replace(/^(AWS|Amazon)/, '').trim()
    }
    await db.run(
        `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('${title}', '${tocItem.docType}', '${tocItem.href}');`
    )

    await db.close()
}


/**
 * Given a tocItem and urlRoot fetch the page from the href property and save it as a file in
 * the docRoot directory. Then iterate through the contents property calling itself on the
 * TocItems in the array.
 * 
 * @param tocItem TocItem to fetch
 * @param urlRoot Root URL for the docs
 * @param buildRoot Root directory for building the docset
 */
export async function fetchDocs(
    tocItem: TocItem,
    urlRoot: string,
    buildRoot: string
): Promise<void> {
    // Fetch the page
    console.info('Fetching doc page:', [urlRoot, tocItem.href].join('/'))
    const response = await got([urlRoot, tocItem.href].join('/'))
    const body = response.body
    const $page = await createPage(body)

    // Add the TOC anchors
    await addTocAnchors($page, tocItem)

    // Hightlight code blocks
    await highlightCode($page)

    // Save the page to a file
    const filePath = path.join(buildRoot, DOCSET_DIR, DOCSET_DOCS_DIR, tocItem.href)

    if ( !fs.existsSync(filePath) ) {
        await fs.promises.writeFile(filePath, $page.html())
    } else {
        throw new Error(`File already exists: ${filePath}`)
    }

    // Insert into Db
    await populateDb(path.join(buildRoot, DOCSET_DIR, DB_FILE_PATH), tocItem)

    // Recursively fetch the contents tocItems
    if (tocItem.contents) {
        await Promise.all(
            tocItem.contents.map( (content) => {
                return fetchDocs(content, urlRoot, buildRoot)
            })
        )
    }
}
