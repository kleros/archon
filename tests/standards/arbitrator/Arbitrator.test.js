import Web3 from 'web3'
import multihash from 'multihashes'
import nock from 'nock'

import { _deplyTestArbitratorContract } from '../../utils.js'
import Arbitrator from '../../../src/standards/Arbitrator'
import { DisputeStatus } from '../../../src/constants/arbitrator'

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

  it('Get Dispute Statuses enum', async () => {
    expect(arbitratorInstance.DisputeStatus).toEqual(DisputeStatus)
  })
  it('Get ArbitrationCost', async () => {
    const _arbitrationCost = 100000
    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .setArbitrationCost(
        _arbitrationCost
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const arbitrationCost = await arbitratorInstance.getArbitrationCost(
      arbitratorContract.options.address
    )

    expect(arbitrationCost).toEqual(`${_arbitrationCost}`)
  })
  it('Get getAppealCost', async () => {
    const _appealCost = 100000
    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .setAppealCost(
        _appealCost,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const appealCost = await arbitratorInstance.getAppealCost(
      arbitratorContract.options.address,
      0
    )

    expect(appealCost).toEqual(`${_appealCost}`)
  })
  it('Get getCurrentRuling', async () => {
    const _currentRuling = 1
    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .setCurrentRuling(
        _currentRuling,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const currentRuling = await arbitratorInstance.getCurrentRuling(
      arbitratorContract.options.address,
      0
    )

    expect(currentRuling).toEqual(`${_currentRuling}`)
  })
  it('Get getDisputeStatus', async () => {
    const _disputeStatus = 1
    const arbitratorContract = await _deplyTestArbitratorContract(provider)

    const receipt = await arbitratorContract.methods
      .setDisputeStatus(
        _disputeStatus,
      )
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const disputeStatus = await arbitratorInstance.getDisputeStatus(
      arbitratorContract.options.address,
      0
    )

    expect(disputeStatus).toEqual(`${_disputeStatus}`)
  })

})
