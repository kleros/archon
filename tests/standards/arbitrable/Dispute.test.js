import Web3 from 'web3'

import { _deplyTestArbitrableContract } from '../../utils.js'
import Arbitrable from '../../../src/standards/Arbitrable'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

describe('Dispute', () => {
  let web3
  let arbitrableInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitrableInstance = new Arbitrable(provider)
  })

  it('get dispute log', async () => {
    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const arbitratorAddress = '0x0000000000000000000000000000000000000000'
    const disputeID = 2
    const metaEvidenceID = 1
    const evidenceGroupID = 3

    let receipt = await arbitrableContract.methods
      .emitDispute(
        arbitratorAddress,
        disputeID,
        metaEvidenceID,
        evidenceGroupID
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const disputeData = await arbitrableInstance.getDispute(
      arbitrableContract.options.address,
      arbitratorAddress,
      disputeID
    )
    expect(disputeData.metaEvidenceID).toEqual(`${metaEvidenceID}`)
    expect(disputeData.evidenceGroupID).toEqual(`${evidenceGroupID}`)
    expect(disputeData.createdAt).toBeTruthy()
    expect(disputeData.blockNumber).toBeTruthy()
    expect(disputeData.transactionHash).toEqual(receipt.transactionHash)
  })
  it('get dispute log -- no dispute raised', async () => {
    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const arbitratorAddress = '0x0000000000000000000000000000000000000000'
    const disputeID = 0

    let errored = false
    try {
      await arbitrableInstance.getDispute(
        arbitrableContract.options.address,
        arbitratorAddress,
        disputeID
      )
    } catch (err) {
      errored = true
      expect(err).toBeTruthy()
    }
    expect(errored).toBeTruthy()
  })
  it('get dispute log -- multiple dispute logs', async () => {
    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const arbitratorAddress = '0x0000000000000000000000000000000000000000'
    const disputeID = 0
    const metaEvidenceID = 1
    const evidenceGroupID = 3
    // emit evidence with evidence = fakeURI
    let receipt = await arbitrableContract.methods
      .emitDispute(
        arbitratorAddress,
        disputeID,
        metaEvidenceID,
        evidenceGroupID
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()
    // emit evidence with evidence = fakeURI
    receipt = await arbitrableContract.methods
      .emitDispute(
        arbitratorAddress,
        disputeID,
        metaEvidenceID + 1,
        evidenceGroupID
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    let errored = false
    try {
      await arbitrableInstance.getDispute(
        arbitrableContract.options.address,
        arbitratorAddress,
        disputeID
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }
    expect(errored).toBeTruthy()
  })
})
