import fs from 'fs'
import path from 'path'

import Web3 from 'web3'
import solc from 'solc'
import multihash from 'multihashes'
import nock from 'nock'

import Arbitrable from '../src/standards/Arbitrable'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

/**
 * Deploy a basic Arbitrable contract
 * @param {string[]} arguments - The argument array for the Arbitrable Contract
 * @example
 * ["0x211f01e59b425253c0a0e9a7bf612605b42ce82c", "0x0"] // [arbitratorAddress, extraData]
 * @returns {object} web3 contract object
 */
const _deplyTestArbitrableContract = async () => {
  // compile contract
  const inputFile = fs.readFileSync(
    path.resolve(__dirname, './contracts/TestArbitrable.sol')
  )
  const compiledContract = solc.compile(inputFile.toString(), 1)
  const bytecode = compiledContract.contracts[':TestArbitrable'].bytecode
  const abi = JSON.parse(
    compiledContract.contracts[':TestArbitrable'].interface
  )
  // web3 contract
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  const contract = new web3.eth.Contract(abi)
  // deploy
  return contract
    .deploy({
      data: bytecode
    })
    .send({
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
        title: 'test title',
        description: 'test description'
      }
      const encoded = multihash.encode(
        Buffer.from(web3.utils.keccak256(JSON.stringify(metaEvidenceJSON))),
        'keccak-256'
      )
      const hash = multihash.toB58String(encoded)

      // mock http requests
      const mockGet = jest.fn().mockReturnValue(metaEvidenceJSON)

      // deploy arbitrable contract to test with
      const arbitrableContract = await _deplyTestArbitrableContract()
      expect(arbitrableContract.options.address).toBeTruthy()

      const fakeHost = 'http://fake-address'
      nock(fakeHost)
        .get(`/${hash}`)
        .reply(200, metaEvidenceJSON)
      // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
      const receipt = await arbitrableContract.methods
        .emitMetaEvidence(0, `${fakeHost}/${hash}`)
        .send({
          from: accounts[0],
          gas: 500000
        })
      expect(receipt.transactionHash).toBeTruthy()

      const metaEvidence = await arbitrableInstance.getMetaEvidence(
        arbitrableContract.options.address,
        0
      )
      expect(metaEvidence.title).toEqual(metaEvidenceJSON.title)
      expect(metaEvidence.description).toEqual(metaEvidenceJSON.description)
      expect(metaEvidence.metaEvidenceHashValid).toBeTruthy()
    })
    it('invalid metaEvidence - hash in uri', async () => {
      const metaEvidenceJSON = {
        title: 'test title',
        description: 'test description'
      }
      const encoded = multihash.encode(
        Buffer.from(web3.utils.keccak256(JSON.stringify(metaEvidenceJSON))),
        'keccak-256'
      )
      const hash = multihash.toB58String(encoded)

      // mock http requests
      const mockGet = jest.fn().mockReturnValue(metaEvidenceJSON)

      // deploy arbitrable contract to test with
      const arbitrableContract = await _deplyTestArbitrableContract()
      expect(arbitrableContract.options.address).toBeTruthy()

      const fakeHost = 'http://fake-address'
      nock(fakeHost)
        .get(`/${hash}`)
        .reply(200, {"title": "different metaEvidence"})
      // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
      const receipt = await arbitrableContract.methods
        .emitMetaEvidence(0, `${fakeHost}/${hash}`)
        .send({
          from: accounts[0],
          gas: 500000
        })
      expect(receipt.transactionHash).toBeTruthy()

      const metaEvidence = await arbitrableInstance.getMetaEvidence(
        arbitrableContract.options.address,
        0
      )
      expect(metaEvidence.metaEvidenceHashValid).toBeFalsy()
    })
    it('validate file -- hash in uri', async () => {
      const testFile = JSON.stringify({
        'type': 'file',
        'data': '0x0'
      })
      const fileEncoded = multihash.encode(
        Buffer.from(web3.utils.keccak256(testFile)),
        'keccak-256'
      )
      const fileHash = multihash.toB58String(fileEncoded)

      const fakeHost = 'http://fake-address'

      const metaEvidenceJSON = {
        title: 'test title',
        description: 'test description',
        fileURI: `${fakeHost}/${fileHash}`
      }
      const metaEvidenceEncoded = multihash.encode(
        Buffer.from(web3.utils.keccak256(JSON.stringify(metaEvidenceJSON))),
        'keccak-256'
      )
      const metaEvidenceHash = multihash.toB58String(metaEvidenceEncoded)

      // mock http requests
      const mockGet = jest.fn().mockReturnValue(metaEvidenceJSON)

      // deploy arbitrable contract to test with
      const arbitrableContract = await _deplyTestArbitrableContract()
      expect(arbitrableContract.options.address).toBeTruthy()


      nock(fakeHost)
        .get(`/${metaEvidenceHash}`)
        .reply(200, metaEvidenceJSON)
      nock(fakeHost)
        .get(`/${fileHash}`)
        .reply(200, testFile)
      // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
      const receipt = await arbitrableContract.methods
        .emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`)
        .send({
          from: accounts[0],
          gas: 500000
        })
      expect(receipt.transactionHash).toBeTruthy()

      const metaEvidence = await arbitrableInstance.getMetaEvidence(
        arbitrableContract.options.address,
        0
      )
      expect(metaEvidence.metaEvidenceHashValid).toBeTruthy()
      expect(metaEvidence.fileHashValid).toBeTruthy()
    })
  })
})
