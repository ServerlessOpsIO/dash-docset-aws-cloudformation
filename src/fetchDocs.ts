import fs from 'fs-extra'
import path from 'path'
import * as cheerio from 'cheerio'

import { TocItem } from './types'
import { template } from './template.html'

//const LIMIT = pLimit(100)

export async function addTocAnchors($: cheerio.CheerioAPI, tocItem: TocItem): Promise<void> {
    const $h1 = $('#main-col-body').find('h1.topictitle').first()
    const $anchor = $('<a></a>')
        .attr('name', `//apple_ref/cpp/${tocItem.docType}/${tocItem.title}`)
        .attr('class', 'dashAnchor')
    $h1.before($anchor)

    // handle Resource pages
    if ( $('#main-col-body > .topictitle[id*=aws-resource-] ').length > 0 ) {
        $('#main-col-body h2[id$="properties"]').next().find('dt >.term > .code').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Property/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })

        $('#main-col-body h3[id$="ref"]').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Function/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })

        $('#main-col-body h3[id$="getatt"]').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Function/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })

        $('#main-col-body h4[id$="getatt"]').next().find('dt > .term > .code').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Value/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })

        $('#main-col-body .highlights[id="inline-topiclist"]').find('li > a').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Sample/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })

    }

    if ( $('#main-col-body > .topictitle[id*=aws-properties-] ').length > 0 ) {
        $('#main-col-body h2[id$="properties"]').next().find('dt >.term > .code').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Property/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })
    }

    // service pages
    if ( $('#main-col-body > .topictitle[id*="AWS_"] ').length > 0 ) {
        $('#main-col-body .itemizedlist').children().find('li').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Resource/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })
    }

    // aws-template-resource-type-ref
    if ( $('#aws-template-resource-type-ref').length > 0 ) {
        $('#main-col-body > .highlights').children().find('li').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Service/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })
    }

    // intrinsic-function-reference
    if ( $('#intrinsic-function-reference').length > 0 ) {
        $('#main-col-body > .highlights').children().find('li').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Function/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })
    }
}

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
