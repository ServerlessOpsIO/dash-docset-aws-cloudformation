import * as cheerio from 'cheerio'

import { TocItem } from './types.js'

/*
export async function addAttributeTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
     // FIXME: Samples are proving really difficult to capture.
    $('#main-col-body h2[id$="examples"]').nextUntil('h2').find('h3').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Sample/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}
*/

export async function addFunctionTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    //Parameters
    $('#main-col-body .variablelist').find('.term').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Parameter/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.before($anchor)
    })

    // Samples
    // FIXME:: We can't reliably find the examples sections. See Fn::Base64 for an example.
}

export async function addGuideIntrinsicFnTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body > .highlights').children().find('li').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Function/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

export async function addGuideConditionalsTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body > h2  > .code').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Function/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

export async function addGuideTemplateResourcesTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body > .highlights > ul').find('li').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Service/${$element.text().replace(/^(AWS|Amazon)/, '').trim()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

/*
export async function addGuideProductAttrTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addGuideCfnSharedTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}

export async function addGuideConditionSamplesTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {}
*/

export async function addGuidePseudoParamsTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body > h2[id*="cfn-pseudo-param"] > code').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Parameter/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.before($anchor)
    })
}

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

     // FIXME: Samples are proving really difficult to capture.
     /*
    try {
        $('#main-col-body h2[id$="examples"]').nextUntil('h2').find('h3').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Sample/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })
    } catch (e) {
        console.warn((e as Error).message)

        $('#main-col-body h2[id$="examples"]').nextAll('h3').each((_, element) => {
            const $element = $(element)
            const $anchor = $('<a></a>')
                .attr('name', `//apple_ref/cpp/Sample/${$element.text()}`)
                .attr('class', 'dashAnchor')
            $element.prepend($anchor)
        })
    }
    */
}

export async function addTypeTocSectionAnchors($: cheerio.CheerioAPI): Promise<void> {
    $('#main-col-body div.variablelist').find('dt > .term > .code').each((_, element) => {
        const $element = $(element)
        const $anchor = $('<a></a>')
            .attr('name', `//apple_ref/cpp/Property/${$element.text()}`)
            .attr('class', 'dashAnchor')
        $element.prepend($anchor)
    })
}

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
        // Nothing to do here
    } else if ( tocItem.docType === 'Guide' ) {
        if (tocItem.href == 'intrinsic-function-reference.html') {
            await addGuideIntrinsicFnTocSectionAnchors($)
        } else if (tocItem.href == 'intrinsic-function-reference-conditions.html') {
            await addGuideConditionalsTocSectionAnchors($)
        } else if (tocItem.href == 'aws-template-resource-type-ref.html') {
            await addGuideTemplateResourcesTocSectionAnchors($)
        } else if (tocItem.href == 'pseudo-parameter-reference.html') {
            await addGuidePseudoParamsTocSectionAnchors($)
        } else if (
            [
                'aws-product-attribute-reference.html',
                'conditions-sample-templates.html',
                'cfn-reference-shared.html'
            ].includes(tocItem.href)) {
                // We don't do anything to these docs
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
        .attr('name', `//apple_ref/cpp/${tocItem.docType}/${tocItem.title.replace(/^[AWS|Amazon]_/, '')}`)
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
