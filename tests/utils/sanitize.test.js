/* eslint-disable prettier/prettier */

import {
  sanitizeMetaEvidence
} from '../../src/utils/sanitize'

describe('Sanatize MetaEvidence', () => {
  it('sanatizes data', async () => {
    const _metaEvidence = {
      "key1": "still here",
      "evidenceDisplayInterfaceURL": "/ipfs/...",
      "evidenceDisplayInterfaceURLHash": "hash",
      "rulingOptions": {}
    }

    const sanatizedMetaEvidence = sanitizeMetaEvidence(_metaEvidence)
    expect(sanatizedMetaEvidence.evidenceDisplayInterfaceURI).toEqual(_metaEvidence.evidenceDisplayInterfaceURL)
    expect(sanatizedMetaEvidence.evidenceDisplayInterfaceHash).toEqual(_metaEvidence.evidenceDisplayInterfaceURLHash)
    expect(sanatizedMetaEvidence.key1).toEqual(_metaEvidence.key1)
    expect(sanatizedMetaEvidence.rulingOptions.type).toEqual('single-select')
  })
  it('skips rulingOptions if not there', async () => {
    const _metaEvidence = {
      "key1": "still here",
      "evidenceDisplayInterfaceURL": "/ipfs/...",
      "evidenceDisplayInterfaceURLHash": "hash"
    }

    const sanatizedMetaEvidence = sanitizeMetaEvidence(_metaEvidence)
    expect(sanatizedMetaEvidence.evidenceDisplayInterfaceURI).toEqual(_metaEvidence.evidenceDisplayInterfaceURL)
    expect(sanatizedMetaEvidence.evidenceDisplayInterfaceHash).toEqual(_metaEvidence.evidenceDisplayInterfaceURLHash)
    expect(sanatizedMetaEvidence.key1).toEqual(_metaEvidence.key1)
    expect(sanatizedMetaEvidence.rulingOptions).toBeFalsy()
  })
})
