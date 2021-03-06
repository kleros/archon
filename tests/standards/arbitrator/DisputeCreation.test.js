import Web3 from 'web3'
import ganache from 'ganache-core'

import { _deplyTestArbitratorContract } from '../../utils.js'
import Arbitrator from '../../../src/standards/Arbitrator'

const provider = ganache.provider()

describe('DisputeCreation', () => {
  let web3
  let arbitratorInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitratorInstance = new Arbitrator(provider)
  })

  it('Fetch Dispute Creation log', async () => {
    const disputeID = 0
    const arbitrableContractAddress =
      '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(
      provider,
      accounts[0]
    )

    const receipt = await arbitratorContract.methods
      .emitDisputeCreation(disputeID, arbitrableContractAddress)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const disputeCreationLog = await arbitratorInstance.getDisputeCreation(
      arbitratorContract.options.address,
      disputeID
    )

    expect(disputeCreationLog.arbitrableContract).toEqual(
      arbitrableContractAddress
    )
    expect(disputeCreationLog.transactionHash).toEqual(receipt.transactionHash)
    expect(disputeCreationLog.blockNumber).toBeTruthy()
    expect(disputeCreationLog.createdAt).toBeTruthy()
  })
  it('No log', async () => {
    const disputeID = 0

    const arbitratorContract = await _deplyTestArbitratorContract(
      provider,
      accounts[0]
    )

    let errored = false
    try {
      await arbitratorInstance.getDisputeCreation(
        arbitratorContract.options.address,
        disputeID
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }

    expect(errored).toBeTruthy()
  })
  it('Too many logs', async () => {
    const disputeID = 0
    const arbitrableContractAddress =
      '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(
      provider,
      accounts[0]
    )

    let receipt = await arbitratorContract.methods
      .emitDisputeCreation(disputeID, arbitrableContractAddress)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    receipt = await arbitratorContract.methods
      .emitDisputeCreation(disputeID, arbitrableContractAddress)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    let errored = false
    try {
      await arbitratorInstance.getDisputeCreation(
        arbitratorContract.options.address,
        disputeID
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }

    expect(errored).toBeTruthy()
  })
})
