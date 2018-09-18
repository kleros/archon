import multihash from 'multihashes'
import hashFns from '../constants/hash'

/**
 * Validate a multihash.
 * @param {string} hashHex - The hexadecimal hash.
 * @param {object|string}
 * @return {bool}
 */
export const validMultihash = (hashHex, originalObject, customHashFn) => {
  if (typeof originalObject == "object")
    originalObject = JSON.stringify(originalObject)
  // Decode hash to get hashing algorithm
  const decodedHash = multihash.decode(new Buffer(hashHex, 'hex'))
  const hashFn = customHashFn || hashFns[decodedHash.name]
  if (!hashFn)
    throw new Error(`Hash validation error: No hash function for type ${decodedHash.name}`)
  // Hash the original object
  const objectHash = hashFn(originalObject)

  return objectHash === decodedHash.data.toString()
}
