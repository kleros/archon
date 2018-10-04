/* eslint-disable prettier/prettier */
import sha3 from 'js-sha3'

export const functions = {
  0x14: sha3.sha3_512,
  0x15: sha3.sha3_384,
  0x16: sha3.sha3_256,
  0x17: sha3.sha3_224,
  0x1A: sha3.keccak224,
  0x1B: sha3.keccak256,
  0x1C: sha3.keccak384,
  0x1D: sha3.keccak512
}
