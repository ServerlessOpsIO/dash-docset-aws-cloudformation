import fetch from "jest-fetch-mock"
import fs from 'fs-extra'
import os from 'os'
import path from 'path'

import { main, APP_ROOT} from './index'

const REMOTE_DOCS_DIR = path.join(APP_ROOT, 'data/remote')

jest.setTimeout(3000000)    // 30s timeout to help us when debugging

describe('index', () => {
    let workDir: string

    beforeAll( async () => {
        fetch.enableMocks()

        fetch.mockIf(/.*/, async (req) => {
            const url = new URL(req.url)

            if ( url.pathname.match(/.*\/toc-.*\.json/) ) {
                const fileName = url.pathname.split('/').pop() as string
                const contents = await fs.promises.readFile(path.join(REMOTE_DOCS_DIR, 'tocs', fileName), 'utf-8')
                return {
                    status: 200,
                    body: contents.toString()
                }
            } else if ( url.pathname.match(/.*\/.*\.html/)  ) {
                const fileName = url.pathname.split('/').pop() as string
                const contents = await fs.promises.readFile(path.join(REMOTE_DOCS_DIR, 'docs', fileName), 'utf-8')
                return {
                    status: 200,
                    body: contents.toString()
                }
            } else {
                return {
                    status: 404,
                    body: 'Not Found'
                }
            }
        })
    })

    beforeEach( async () => {
        const tmpPath = path.join(os.tmpdir(), 'dash-docset-aws-cloudformation-test-')
        workDir = await fs.promises.mkdtemp(tmpPath);

        await fs.ensureDir(
            path.join(workDir, 'aws-cloudformation.docset', 'Contents', 'Resources', 'Documents')
        )
    })

    afterEach( async () => {
        await fs.remove(workDir)
    })

    afterAll(() => {
        fetch.resetMocks()
    })

    describe('main()', () => {
        describe('should succeed', () => {
            test('when run', async () => {
                await expect(main(APP_ROOT, workDir)).resolves.not.toThrow(Error)
            })
        })
    })
})

