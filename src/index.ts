import path from 'path'
import { compilerOptions } from '../tsconfig.json'

import { createWorkspace } from './createWorkspace'

const AWS_CFN_DOC_ROOT = 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/'

// Resolve APP_ROOT based on whether TS or compiled JS.
const APP_ROOT = path.resolve(
    __dirname,
    path.basename(path.dirname(__dirname)) == compilerOptions.outDir ? '../..' : '..'
)
const DOC_BUILD_ROOT = path.join(APP_ROOT, 'docbuild')
const DOCSET_DIR = path.join(DOC_BUILD_ROOT, 'aws-cloudformation.docset')

enum DocumentTypes {
    RESOURCE = 'Resource',
    PROPERTY = 'Property',
    ATTRIBUTE = 'Attribute',
    FUNCTION = 'Function',
}

async function main(): Promise<void> {
    await createWorkspace(DOC_BUILD_ROOT, DOCSET_DIR);
}

main();