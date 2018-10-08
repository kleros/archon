import multihash from 'multihashes'
import axios from 'axios'

import * as errorConstants from '../constants/error'
import { functions as hashFunctions } from '../constants/hash'

import isRequired from './isRequired'
import { getHttpUri, getURISuffix } from './uri'

/**
 * Validate a file. The file must include the hash as the suffix of the URI,
 * or the hash can be passed via the options parameter or using the Evidence standard
 * self hash.
 * @param {string} fileURI - The URI of where the file data can be fetched
 * @param {object} options - The optional paramaters that can be used to validate the file.
 * @returns {object} The file as well as the validity of the hashes
 */
export const validateFileFromURI = async (
  fileURI = isRequired('fileURI'),
  options = {}
) => {
  // A file is considered prevalidated if it is an IPFS uri
  // NOTE IPFS uri's are converted to HTTP using a gateway
  const { uri, preValidated } = getHttpUri(fileURI)

  if (preValidated) return true
  // Fetch the evidence JSON
  const fileResponse = await axios.get(uri)
  if (fileResponse.status !== 200)
    throw new Error(
      errorConstants.HTTP_ERROR(
        `Unable to fetch file at ${uri}. Returned status code ${
          fileResponse.status
        }`
      )
    )

  let fileContent = fileResponse.data
  let selfHash = null
  // If we are validating evidence check for optional selfHash key
  if (typeof fileContent === 'object') {
    const { selfHash: _selfHash, ..._fileContent } = fileContent
    fileContent = _fileContent
    selfHash = _selfHash
  }

  let isValid = true

  if (
    !validMultihash(
      options.hash || selfHash || getURISuffix(fileURI),
      fileContent,
      options.customHashFn
    )
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
 * @param {string} multihashHex - The hexadecimal hash.
 * @param {object|string} file - The object we are validating against.
 * @param {fn} customHashFn - <optional> A custom hash function used for file.
 * @returns {bool} If the hashes match.
 */
export const validMultihash = (
  multihashHex = isRequired('multihashHex'),
  file = isRequired('file'),
  customHashFn
) => {
  if (typeof file === 'object') file = JSON.stringify(file)
  // Decode hash to get hashing algorithm
  const decodedHash = multihash.decode(multihash.fromB58String(multihashHex))

  const hashFn = customHashFn || hashFunctions[decodedHash.code]
  if (!hashFn)
    throw new Error(
      `Hash validation error: No hash function for multicode ${
        decodedHash.code
      }`
    )
  // Hash the original object
  let fileHash = hashFn(file)
  if (fileHash.indexOf('0x') !== 0) fileHash = '0x' + fileHash

  // ensure they both have the same prefix
  let decodedHashHex = decodedHash.digest.toString()
  if (decodedHashHex.indexOf('0x') !== 0) decodedHashHex = '0x' + decodedHashHex

  return fileHash === decodedHashHex
}

/**
 * Create a base58 multihash from a file.
 * @param {object|string} file - The object we are hashing.
 * @param {number} multicode - The multicode of the hashing algorithm.
 * @param {fn} customHashFn - <optional> A custom hash function used for file.
 * @returns {string} base58 multihash.
 */
export const multihashFile = (
  file = isRequired('file'),
  multicode = isRequired('multicode'),
  customHashFn
) => {
  if (typeof file === 'object') file = JSON.stringify(file)

  const hashFn = customHashFn || hashFunctions[multicode]
  if (!hashFn)
    throw new Error(`Hashing Error: Unsupported multicode ${multicode}`)

  let fileHash = hashFn(file)

  const encoded = multihash.encode(Buffer.from(fileHash), multicode)

  return multihash.toB58String(encoded)
}
