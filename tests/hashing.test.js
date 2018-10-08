/* eslint-disable prettier/prettier */
import Web3 from 'web3'

import {
  multihashFile,
  validMultihash
} from '../src/utils/hashing'

describe('Hashing and Validation', () => {
  it('Custom hash function', async () => {
    const hashedText = '12345'

    const nonStandardSha3Hash = multihashFile(
      hashedText,
      0x1B, // keccak-256
      Web3.utils.soliditySha3 // custom hash function
    )

    // Use the standard keccak-256 hashing algorithm
    expect(validMultihash(nonStandardSha3Hash, hashedText)).toBeFalsy() // false

    // Use the solidity sha3 implementation
    expect(
      validMultihash(nonStandardSha3Hash, hashedText, Web3.utils.soliditySha3)
    ).toBeTruthy() // true
  })
})
