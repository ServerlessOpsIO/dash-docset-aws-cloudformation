import fs from 'fs-extra'
import path from 'path'
import os from 'os'

import { fetchDocs } from "./fetchDocs"
import { TocItem } from "./types"

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide'

const mockTocItem: TocItem = {
    "title": "Amazon CloudWatch Logs",
    "href": "AWS_Logs.html",
    "docType": "Service"
}

const mockTocItemContents: TocItem[] = [
    {
        "title": "AWS::Logs::AccountPolicy",
        "href": "aws-resource-logs-accountpolicy.html",
        "docType": "Resource"
    },
    {
        "title": "AWS::Logs::Delivery",
        "href": "aws-resource-logs-delivery.html",
        "docType": "Resource"
    }
]

describe('fetchDocs', () => {
    describe('fetchDocs()', () => {
        let tmpDir: string

        describe('should succeed when', () => {
            describe('given a valid tocItem, urlRoot, and docsDir', () => {
                let result: Error | undefined
                let thisMockTocItem: TocItem

                beforeAll( async () => {
                    tmpDir = await fs.promises.mkdtemp(
                        path.join(os.tmpdir(),'dash-docset-aws-cloudformation-test-')
                    )

                    thisMockTocItem = mockTocItem

                    try {
                        await fetchDocs(thisMockTocItem, AWS_CFN_DOC_ROOT, tmpDir)
                    } catch (error: unknown) {
                        result = error as Error
                    }

                })

                afterAll( async () => {
                    await fs.remove(tmpDir)
                })

                test('function does not throw error', async () => {
                    expect(result).not.toBeInstanceOf(Error)
                })

                test('and downloaded file exists', async () => {
                    expect(await fs.pathExists(path.join(tmpDir, mockTocItem.href))).toBe(true)
                })

                test('and downloaded file is an HTML file', async () => {
                    const contents = await fs.promises.readFile(path.join(tmpDir, mockTocItem.href), { encoding: 'utf-8' })
                    expect(contents.startsWith('<!DOCTYPE html>')).toBe(true)
                })
            })

            describe('given a valid tocItem (with contents), urlRoot, and docsDir', () => {
                let result: Error | undefined
                let thisMockTocItem: TocItem

                beforeAll( async () => {
                    tmpDir = await fs.promises.mkdtemp(
                        path.join(os.tmpdir(),'dash-docset-aws-cloudformation-test-')
                    )

                    thisMockTocItem = {
                        ...mockTocItem,
                        contents: mockTocItemContents
                    }

                    try {
                        await fetchDocs(thisMockTocItem, AWS_CFN_DOC_ROOT, tmpDir)
                    } catch (error: unknown) {
                        result = error as Error
                    }
                })

                afterAll( async () => {
                    await fs.remove(tmpDir)
                })

                test('function does not throw error', async () => {
                    expect(result).not.toBeInstanceOf(Error)
                })

                test.each(
                    [
                        'AWS_Logs.html',
                        'aws-resource-logs-accountpolicy.html',
                        'aws-resource-logs-delivery.html'
                    ]
                )('doc files exist', async ( filename ) => {
                    expect(await fs.pathExists(path.join(tmpDir, filename))).toBe(true)
                })

                test.each(
                    [
                        'AWS_Logs.html',
                        'aws-resource-logs-accountpolicy.html',
                        'aws-resource-logs-delivery.html'
                    ]
                )('doc files are HTML files', async ( filename ) => {
                    const contents = await fs.promises.readFile(path.join(tmpDir, filename), { encoding: 'utf-8' })
                    expect(contents.startsWith('<!DOCTYPE html>')).toBe(true)
                })
                test.skip.each(
                    [
                        'AWS_Logs.html',
                        'aws-resource-logs-accountpolicy.html',
                        'aws-resource-logs-delivery.html'
                    ]
                )('doc files match expected', async ( filename ) => {

                })
            })
        })
    })
})