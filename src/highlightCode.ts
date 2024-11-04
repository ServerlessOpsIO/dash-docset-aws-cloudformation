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

        // Inserting the hljs class gets us the AWS CSS formatting we want.
        $page(e).addClass('hljs')

        let highlightedCode = ''
        let lines: string[] = []
        if (e.attribs.class.startsWith('json')) {
            lines = e.children.map((child) => {
                if (child.type != 'text') {
                    return $page.html(child)
                }

                const text = $page(child).text()
                return hljs.highlight(text, { language: 'json' }).value
            })
        } else if (e.attribs.class.startsWith('yaml')) {
            lines = e.children.map((child) => {
                if (child.type != 'text') {
                    return $page.html(child) as string
                }

                const text = $page(child).text()
                return hljs.highlight(text, { language: 'yaml' }).value
            })
        }

        $page(e).html(lines.join(''))
    })
}
