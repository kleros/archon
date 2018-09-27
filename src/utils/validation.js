import multihash from 'multihashes'
import axios from 'axios'

import { getHttpUri, getURISuffix } from './uri'

import * as errorConstants from '../constants/error'
import hashFns from '../constants/hash'

/**
 * Validate a file. The file must include the hash as the suffix of the URI,
 * or the hash can be passed via the options parameter or using the Evidence standard
 * self hash.
 * @param {string} fileURI - The URI of where the file data can be fetched
 * @example
 * "https://fake-domain/files/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv"
 * @param {object} options - The optional paramaters that can be used to validate the file.
 * @example
 * {
 *    evidence: true, // If true we will follow rules that apply to the evidence standard. Should be true for both metaEvidence and evidence.
 *    hash: "QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv", // The hash to validate against.
 *    hashingAlgorithm: (file) => {...}, // A custom hashing algorithm for computing unsupported hashes.
 *    strictHashes: true // If true error will be thrown if hash is invalid
 * }
 * @return {object} The file as well as the validity of the hashes
 * @example
 * {
 *   file: {},
 *   isValid: true
 * }
 */
export const validateFileFromURI = async (fileURI, options = {}) => {
  // A file is considered prevalidated if it is an IPFS uri
  // NOTE IPFS uri's are converted to HTTP using a gateway
  const { uri, preValidated } = getHttpUri(fileURI)

  if (preValidated) return true
  // Fetch the evidence JSON
  const fileResponse = await axios.get(uri)
  if (fileResponse.status !== 200)
    throw new Error(
      errorConstants.HTTP_ERROR(
        `Unable to fetch file at ${
          uri
        }. Returned status code ${evidenceResponse.status}`
      )
    )

  let fileContent = fileResponse.data
  let selfHash = null
  // If we are validating evidence check for optional selfHash key
  if (options.evidence && typeof fileContent === 'object') {
    const { selfHash: _selfHash, ..._fileContent } = fileContent
    fileContent = _fileContent
    selfHash = _selfHash
  }

  let isValid = true

  if (
    !validMultihash(options.hash || selfHash || getURISuffix(fileURI), fileContent)
  ) {
    isValid = false
    if (options.strictHashes)
      throw new Error(
        errorConstants.VALIDATION_ERROR(`Evidence hash validation failed`)
      )
  }

  return {
    file: fileContent,
    isValid
  }
}

/**
 * Validate a multihash.
 * @param {string} hashHex - The hexadecimal hash.
 * @param {object|string} originalObject - The object we are validating against.
 * @param {fn} customHashFn - <optional> A custom hash function used for file.
 * @returns {bool} If the hashes match.
 */
export const validMultihash = (hashHex, originalObject, customHashFn) => {
  if (typeof originalObject === 'object')
    originalObject = JSON.stringify(originalObject)
  // Decode hash to get hashing algorithm
  const decodedHash = multihash.decode(multihash.fromB58String(hashHex))
  const hashFn = customHashFn || hashFns[decodedHash.name]
  if (!hashFn)
    throw new Error(
      `Hash validation error: No hash function for type ${decodedHash.name}`
    )
  // Hash the original object
  const objectHash = hashFn(originalObject)

  return objectHash === decodedHash.digest.toString()
}
