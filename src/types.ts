/**
 * Could not find a published schema so crated these interfaces based on conventions found. eg.
 * None of the top-level contents array items have an include_contents property and none of the
 * template reference content items has a contents property.
 */
export interface TocItem {
    title: string
    href: string
    docType?: string
    contents?: TocItem[]
    include_contents?: string
}

export interface TocSections {
    resources?: TocItem
    pseudoParameters?: TocItem
    intrinsicFunctions?: TocItem
    resourceAttributes?: TocItem
}

export interface Toc {
    contents: TocItem[]
}

