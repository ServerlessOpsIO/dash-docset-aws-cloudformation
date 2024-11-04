import path from 'path'

export const DOCSET_DIR = 'aws-cloudformation.docset'
export const DOCSET_CONTENTS_DIR = 'Contents'
export const DOCSET_RESOURCES_DIR = path.join(DOCSET_CONTENTS_DIR, 'Resources')
export const DOCSET_DOCS_DIR = path.join(DOCSET_RESOURCES_DIR, 'Documents')
export const PLIST_FILE_NAME = 'Info.plist'
export const PLIST_FILE_PATH = path.join(DOCSET_CONTENTS_DIR, PLIST_FILE_NAME)
export const ICON_FILE_NAME = 'icon.png'
export const DB_FILE_NAME = 'docSet.dsidx'
export const DB_FILE_PATH = path.join(DOCSET_RESOURCES_DIR, DB_FILE_NAME)