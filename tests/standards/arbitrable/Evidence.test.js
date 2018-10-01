import Web3 from 'web3'
import multihash from 'multihashes'
import nock from 'nock'

import { _deplyTestArbitrableContract } from '../../utils.js'
import Arbitrable from '../../../src/standards/Arbitrable'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

describe('Evidence', () => {
  let web3
  let arbitrableInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitrableInstance = new Arbitrable(provider)
  })

  it('validate evidence -- hash in uri', async () => {
    const evidence1 = {
      title: 'test title 1',
      description: 'test description 1'
    }
    const evidence2 = {
      title: 'test title 2',
      description: 'test description 2'
    }
    const encoded1 = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidence1))),
      'keccak-256'
    )
    const hash1 = multihash.toB58String(encoded1)
    const encoded2 = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidence2))),
      'keccak-256'
    )
    const hash2 = multihash.toB58String(encoded2)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    const fakeHost = 'http://fake-address'
    nock(fakeHost)
      .get(`/${hash1}`)
      .reply(200, evidence1)
    nock(fakeHost)
      .get(`/${hash2}`)
      .reply(200, evidence2)
    // emit evidence with evidence = fakeURI
    let receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${hash1}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()
    receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${hash2}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )
    expect(evidence.length).toEqual(2)
    expect(evidence[0].title).toEqual(evidence1.title)
    expect(evidence[0].description).toEqual(evidence1.description)
    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[0].submittedBy).toBe(accounts[0])
    expect(evidence[0].submittedAt).toBeTruthy()
    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[0].fileValid).toBeFalsy()
    expect(evidence[1].title).toEqual(evidence2.title)
    expect(evidence[1].description).toEqual(evidence2.description)
    expect(evidence[1].evidenceValid).toBeTruthy()
    expect(evidence[1].submittedBy).toBe(accounts[0])
    expect(evidence[1].submittedAt).toBeTruthy()
    expect(evidence[1].evidenceValid).toBeTruthy()
    expect(evidence[1].fileValid).toBeFalsy()
  })
  it('invalid evidence -- hash in uri', async () => {
    const evidence1 = {
      title: 'test title 1',
      description: 'test description 1'
    }
    const evidence2 = {
      title: 'test title 2',
      description: 'test description 2'
    }
    const encoded1 = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidence1))),
      'keccak-256'
    )
    const hash1 = multihash.toB58String(encoded1)
    const encoded2 = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidence2))),
      'keccak-256'
    )
    const hash2 = multihash.toB58String(encoded2)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    const fakeHost = 'http://fake-address'
    nock(fakeHost)
      .get(`/${hash1}`)
      .reply(200, evidence1)
    nock(fakeHost)
      .get(`/${hash2}`)
      .reply(200, evidence1)
    // emit evidence with evidence = fakeURI
    let receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${hash1}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()
    receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${hash2}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )

    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[1].evidenceValid).toBeFalsy()
  })
  it('validate file -- hash in uri', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(testFile)),
      'keccak-256'
    )
    const fileHash = multihash.toB58String(fileEncoded)

    const fakeHost = 'http://fake-address'

    const evidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`
    }
    const evidenceEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidenceJSON))),
      'keccak-256'
    )
    const evidenceHash = multihash.toB58String(evidenceEncoded)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${evidenceHash}`)
      .reply(200, evidenceJSON)
    nock(fakeHost)
      .get(`/${fileHash}`)
      .reply(200, testFile)
    // emit evidence with evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${evidenceHash}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )
    expect(evidence.length).toBe(1)
    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[0].fileValid).toBeTruthy()
  })
  it('invalid file -- hash in uri', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(testFile)),
      'keccak-256'
    )
    const fileHash = multihash.toB58String(fileEncoded)

    const fakeHost = 'http://fake-address'

    const evidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`
    }
    const evidenceEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidenceJSON))),
      'keccak-256'
    )
    const evidenceHash = multihash.toB58String(evidenceEncoded)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${evidenceHash}`)
      .reply(200, evidenceJSON)
    nock(fakeHost)
      .get(`/${fileHash}`)
      .reply(200, { title: 'badFile' })
    // emit evidence with evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${evidenceHash}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )
    expect(evidence.length).toBe(1)
    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[0].fileValid).toBeFalsy()
  })
  it('validate file -- hash as fileHash', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(testFile)),
      'keccak-256'
    )
    const fileHash = multihash.toB58String(fileEncoded)

    const fakeHost = 'http://fake-address'

    const evidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`,
      fileHash
    }
    const evidenceEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidenceJSON))),
      'keccak-256'
    )
    const evidenceHash = multihash.toB58String(evidenceEncoded)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${evidenceHash}`)
      .reply(200, evidenceJSON)
    nock(fakeHost)
      .get(`/${fileHash}`)
      .reply(200, testFile)
    // emit evidence with evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${evidenceHash}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )
    expect(evidence.length).toBe(1)
    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[0].fileValid).toBeTruthy()
  })
  it('invalid file -- hash as fileHash', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(testFile)),
      'keccak-256'
    )
    const fileHash = multihash.toB58String(fileEncoded)

    const fakeHost = 'http://fake-address'

    const evidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`,
      fileHash
    }
    const evidenceEncoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidenceJSON))),
      'keccak-256'
    )
    const evidenceHash = multihash.toB58String(evidenceEncoded)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${evidenceHash}`)
      .reply(200, evidenceJSON)
    nock(fakeHost)
      .get(`/${fileHash}`)
      .reply(200, { title: 'badFile' })
    // emit evidence with evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/${evidenceHash}`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )
    expect(evidence.length).toBe(1)
    expect(evidence[0].evidenceValid).toBeTruthy()
    expect(evidence[0].fileValid).toBeFalsy()
  })
  it('validate evidence -- selfHash', async () => {
    const evidenceJSON = {
      title: 'test title',
      description: 'test description'
    }
    const encoded = multihash.encode(
      Buffer.from(web3.utils.keccak256(JSON.stringify(evidenceJSON))),
      'keccak-256'
    )
    const hash = multihash.toB58String(encoded)

    evidenceJSON.selfHash = hash

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider)
    expect(arbitrableContract.options.address).toBeTruthy()

    const fakeHost = 'http://fake-address'
    nock(fakeHost)
      .get(`/test`)
      .reply(200, evidenceJSON)

    // emit evidence with evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitEvidence(
        '0x0000000000000000000000000000000000000000',
        0,
        accounts[0],
        `${fakeHost}/test`
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const evidence = await arbitrableInstance.getEvidence(
      arbitrableContract.options.address
    )
    expect(evidence.length).toBe(1)
    expect(evidence[0].evidenceValid).toBeTruthy()
  })
})
