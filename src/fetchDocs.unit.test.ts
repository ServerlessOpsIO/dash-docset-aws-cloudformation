jest.mock('fs-extra', () => {
    return {
        ...jest.requireActual('fs-extra'),
        promises: {
            ...jest.requireActual('fs').promises,
        }
    }
})

import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import * as cheerio from 'cheerio'

import fetch from "jest-fetch-mock"
import { fetchDocs, createPage } from "./fetchDocs"

const URL_ROOT = "http://example.com"

describe("fetchDocs", () => {
    beforeAll(() => {
        fetch.enableMocks()
    })

    beforeEach(() => {
        fetch.resetMocks()
    });

    describe('createPage()', () => {
        describe('should succeed when', () => {
            test('given a valid pageBody', async () => {
                const pageBody = "<div id='main-col-body'>Hello, World!</div>"
                const $expectedResult = cheerio.load(pageBody)('#main-col-body').html()
                const $ = await createPage(pageBody)

                expect($('#content').html()).toContain($expectedResult)
            })
        })
    })

    describe("fetchDocs()", () => {
        describe('without writing files', () => {
            beforeAll(() => {
                fs.existsSync = jest.fn().mockReturnValue(false)
                fs.promises.writeFile = jest.fn().mockReturnValue(void 0)
            })

            afterAll(() => {
                fs.existsSync = jest.requireActual('fs-extra').existsSync
                fs.promises.writeFile = jest.requireActual('fs-extra').promises.writeFile
            })
            describe('should succeed when', () => {
                test('Given valid valid tocItem, urlRoot, and docsDir', async () => {
                    const tocItem = {
                        title: "title",
                        href: "AWS_Example.html",
                        docType: "Service"
                    }
                    fetch.mockResponse('')

                    await expect(fetchDocs(tocItem, URL_ROOT, "/NONEXISTENT")).resolves.not.toThrow(Error)
                })


                test('Given valid valid tocItem (with contents), urlRoot, and docsDir', async () => {
                    const tocItem = {
                        title: "title",
                        href: "AWS_Example.html",
                        docType: "Service"
                    }

                    const tocItemWithContents = {
                        ...tocItem,
                        contents: [ tocItem, tocItem]
                    }

                    fetch.mockResponse('')

                    await expect(fetchDocs(tocItemWithContents, URL_ROOT, "/NONEXISTENT")).resolves.not.toThrow(Error)
                })
            })
        })

        describe('when writing files', () => {
            let tmpDir: string

            beforeEach( async () => {
                tmpDir = await fs.promises.mkdtemp(
                    path.join(os.tmpdir(),'dash-docset-aws-cloudformation-test-')
                )
            })

            afterEach( async () => {
                await fs.remove(tmpDir)
            })

            describe('should succeed when', () => {
                test('Given valid valid tocItem, urlRoot, and docsDir', async () => {
                    const tocItem = {
                        title: "title",
                        href: "AWS_Example.html",
                        docType: "Service"
                    }

                    fetch.mockResponse('')

                    await fetchDocs(tocItem, URL_ROOT, tmpDir)

                    expect(await fs.pathExists(path.join(tmpDir, tocItem.href))).toBe(true)
                })

                test('Given valid valid tocItem (with contents), urlRoot, and docsDir', async () => {
                    const tocItem = {
                        title: "title",
                        href: "AWS_Example.html",
                        docType: "Service"
                    }

                    const tocItemWithContents = {
                        ...tocItem,
                        contents: [
                            { ...tocItem, href: "file0.html"},
                            { ...tocItem, href: "file1.html" }
                        ]
                    }

                    fetch.mockResponse('')

                    await fetchDocs(tocItemWithContents, URL_ROOT, tmpDir)

                    expect(
                        await fs.pathExists(path.join(tmpDir, tocItemWithContents.href))
                    ).toBe(true)
                    expect(
                        await fs.pathExists(
                            path.join(tmpDir, tocItemWithContents.contents[0].href)
                        )
                    ).toBe(true)
                    expect(
                        await fs.pathExists(
                            path.join(tmpDir, tocItemWithContents.contents[1].href)
                        )
                    ).toBe(true)
                })
            })

            describe('should fail when', () => {
                test('file with same name as tocItem file already exists', async () => {
                    const tocItem = {
                        title: "title",
                        href: "AWS_Example.html",
                        docType: "Service"
                    }
                    fetch.mockResponse('')

                    await fs.promises.writeFile(path.join(tmpDir, tocItem.href), "content")
                    await expect(fetchDocs(tocItem, URL_ROOT, tmpDir)).rejects.toThrow(Error)
                })
            })
        })
    })

})