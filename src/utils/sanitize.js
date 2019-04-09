/**
* As the evidence standard changes we need to coerce past standards into the latest one.
* Update this function to do silent transformations to support any legacy disputes.
*/

export const sanitizeMetaEvidence = (_metaEvidenceJSON) => {
  // Create copy
  const metaEvidenceJSON = {..._metaEvidenceJSON}
  // Key: Legacy key to replace. Value: Latest key
  const updateDict = {
    "evidenceDisplayInterfaceURL": "evidenceDisplayInterfaceURI",
    "evidenceDisplayInterfaceURLHash": "evidenceDisplayInterfaceHash"
  }

  const replacePairs = Object.entries(updateDict)
  for (const [ legacyKey, updatedKey ] of replacePairs) {
    if (!metaEvidenceJSON[legacyKey]) continue
    const value = metaEvidenceJSON[legacyKey]
    // remove old key and add new one
    delete metaEvidenceJSON[legacyKey]
    metaEvidenceJSON[updatedKey] = value
  }

  return metaEvidenceJSON
}
