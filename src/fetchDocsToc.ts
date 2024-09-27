import jp from 'jsonpath'
import path from 'path'

import { Toc, TocItem, TocSections } from './types'

interface TocSectionsQueries {
    resources: string
    pseudoParameters: string
    intrinsicFunctions: string
    resourceAttributes: string
}

export enum TocSectionTitles {
    TEMPLATE_REFERENCE = 'Template reference',
    RESOURCE_AND_PROPERTY_REFERENCE = 'Resource and property reference',
    RESOURCE_ATTRIBUTES = 'Resource attributes',
    INTRINSIC_FUNCTIONS = 'Intrinsic functions',
    PSEUDO_PARAMETERS = 'Pseudo parameters',
}

/**
 * Fetches the contents from the URL urlRoot + tocItem.include_contents and returns the
 * contents.
 *
 * @param tocItem
 * @param urlRoot
 */
export async function fetchIncludeContents(tocItem: TocItem, urlRoot: string): Promise<TocItem> {
    console.info('Fetching TOC:', [urlRoot, tocItem.include_contents].join('/'))
    const response = await fetch([urlRoot, tocItem.include_contents].join('/'))
    const includeContents = await response.json() as TocItem

    if ( !includeContents.contents || includeContents.contents?.length == 0 ) {
        throw new Error('Invalid include_contents')
    } else if (includeContents.contents.length > 1) {
        // Every file from include_contents seen so far has only 1 item in contents. We're
        // making that assumption but will threow an error if it's not the case. This way we can
        // catch the case and handle it
        throw new Error('Expected only 1 item in include_contents')
    }

    // Recursively handle nested include_contents
    let newTocItem: TocItem
    if (includeContents.contents[0].include_contents) {
        newTocItem = { ...await fetchIncludeContents(includeContents.contents[0], urlRoot) }
    } else {
        newTocItem = includeContents.contents[0]
    }

    return newTocItem
}

/**
 * Given a tocItem, identify the type of document it is.
 *
 * @param tocItem
 */
export function identifyDocType(tocItem: TocItem): string {
    let docType: string

    if ( tocItem.href.startsWith('AWS_') ) {
            docType = 'Service'
    } else if ( tocItem.href.startsWith('aws-properties-') ) {
        docType = 'Type'
    } else if ( tocItem.href.startsWith('aws-resource-') ) {
        docType = 'Resource'
    } else if (tocItem.href.startsWith('aws-attribute-')) {
        docType = 'Attribute'
    } else if (tocItem.href == 'intrinsic-function-reference.html') {
        docType = 'Guide'
    } else if (tocItem.href == 'intrinsic-function-reference-conditions.html') {
        docType = 'Guide'
    } else if (tocItem.href.startsWith('intrinsic-function-reference')) {
        docType = 'Function'
    } else if (tocItem.href == 'pseudo-parameter-reference.html') {
        docType = 'Parameter'
    } else if ( tocItem.href.startsWith('Alexa_') ) {
        docType ='Service'
    } else if (tocItem.href.startsWith('alexa-properties-')) {
        docType = 'Type'
    } else if (tocItem.href.startsWith('alexa-resource-')) {
        docType = 'Resource'
    } else if ( tocItem.href == 'aws-template-resource-type-ref.html' ) {
        docType = 'Guide'
    } else if ( tocItem.href == 'aws-product-attribute-reference.html' ) {
        docType = 'Guide'
    } else if ( tocItem.href == 'cfn-reference-shared.html') {
        docType = 'Guide'
    } else if (tocItem.href == 'conditions-sample-templates.html') {
        docType = 'Guide'
    } else {
        throw new Error('Unknown item type; filename: ' + tocItem.href)
    }

    if (tocItem.contents) {
        (tocItem as TocItem).contents?.map(async (item) => {
            item.docType = identifyDocType(item)
        })
    }

    return docType
}

/**
 * Query the toc using the query string and return the first (and should be only) result.
 *
 * @param toc
 * @param query
 */
export async function queryToc(toc: Toc, query: string): Promise<TocItem> {
    const result = jp.query(toc, query)

    if (result.length == 0) {
        throw new Error('Query returned no results')
    } else if (result.length > 1) {
        throw new Error('Query returned multiple results')
    }

    return result[0]
}

/**
 * For the given tocItem, if it has an include_contents property then pass the tocItem to
 * and replace the tocItem with the result of fetchIncludeContents. If the tocItem has a contents property then pass each item in the array to resolveIncludeContents.
 */
export async function resolveIncludeContents(
    tocItem: TocItem,
    urlRoot: string
): Promise<TocItem> {

    if (tocItem.include_contents) {
        tocItem = {...await fetchIncludeContents(tocItem, urlRoot)}
    }

    if (tocItem.contents) {
        const resolvedContents = await Promise.all(
            tocItem.contents.map(async (content) => {
                return await resolveIncludeContents(content, urlRoot)
            })
        )
        tocItem.contents = resolvedContents
    }

    return tocItem
}

/**
 * Fetch the TOC from the given URL and return the sections specified in the tocSectionQueries.
 *
 * @param url URL to fetch the TOC from
 */
export async function fetchDocsToc(url: string): Promise<TocSections> {
    console.info('Fetching TOC: ', url)
    const response = await fetch(url)
    const toc = await response.json() as Toc

    const tocSectionQueries: TocSectionsQueries = {
        resources: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.RESOURCE_AND_PROPERTY_REFERENCE}")]`,
        pseudoParameters: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.PSEUDO_PARAMETERS}")]`,
        intrinsicFunctions: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.INTRINSIC_FUNCTIONS}")]`,
        resourceAttributes: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.RESOURCE_ATTRIBUTES}")]`,
    }

    let tocSections: TocSections = {}

    await Promise.all(
        Object.entries(tocSectionQueries).map(async ([section, query]) => {
            (tocSections as any)[section] =  await queryToc(toc, query)
        })
    )

    const { origin, pathname } = new URL(url)
    await Promise.all(
        Object.entries(tocSections).map(async ([section, tocItem]) => {
            (tocSections as any)[section] = await resolveIncludeContents(
                tocItem, origin + path.dirname(pathname)
            )
        })
    )

    // FIXME: We're not going deep enough
    Object.entries(tocSections).map(([_, tocItem]) => {
        tocItem.docType = identifyDocType(tocItem)
    })

    return tocSections
}