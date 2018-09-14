import multihash from 'multihashes'

/**
 * Validate a multihash.
 * @param {string} hashHex - The hexadecimal hash.
 * @param {object|string}
 * @return {bool}
 */
export const validMultihash = (hashHex, originalObject) => {
  if (typeof originalObject == "object")
    originalObject = JSON.stringify(originalObject)
  // Decode hash to get hashing algorithm
  const decodedHash = multihash.decode(new Buffer(hashHex, 'hex'))
  // Hash the original object
  const objectHash = multihash.encode(new Buffer(originalObject), decodedHash.name)

  return objectHash === hashHex
}
