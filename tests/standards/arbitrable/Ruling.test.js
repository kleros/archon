import Web3 from 'web3'

import { _deplyTestArbitrableContract } from '../../utils.js'
import Arbitrable from '../../../src/standards/Arbitrable'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

describe('Ruling', () => {
  let web3
  let arbitrableInstance
  let accounts

  beforeAll(async () => {
    web3 = new Web3(provider)
    accounts = await web3.eth.getAccounts()
    arbitrableInstance = new Arbitrable(provider)
  })

  it('get ruling on dispute', async () => {
    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const arbitratorAddress = '0x0000000000000000000000000000000000000000'
    const disputeID = 0
    const ruling = 1
    // emit evidence with evidence = fakeURI
    let receipt = await arbitrableContract.methods
      .emitRuling(arbitratorAddress, disputeID, ruling)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    const _ruling = await arbitrableInstance.getRuling(
      arbitrableContract.options.address,
      arbitratorAddress,
      disputeID
    )
    expect(_ruling).toEqual(`${ruling}`)
  })
  it('get ruling on dispute -- no ruling yet', async () => {
    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const arbitratorAddress = '0x0000000000000000000000000000000000000000'
    const disputeID = 0

    const _ruling = await arbitrableInstance.getRuling(
      arbitrableContract.options.address,
      arbitratorAddress,
      disputeID
    )
    expect(_ruling).toEqual(null)
  })
  it('get ruling on dispute -- multiple rulings same dispute', async () => {
    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(
      provider,
      accounts[0]
    )
    expect(arbitrableContract.options.address).toBeTruthy()

    const arbitratorAddress = '0x0000000000000000000000000000000000000000'
    const disputeID = 0
    const ruling = 1
    // emit evidence with evidence = fakeURI
    let receipt = await arbitrableContract.methods
      .emitRuling(arbitratorAddress, disputeID, ruling)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()
    // emit evidence with evidence = fakeURI
    receipt = await arbitrableContract.methods
      .emitRuling(arbitratorAddress, disputeID, ruling + 1)
      .send({
        from: accounts[0],
        gas: 500000
      })
    expect(receipt.transactionHash).toBeTruthy()

    let errored = false
    try {
      const _ruling = await arbitrableInstance.getRuling(
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
