import Web3 from 'web3'
import fs from 'fs'
import path from 'path'
import solc from 'solc'
import { get } from 'axios'
import multihash from 'multihashes'

import Arbitrable from '../src/standards/Arbitrable'

const provider = new Web3.providers.HttpProvider(
  'http://localhost:8545'
)

/**
 * Deploy a basic Arbitrable contract
 * @param {string[]} arguments - The argument array for the Arbitrable Contract
 * @example
 * ["0x211f01e59b425253c0a0e9a7bf612605b42ce82c", "0x0"] // [arbitratorAddress, extraData]
 * @return {Object} web3 contract object
 */
const _deplyTestArbitrableContract = async () => {
  // compile contract
  const inputFile = fs.readFileSync(path.resolve(__dirname, './contracts/TestArbitrable.sol'))
  const compiledContract = solc.compile(inputFile.toString(), 1)
  const bytecode = compiledContract.contracts[':TestArbitrable'].bytecode
  const abi = JSON.parse(compiledContract.contracts[':TestArbitrable'].interface)
  // web3 contract
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  const contract = new web3.eth.Contract(abi)
  // deploy
  return contract.deploy({
    data: bytecode
  }).send({
    from: accounts[0],
    gas: 500000
  })
}

describe('Arbitrable', () => {
  let web3
  let arbitrableInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitrableInstance = new Arbitrable(provider)
  })

  describe('MetaEvidence', async () => {
    it('valid metaEvidence - hash in uri', async () => {
      const metaEvidenceJSON = {
        title: "test title",
        description: "test description"
      }
      const encoded = multihash.encode(
        new Buffer(web3.utils.keccak256(JSON.stringify(metaEvidenceJSON))),
        'keccak-256'
      )
      const hash = multihash.toB58String(encoded)

      // mock http requests
      const mockGet = jest.fn().mockReturnValue(metaEvidenceJSON)
      jest.mock('axios', () => ({
        get: mockGet
      }))

      // deploy arbitrable contract to test with
      const arbitrableContract = await _deplyTestArbitrableContract()
      expect(arbitrableContract.options.address).toBeTruthy()

      const fakeURI = `http://fake-address/${hash}`
      // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
      const receipt = await arbitrableContract.methods.emitMetaEvidence(
        0,
        fakeURI
      ).send({
        from: accounts[0],
        gas: 500000
      })
      expect(receipt.transactionHash).toBeTruthy()
    })
  })
})
