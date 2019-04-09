/* eslint-disable prettier/prettier */

import {
  sanitizeMetaEvidence
} from '../../src/utils/sanitize'

describe('Sanatize MetaEvidence', () => {
  it('sanatizes data', async () => {
    const _metaEvidence = {
      "key1": "still here",
      "evidenceDisplayInterfaceURL": "/ipfs/...",
      "evidenceDisplayInterfaceURLHash": "hash"
    }

    const sanatizedMetaEvidence = sanitizeMetaEvidence(_metaEvidence)
    expect(sanatizedMetaEvidence.evidenceDisplayInterfaceURI).toEqual(_metaEvidence.evidenceDisplayInterfaceURL)
    expect(sanatizedMetaEvidence.evidenceDisplayInterfaceURLHash).toEqual(_metaEvidence.evidenceDisplayInterfaceHash)
  })
})
