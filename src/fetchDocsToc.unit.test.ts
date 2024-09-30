import fetch from "jest-fetch-mock"

import {
    Toc,
    TocItem,
} from './types'
import {
    fetchIncludeContents,
    identifyDocType,
    queryToc,
    resolveIncludeContents,
} from './fetchDocsToc'

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

describe('fetchDocsToc', () => {

    beforeAll(() => {
        fetch.enableMocks()
    })

    beforeEach(() => {
        fetch.resetMocks()
    })

    describe('fetchIncludeContents()', () => {
        let mockTocItem: TocItem
        beforeEach(() => {
            mockTocItem = {
                title: "level.0",
                href: "level.0.html",
                include_contents: "level.1.json",
            }
        })


        describe('should succeed when', () => {
            test('item has an include_contents key', async () => {
                const mockTocIncludedContents: Toc = {
                    contents: [
                        {
                            title: "level.1",
                            href: "level.1",
                            contents: [
                                {
                                    title: "level.2.1",
                                    href: "level2.1.html"
                                },
                                {
                                    title: "level.2.2",
                                    href: "level.2.2.html"
                                }
                            ]
                        }
                    ]
                }

                const expectedResponse = {
                    title: "level.1",
                    href: "level.1",
                    contents: [
                        {
                            title: "level.2.1",
                            href: "level2.1.html"
                        },
                        {
                            title: "level.2.2",
                            href: "level.2.2.html"
                        }
                    ]
                }


                fetch.mockResponse(JSON.stringify(mockTocIncludedContents))
                const resolvedTocItem = await fetchIncludeContents(mockTocItem, AWS_CFN_DOC_ROOT)

                expect(resolvedTocItem).toStrictEqual(expectedResponse)
            })
        })

        describe.skip('should fail when', () => {
            test('the include_contents key is missing', async () => { })
            test('the include_contents key is empty', async () => { })
            test('fetch returns invalid data', async () => { })
        })
    })

    describe('identifyDocType()', () => {
        describe('should succeed when', () => {
            test.each([
                [{ 'title': 'AWS Example', 'href': 'AWS_Example' }, 'Service'],
                [{ 'title': 'Example Property', 'href': 'aws-properties-example-prop.html' }, 'Type'],
                [{ 'title': 'Example resource', 'href': 'aws-resource-example-res.html' }, 'Resource'],
                [{ 'title': 'Example attribute', 'href': 'aws-attribute-example-attr.html' }, 'Attribute'],
                [{ 'title': 'Example function', 'href': 'intrinsic-function-reference-example-fn.html' }, 'Function'],
                [{ 'title': 'Alexa Example', 'href': 'Alexa_Example.html' }, 'Service'],
                [{ 'title': 'Example property', 'href': 'alexa-properties-example-prop.html' }, 'Type'],
                [{ 'title': 'Example property', 'href': 'alexa-resource-example-res.html' }, 'Resource'],
            ])('given a filename with an expected prefix', async (item, expectedDocType) => {
                const docType = identifyDocType(item)
                expect(docType).toBe(expectedDocType)
            })
        })

        describe('should fail when', () => {
            // Still some unmatched files I'm not sure yet what to do with.
            test('given a filename with an unknown prefix', async () => {
                const item = { 'title': 'Unmatched Example', 'href': 'UnMatchedExample' }
                expect(() => identifyDocType(item)).toThrow(Error)
            })
        })
    })


    describe('resolveIncludeContents()', () => {
        let mockTocItem: TocItem

        beforeEach(() => {
            mockTocItem = {
                title: "level.0",
                href: "level.0.html",
            }
        })
        describe('should succeed when', () => {
            test('item has no include_contents or contents', async () => {
                const resolvedTocItem = await resolveIncludeContents(
                    mockTocItem,
                    AWS_CFN_DOC_ROOT
                )
                expect(resolvedTocItem).toStrictEqual(mockTocItem)
            })

            test('item has contents', async () => {
                mockTocItem.contents = [
                    {
                        title: "level.1.1",
                        href: "item.1.1.html",
                    },
                    {
                        title: "level.1.2",
                        href: "item.1.2.html",
                    }
                ]

                const expectedValue: TocItem = {
                    title: "level.0",
                    href: "level.0.html",
                    contents: [
                        {
                            title: "level.1.1",
                            href: "item.1.1.html",
                        },
                        {
                            title: "level.1.2",
                            href: "item.1.2.html",
                        }
                    ]
                }


                const resolvedTocItem = await resolveIncludeContents(
                    mockTocItem,
                    AWS_CFN_DOC_ROOT
                )

                expect(resolvedTocItem).toStrictEqual(expectedValue)
            })

            test('item has include_contents', async () => {
                mockTocItem.include_contents = "level.1.json"

                const mockResponse: Toc = {
                    contents: [
                        {
                            title: "level.1",
                            href: "level.1.html",
                            contents: [
                                {
                                    title: "level.2.1",
                                    href: "level.2.1.html"
                                },
                                {
                                    title: "level.2.2",
                                    href: "level.2.2.html"
                                }
                            ]
                        }
                    ]
                }

                const expectedValue: TocItem = {
                    title: "level.1",
                    href: "level.1.html",
                    contents: [
                        {
                            title: "level.2.1",
                            href: "level.2.1.html"
                        },
                        {
                            title: "level.2.2",
                            href: "level.2.2.html"
                        }
                    ]
                }

                fetch.mockResponse(JSON.stringify(mockResponse))

                const resolvedTocItem = await resolveIncludeContents(
                    mockTocItem,
                    AWS_CFN_DOC_ROOT
                )
                expect(resolvedTocItem).toStrictEqual(expectedValue)
            })

            // Have never seen this
            test.skip('item has include_contents and contents', async () => { })


            test('resolving include_content in contents', async () => {
                mockTocItem.contents = [
                    {
                        title: "level.1.1",
                        href: "level.1.1.html"
                    },
                    {
                        title: "level.1.2",
                        href: "level.1.2.html"
                    },
                    {
                        title: "level.1.3",
                        href: "level.1.3.html",
                        include_contents: "level.2.json"
                    }
                ]

                const mockResponse: Toc = {
                    contents: [
                        {
                            title: "level.2",
                            href: "level.2.html",
                            contents: [
                                {
                                    title: "level.3.1",
                                    href: "level.3.1.html"
                                },
                                {
                                    title: "level.3.2",
                                    href: "level.3.2.html"
                                }
                            ]
                        }
                    ]
                }

                const expectedValues: TocItem = {
                    title: "level.0",
                    href: "level.0.html",
                    contents: [
                        {
                            title: "level.1.1",
                            href: "level.1.1.html"
                        },
                        {
                            title: "level.1.2",
                            href: "level.1.2.html"
                        },
                        {
                            title: "level.2",
                            href: "level.2.html",
                            contents: [
                                {
                                    title: "level.3.1",
                                    href: "level.3.1.html"
                                },
                                {
                                    title: "level.3.2",
                                    href: "level.3.2.html"
                                }
                            ]
                        }
                    ]
                }
                fetch.mockResponse(JSON.stringify(mockResponse))

                const resolvedTocItem = await resolveIncludeContents(
                    mockTocItem,
                    AWS_CFN_DOC_ROOT
                )
                expect(resolvedTocItem.include_contents).toBeUndefined()
                expect((<TocItem[]>resolvedTocItem.contents)[2]).toStrictEqual(mockResponse.contents[0])
            })

            test('recursively resolve include_contents', async () => {
                mockTocItem.include_contents = "level.1.json"

                const mockResponse1: Toc = {
                    contents: [
                        {
                            title: "level.1",
                            href: "level.1.html",
                            include_contents: "level.2.json"
                        }
                    ]
                }
                const mockResponse2: Toc = {
                    contents: [
                        {
                            title: "level.2",
                            href: "level.2.html",
                        }
                    ]
                }

                const expectedValue: TocItem = {
                    title: "level.2",
                    href: "level.2.html"
                }

                fetch.mockResponses(
                    [
                        JSON.stringify(mockResponse1),
                        { status: 200 }
                    ],
                    [
                        JSON.stringify(mockResponse2),
                        { status: 200 }
                    ]
                )

                const resolvedTocItem = await resolveIncludeContents(
                    mockTocItem,
                    AWS_CFN_DOC_ROOT
                )

                expect(resolvedTocItem).toStrictEqual(expectedValue)
                expect(resolvedTocItem.include_contents).toBeUndefined()
            })
        })
    })

    describe('queryToc()', () => {
        describe('should succeed when', () => {
            test('single-level query returns a single result', async () => {
                const mockToc: Toc = {
                    contents: [
                        {
                            title: "level.1",
                            href: "level.1.html",
                            contents: [
                                {
                                    title: "level.2.1",
                                    href: "level.2.1.html"
                                },
                                {
                                    title: "level.2.2",
                                    href: "level.2.2.html"
                                }
                            ]
                        }
                    ]
                }

                const expectedValue = {
                    title: "level.1",
                    href: "level.1.html",
                    contents: [
                        {
                            title: "level.2.1",
                            href: "level.2.1.html"
                        },
                        {
                            title: "level.2.2",
                            href: "level.2.2.html"
                        }
                    ]
                }

                const result = await queryToc(mockToc, '$.contents[?(@.title=="level.1")]')
                expect(result).toStrictEqual(expectedValue)
            })
            test('multi-level query returns a single result', async () => {
                const mockToc: Toc = {
                    contents: [
                        {
                            title: "level.1",
                            href: "level.1.html",
                            contents: [
                                {
                                    title: "level.2.1",
                                    href: "level.2.1.html"
                                },
                                {
                                    title: "level.2.2",
                                    href: "level.2.2.html"
                                }
                            ]
                        }
                    ]
                }

                const expectedValue = {
                    title: "level.2.1",
                    href: "level.2.1.html"
                }

                const result = await queryToc(mockToc, '$.contents[?(@.title=="level.1")].contents[?(@.title=="level.2.1")]')
                expect(result).toStrictEqual(expectedValue)
            })
        })
    })

    describe('fetchDocsToc()', () => {
        test.skip('unit tests unnecessatu', () => { })
    })
})