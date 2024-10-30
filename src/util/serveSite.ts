import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

// Define the directory to serve static files from
const staticDir = path.resolve(path.join(__dirname, '../../..', 'site'))

// Use express.static middleware to serve static files
app.use(express.static(staticDir))

// Start the server if this module is executed as the main module
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Serving files at ${staticDir}`)
        console.log(`Server running at http://localhost:${port}/`)
    })
}