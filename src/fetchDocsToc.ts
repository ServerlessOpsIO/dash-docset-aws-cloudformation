import jp from 'jsonpath'
import path from 'path'

enum Titles {
    TEMPLATE_REFERENCE = 'Template reference',
    RESOURCE_AND_PROPERTY_REFERENCE = 'Resource and property reference',
    RESOURCE_ATTRIBUTES = 'Resource attributes',
    INTRINSIC_FUNCTIONS = 'Intrinsic functions',
    PSEUDO_PARAMETERS = 'Pseudo parameters',
}

/**
 * Could not find a published schema so crated these interfaces based on conventions found. eg.
 * None of the top-level contents array items have an include_contents property and none of the
 * template reference content items has a contents property.
 */
export interface TocItem {
    title: string
    href: string
    contents?: TocItem[]
    include_contents?: string
}

export interface Toc {
    contents: TocItem[]
}

/** 
 * Fetches the contents from the URL urlRoot + tocItem.include_contents and returns the
 * contents.
 *
 * @param tocItem
 * @param urlRoot
 */
export async function fetchIncludeContents(tocItem: TocItem, urlRoot: string): Promise<TocItem> {
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


export async function fetchDocsToc(url: string): Promise<void> {
    const response = await fetch(url)
    const toc = await response.json() as Toc

    const tocSectionQueries = {
        resources: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.RESOURCE_AND_PROPERTY_REFERENCE}")]`,
        pseudoParameters: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.PSEUDO_PARAMETERS}")]`,
        intrinsicFunctions: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.INTRINSIC_FUNCTIONS}")]`,
        resourceAttributes: `$.contents[?(@.title=="${TocSectionTitles.TEMPLATE_REFERENCE}")].contents[?(@.title=="${TocSectionTitles.RESOURCE_ATTRIBUTES}")]`,
    }

    let tocSections: {[key: string]: TocItem} = {}
    await Promise.all(
        Object.entries(tocSectionQueries).map(async ([section, query]) => {
            const tocItem = await queryToc(toc, query)
            tocSections[section] = tocItem
        })
    )


    const { origin, pathname } = new URL(url)
    const resolvedResources = await resolveIncludeContents(
        resources,
        origin + path.dirname(pathname)
    )


    const resolvedPseudoParameters = await resolveIncludeContents(
        pseudoParameters,
        origin + path.dirname(pathname)
    )

    const resolvedIntrinsicFunctions = await resolveIncludeContents(
        intrinsicFunctions,
        origin + path.dirname(pathname)
    )

    const resolvedResourceAttributes = await resolveIncludeContents(
        resourceAttributes,
        origin + path.dirname(pathname)
    )
}