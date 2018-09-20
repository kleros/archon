import multihash from 'multihashes'

import hashFns from '../constants/hash'

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
