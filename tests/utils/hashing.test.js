/* eslint-disable prettier/prettier */
import fs from 'fs'
import path from 'path'

import axios from 'axios'
import Web3 from 'web3'

import {
  multihashFile,
  validMultihash
} from '../../src/utils/hashing'

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
  it('Hash from a file', async () => {
    const fileContents = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./exampleMetaEvidenceBasic.json")).toString())

    const evidenceHash = multihashFile(
      JSON.stringify(fileContents),
      0x16
    )

    expect(validMultihash(
      evidenceHash,
      JSON.stringify(fileContents)
    )).toBeTruthy() // true
  })
  it('Hash from a file selfHash', async () => {
    const fileContents = fs.readFileSync(path.resolve(__dirname, "./exampleMetaEvidenceBasicSelfHash.json")).toString()

    const { selfHash, ...fileJSON } = JSON.parse(fileContents)

    expect(validMultihash(
      selfHash,
      fileJSON
    )).toBeTruthy() // true
  })
  it.only('Hash display interface', async () => {
    const pageContents = (await axios.get('https://kleros-t2cr-evidence.netlify.com/')).data
    // console.log(pageContents)

    const multiHash = multihashFile(pageContents, 0x1B)
    console.log(multiHash)

    expect(validMultihash(
      multiHash,
      pageContents
    )).toBeTruthy()
  })
})
