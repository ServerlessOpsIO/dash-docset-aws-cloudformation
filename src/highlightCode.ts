import hljs from 'highlight.js'
import * as cheerio from 'cheerio'

/*
 * Highlight code blocks in page
 *
 * @param $page - Cheerio object
 */
export async function highlightCode($page: cheerio.CheerioAPI): Promise<void> {
    const elements = $page('pre code')
    elements.each((i, e) => {
        if(
            !e.attribs.class.startsWith('yaml') &&
            !e.attribs.class.startsWith('json')
        ) {
            return
        }

        $page(e).addClass('hljs')
    })
}
