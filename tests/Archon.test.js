import Web3 from 'web3'

import Archon from '../src/Archon.js'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

describe('Archon', () => {
  it('static methods exist', async () => {
    expect(Archon.version).toBeTruthy()
    expect(Archon.utils).toBeTruthy()
    expect(Archon.modules).toBeTruthy()
  })
  it('static methods still part of class instance', async () => {
    const archonInstance = new Archon(provider)
    expect(archonInstance.version).toBeTruthy()
    expect(archonInstance.utils).toBeTruthy()
    expect(archonInstance.modules).toBeTruthy()
  })
  it('set provider', async () => {
    const archonInstance = new Archon(provider)
    expect(archonInstance.arbitrable.web3.currentProvider).toBe(provider)
    expect(archonInstance.arbitrator.web3.currentProvider).toBe(provider)

    const newProvider = new Web3.providers.HttpProvider(
      'http://kovan.infura.io'
    )
    archonInstance.setProvider(newProvider)
    expect(archonInstance.arbitrable.web3.currentProvider).toBe(newProvider)
    expect(archonInstance.arbitrator.web3.currentProvider).toBe(newProvider)
  })
  it('set gateway', async () => {
    const initialGateway = 'https://gateway.kleros.io'
    const archonInstance = new Archon(provider, initialGateway)
    expect(archonInstance.arbitrable.ipfsGateway).toBe(initialGateway)
    expect(archonInstance.arbitrator.ipfsGateway).toBe(initialGateway)

    const newGateway = 'http://ipfs.infura.io'
    archonInstance.setIpfsGateway(newGateway)

    expect(archonInstance.arbitrable.ipfsGateway).toBe(newGateway)
    expect(archonInstance.arbitrator.ipfsGateway).toBe(newGateway)

    // gateway with trailing / is modified
    const trailingGateway = initialGateway + '/'
    archonInstance.setIpfsGateway(trailingGateway)

    expect(archonInstance.arbitrable.ipfsGateway).toBe(initialGateway)
    expect(archonInstance.arbitrator.ipfsGateway).toBe(initialGateway)
  })
})
