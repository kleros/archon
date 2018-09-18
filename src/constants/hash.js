import Web3 from 'web3'
import sha256 from 'js-sha256'

const w3 = new Web3()

export default {
  'keccak-256': w3.utils.keccak256,
  'sha3-256': sha256
}
