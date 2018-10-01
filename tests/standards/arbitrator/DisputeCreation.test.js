import Web3 from 'web3'
import multihash from 'multihashes'
import nock from 'nock'

import { _deplyTestArbitratorContract } from '../../utils.js'
import Arbitrator from '../../../src/standards/Arbitrator'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

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
    const disputeID = 0;
    const arbitrableContractAddress = '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .emitDisputeCreation(
        disputeID,
        arbitrableContractAddress,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const disputeCreationLog = await arbitratorInstance.getDisputeCreation(
      arbitratorContract.options.address,
      disputeID
    )

    expect(disputeCreationLog.arbitrableContract).toEqual(arbitrableContractAddress)
    expect(disputeCreationLog.transactionHash).toEqual(receipt.transactionHash)
    expect(disputeCreationLog.blockNumber).toBeTruthy()
    expect(disputeCreationLog.logIndex).toBe(0)
    expect(disputeCreationLog.createdAt).toBeTruthy()
  })
  it('No log', async () => {
    const disputeID = 0;
    const arbitrableContractAddress = '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    let errored = false
    try {
      const disputeCreationLog = await arbitratorInstance.getDisputeCreation(
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
    const disputeID = 0;
    const arbitrableContractAddress = '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    let receipt = await arbitratorContract.methods
      .emitDisputeCreation(
        disputeID,
        arbitrableContractAddress,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    receipt = await arbitratorContract.methods
      .emitDisputeCreation(
        disputeID,
        arbitrableContractAddress,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    let errored = false
    try {
      const disputeCreationLog = await arbitratorInstance.getDisputeCreation(
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
