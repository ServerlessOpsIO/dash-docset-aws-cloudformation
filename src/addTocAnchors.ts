import * as cheerio from 'cheerio'

import { TocItem } from './types'

export async function addAttributeTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addFunctionTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addGuideIntrinsicFnTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body > .highlights').children().find('li').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Function/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

export async function addGuideConditionalsTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addGuideTemplateResourcesTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body > .highlights').children().find('li').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Service/${$element.text().replace(/^(AWS|Amazon)/, '').trim()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

export async function addGuideProductAttrTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addGuideCfnSharedTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addGuideTocConditionSamplesSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addParameterTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addPropertiesTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body h2[id$="properties"]').next().find('dt >.term > .code').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Property/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

export async function addResourceTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
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

    //  FIXME: How do I get the next sibling of a given tag?
    $('#main-col-body h2[id$="examples"]').nextUntil('h3').next('h3').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Sample/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })

}

export async function addTypeTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addServiceTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body .itemizedlist').children().find('li > p').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Resource/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

/**
 * Add anchors to the page for each section and subsection in the TOC.
 *
 * @param $ Cheerio instance of the page
 * @param tocItem TocItem for the page
 */
export async function addTocSectionAnchors($: cheerio.CheerioAPI, tocItem: TocItem): Promise<void> {
    // handle Resource pages
    if ( tocItem.docType === 'Resource' ) {
        await addResourceTocSectionAnchors($)
    } else if ( tocItem.docType === 'Property' ) {
        await addPropertiesTocSectionAnchors($)
    } else if ( tocItem.docType === 'Type' ) {
        await addTypeTocSectionAnchors($)
    } else if ( tocItem.docType === 'Service' ) {
        await addServiceTocSectionAnchors($)
    } else if( tocItem.docType === 'Function' ) {
        await addFunctionTocSectionAnchors($)
    } else if ( tocItem.docType === 'Attribute' ) {
        await addAttributeTocSectionAnchors($)
    } else if ( tocItem.docType === 'Parameter' ) {
        await addParameterTocSectionAnchors($)
    } else if ( tocItem.docType === 'Guide' ) {
        if (tocItem.href == 'intrinsic-function-reference.html') {
            await addGuideIntrinsicFnTocSectionAnchors($)
        } else if (tocItem.href == 'intrinsic-function-reference-conditions.html') {
            await addGuideConditionalsTocSectionAnchors($)
        } else if (tocItem.href == 'aws-template-resource-type-ref.html') {
            await addGuideTemplateResourcesTocSectionAnchors($)
        } else if (tocItem.href == 'aws-product-attribute-reference.html') {
            addGuideProductAttrTocSectionAnchors($)
        } else if (tocItem.href == 'cfn-reference-shared.html') {
            await addGuideCfnSharedTocSectionAnchors($)
        } else if (tocItem.href == 'conditions-sample-templates.html') {
            await addGuideTocConditionSamplesSectionAnchors($)
        } else {
            throw new Error('Unmatched Guide item for TOC; filename: ' + tocItem.href)
        }
    } else {
        throw new Error('Unknown item for TOC; filename: ' + tocItem.href)
    }


    // intrinsic-function-reference
    if ( $('#intrinsic-function-reference').length > 0 ) {
    }
}

/*
* Add an anchor to the page for the TOC item.
*
* @param $ Cheerio instance of the page
* @param tocItem TocItem for the page
* 
*/
export async function addTocPageAnchors($: cheerio.CheerioAPI, tocItem: TocItem): Promise<void> {
    const $h1 = $('#main-col-body').find('h1.topictitle').first()
    const $anchor = $('<a></a>')
        .attr('name', `//apple_ref/cpp/${tocItem.docType}/${tocItem.title}`)
        .attr('class', 'dashAnchor')
    $h1.before($anchor)
}

/**
 * Add anchors to the page for each section and subsection in the TOC.
 *
 * @param $ Cheerio instance of the page
 * @param tocItem TocItem for the page
 */
export async function addTocAnchors ($: cheerio.CheerioAPI, tocItem: TocItem) {
    await addTocPageAnchors($, tocItem)
    await addTocSectionAnchors($, tocItem)
}
