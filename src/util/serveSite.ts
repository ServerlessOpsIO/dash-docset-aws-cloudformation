import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'

const port = 3000

export const APP_ROOT = path.resolve(
    __dirname,
    '../../..'
)
export const SITE_DIR = path.join(APP_ROOT, 'site')

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const filePath = path.join(SITE_DIR, req.url || '')
    const extname = String(path.extname(filePath)).toLowerCase()
    const mimeTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'application/image/svg+xml'
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream'

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' })
                res.end('<h1>404 Not Found</h1>', 'utf-8')
            } else {
                res.writeHead(500)
                res.end(`Server Error: ${error.code}`)
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType })
            res.end(content, 'utf-8')
        }
    })
})



if (require.main === module) {
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`)
    })
}