/* eslint-disable prettier/prettier */
import Web3 from 'web3'
import ganache from 'ganache-core'
import nock from 'nock'

import { _deplyTestArbitrableContract } from '../../utils.js'
import Arbitrable from '../../../src/standards/Arbitrable'
import { multihashFile } from '../../../src/utils/hashing'

const provider = ganache.provider()

describe('MetaEvidence', () => {
  let web3
  let arbitrableInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitrableInstance = new Arbitrable(provider)
  })

  it('valid metaEvidence -- hash in uri', async () => {
    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description'
    }

    const hash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
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
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy()
    expect(metaEvidence.metaEvidenceJSON).toEqual(metaEvidenceJSON)
    expect(metaEvidence.blockNumber).toBeTruthy()
    expect(metaEvidence.transactionHash).toEqual(receipt.transactionHash)
  })
  it('invalid metaEvidence -- hash in uri', async () => {
    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description'
    }
    const hash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const fakeHost = 'http://fake-address'
    nock(fakeHost)
      .get(`/${hash}`)
      .reply(200, { title: 'different metaEvidence' })
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
    expect(metaEvidence.metaEvidenceJSONValid).toBeFalsy()
  })
  it('valid file -- hash in uri', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
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
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy()
    expect(metaEvidence.fileValid).toBeTruthy()
  })
  it('invalid file -- hash in uri', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/${fileHash}`)
      .reply(200, { type: null })
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
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy()
    expect(metaEvidence.fileValid).toBeFalsy()
  })
  it('valid file -- hash as fileHash', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/file`,
      fileHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/file`)
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
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy()
    expect(metaEvidence.fileValid).toBeTruthy()
  })
  it('invalid file -- hash as fileHash', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/file`,
      fileHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/file`)
      .reply(200, { type: null })
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
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy()
    expect(metaEvidence.fileValid).toBeFalsy()
  })
  it('valid metaEvidence -- selfHash', async () => {
    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description'
    }
    const hash = multihashFile(metaEvidenceJSON, 0x1B)

    metaEvidenceJSON.selfHash = hash

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const fakeHost = 'http://fake-address'
    nock(fakeHost)
      .get(`/test`)
      .reply(200, metaEvidenceJSON)
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitMetaEvidence(0, `${fakeHost}/test`)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const metaEvidence = await arbitrableInstance.getMetaEvidence(
      arbitrableContract.options.address,
      0
    )
    expect(metaEvidence.metaEvidenceJSON.title).toEqual(metaEvidenceJSON.title)
    expect(metaEvidence.metaEvidenceJSON.description).toEqual(
      metaEvidenceJSON.description
    )
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy()
  })
  it('invalid metaEvidence -- strictHashes', async () => {
    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description'
    }
    const hash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const fakeHost = 'http://fake-address'
    nock(fakeHost)
      .get(`/${hash}`)
      .reply(200, { title: 'different metaEvidence' })
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitMetaEvidence(0, `${fakeHost}/${hash}`)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    let errored = false
    try {
      await arbitrableInstance.getMetaEvidence(
        arbitrableContract.options.address,
        0,
        { strictHashes: true }
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }
    expect(errored).toBeTruthy()
  })
  it('invalid file -- strictHashes', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      fileURI: `${fakeHost}/${fileHash}`
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/${fileHash}`)
      .reply(200, { type: null })
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods
      .emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    let errored = false
    try {
      await arbitrableInstance.getMetaEvidence(
        arbitrableContract.options.address,
        0,
        { strictHashes: true }
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }
    expect(errored).toBeTruthy()
  })
  it('valid arbitrable interface -- hash in filename', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      evidenceDisplayInterfaceURL: `${fakeHost}/${fileHash}`
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
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
    expect(metaEvidence.interfaceValid).toBeTruthy()
  })
  it('valid arbitrable interface -- hash in evidenceDisplayInterfaceHash', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      evidenceDisplayInterfaceURL: `${fakeHost}/test`,
      evidenceDisplayInterfaceHash: fileHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/test`)
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
    expect(metaEvidence.interfaceValid).toBeTruthy()
  })
  it('invalid arbitrable interface', async () => {
    const testFile = JSON.stringify({
      type: 'file',
      data: '0x0'
    })
    const fileHash = multihashFile(testFile, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      evidenceDisplayInterfaceURL: `${fakeHost}/test`,
      evidenceDisplayInterfaceHash: fileHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/test`)
      .reply(200, { type: 'other' })
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
    expect(metaEvidence.interfaceValid).toBeFalsy()
  })
  it.skip('edit metaEvidence with dynamicScriptURI', async () => {
    // TODO add support for nodejs
    const testScript = 'const getMetaEvidence = () => {resolveScript({rulingOptions: {type: "multiple-select"}})};'
    const scriptHash = multihashFile(testScript, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      rulingOptions: {
        type: "single-select"
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/${scriptHash}`)
      .reply(200, testScript)
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

    expect(metaEvidence.scriptValid).toBeTruthy()
    expect(metaEvidence.metaEvidenceJSON.rulingOptions.type).toBe("multiple-select")
  })
  it('script fail: should still return metaEvidence', async () => {
    const testScript = 'const getMetaEvidence = () => {bad syntax; resolveScript({rulingOptions: {type: "multiple-select"}}});'
    const scriptHash = multihashFile(testScript, 0x1B)

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      rulingOptions: {
        type: "single-select"
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/${scriptHash}`)
      .reply(200, testScript)
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

    expect(metaEvidence.scriptValid).toBeFalsy()
    expect(metaEvidence.metaEvidenceJSON).toEqual(metaEvidenceJSON)
  })
  it('script hash fail', async () => {
    const testScript = 'const getMetaEvidence = () => {resolveScript {rulingOptions: {type: "multiple-select"}}};'
    const scriptHash = multihashFile(testScript, 0x1B) + '1'

    const fakeHost = 'http://fake-address'

    const metaEvidenceJSON = {
      title: 'test title',
      description: 'test description',
      rulingOptions: {
        type: "single"
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash
    }
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1B)

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    nock(fakeHost)
      .get(`/${metaEvidenceHash}`)
      .reply(200, metaEvidenceJSON)
    nock(fakeHost)
      .get(`/${scriptHash}`)
      .reply(200, testScript)
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

    expect(metaEvidence.scriptValid).toBeFalsy()
    expect(metaEvidence.metaEvidenceJSON).toBeTruthy()
  })
})
