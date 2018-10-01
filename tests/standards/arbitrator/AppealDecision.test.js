import Web3 from 'web3'
import multihash from 'multihashes'
import nock from 'nock'

import { _deplyTestArbitratorContract } from '../../utils.js'
import Arbitrator from '../../../src/standards/Arbitrator'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

describe('AppealDecision', () => {
  let web3
  let arbitratorInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitratorInstance = new Arbitrator(provider)
  })

  it('Fetch Appeal Decision log -- appeal 1', async () => {
    const disputeID = 0;
    const arbitrableContractAddress = '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .emitAppealDecision(
        disputeID,
        arbitrableContractAddress,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const appealCreationLog = await arbitratorInstance.getAppealDecision(
      arbitratorContract.options.address,
      disputeID,
      1
    )

    expect(appealCreationLog.arbitrableContract).toEqual(arbitrableContractAddress)
    expect(appealCreationLog.transactionHash).toEqual(receipt.transactionHash)
    expect(appealCreationLog.blockNumber).toBeTruthy()
    expect(appealCreationLog.logIndex).toBe(0)
    expect(appealCreationLog.appealedAt).toBeTruthy()
  })
  it('Missing log', async () => {
    const disputeID = 0;
    const arbitrableContractAddress = '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .emitAppealDecision(
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
      const appealCreationLog = await arbitratorInstance.getAppealDecision(
        arbitratorContract.options.address,
        disputeID,
        2
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }

    expect(errored).toBeTruthy()
  })
  it('Invalid appeal number', async () => {
    const disputeID = 0;
    const arbitrableContractAddress = '0x0000000000000000000000000000000000000000'

    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .emitAppealDecision(
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
      const appealCreationLog = await arbitratorInstance.getAppealDecision(
        arbitratorContract.options.address,
        disputeID,
        0
      )
    } catch (err) {
      expect(err).toBeTruthy()
      errored = true
    }

    expect(errored).toBeTruthy()
  })
})
