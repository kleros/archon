import multihash from 'multihashes'
import axios from 'axios'

import * as errorConstants from '../constants/error'
import { functions as hashFunctions } from '../constants/hash'

import isRequired from './isRequired'
import { getURISuffix } from './uri'

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
  // Fetch the evidence JSON
  const fileResponse = await axios.get(fileURI)

  if (fileResponse.status !== 200)
    throw new Error(
      errorConstants.HTTP_ERROR(
        `Unable to fetch file at ${fileURI}. Returned status code ${
          fileResponse.status
        }`
      )
    )

  let fileContent = fileResponse.data
  // If from ipfs or other source that validates hashes we cam return file
  if (options.preValidated) return { file: fileContent, isValid: true }

  let selfHash = null
  // If we are validating evidence check for optional selfHash key
  if (typeof fileContent === 'object') {
    const { selfHash: _selfHash, ..._fileContent } = fileContent
    fileContent = _fileContent
    selfHash = _selfHash
  }

  let isValid
  // If there is an error validating the hash just assume it is invalid so that legacy disputes can be fetched
  try {
    isValid = validMultihash(
      options.hash || selfHash || getURISuffix(fileURI),
      fileContent,
      options.customHashFn
    )
  } catch (err) {
    console.error(err)
    isValid = false
  }

  if (!isValid && options.strictHashes)
    throw new Error(
      errorConstants.VALIDATION_ERROR(`Evidence hash validation failed`)
    )

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

  let decodedHash
  try {
    decodedHash = multihash.decode(multihash.fromB58String(multihashHex))
  } catch (err) {
    console.error(err)
    throw new Error(
      errorConstants.VALIDATION_ERROR(
        'Unable to decode multihash hex. Is your hash base58?'
      )
    )
  }

  const hashFn = customHashFn || hashFunctions[decodedHash.code]
  if (!hashFn)
    throw new Error(
      errorConstants.VALIDATION_ERROR(
        `No hash function for multicode ${decodedHash.code}`
      )
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
