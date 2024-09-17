import fetch from "jest-fetch-mock"
import jp from 'jsonpath'

import {
    fetchDocsToc,
    TocSections,
} from './fetchDocsToc'

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'
const AWS_CFN_TOC_FILE = 'toc-contents.json'
const AWS_CFN_TOC_URL = `${AWS_CFN_DOC_ROOT}/${AWS_CFN_TOC_FILE}`

describe('fetchDocsToc', () => {

    beforeAll( () => {
        fetch.disableMocks()
    })

    beforeEach( () => {})

    describe('fetchDocsToc()', () => {
        describe('should succeed when', () => {
            test('fetching the TOC from the given URL', async () => {
                await expect(fetchDocsToc(AWS_CFN_TOC_URL)).resolves.not.toThrow(Error)
            },
            10000)

            describe('the returned tocSections', () => {
                let tocSections: TocSections = {}
                beforeAll( async () => {
                    tocSections = await fetchDocsToc(AWS_CFN_TOC_URL)
                })

                describe('resources section', () => {
                    test('should have a contents property', () => {
                        expect(tocSections.resources?.contents).toBeDefined()
                    })

                    test('should have a contents property with at least one item', () => {
                        expect(tocSections.resources?.contents?.length).toBeGreaterThan(0)
                    })

                    test('should have a given contents item', () => {
                        const item = tocSections.resources?.contents?.find((content) => content.title === 'AWS Amplify Console')

                        expect(item).toBeDefined()
                        expect(item?.title).toBe('AWS Amplify Console')
                        expect(item?.href).toBe('AWS_Amplify.html')
                        expect(item?.contents).toBeDefined()
                        expect(item?.include_contents).toBeUndefined()
                    })
                })

                describe('pseudoParameters section', () => {
                    test('should not have a contents property', () => {
                        expect(tocSections.pseudoParameters?.contents).not.toBeDefined()
                    })
                })

                describe('intrinsicFunctions section', () => {
                    test('should have a contents property', () => {
                        expect(tocSections.intrinsicFunctions?.contents).toBeDefined()
                    })

                    test('should have a contents property with at least one item', () => {
                        expect(tocSections.intrinsicFunctions?.contents?.length).toBeGreaterThan(0)
                    })
                })

                describe('resourceAttributes section', () => {
                    test('should have a contents property', () => {
                        expect(tocSections.resourceAttributes?.contents).toBeDefined()
                    })

                    test('should have a contents property with at least one item', () => {
                        expect(tocSections.resourceAttributes?.contents?.length).toBeGreaterThan(0)
                    })
                })
            })
        })
    })
})
