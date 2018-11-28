import Web3 from 'web3'

class StandardContract {
  /**
   * Constructor ArbitrableTransaction.
   * @param {object} web3Provider instance.
   * @param {string} ipfsGateway IPFS gateway URI.
   */
  constructor(web3Provider, ipfsGateway) {
    this.web3 = new Web3(web3Provider)
    this.ipfsGateway = ipfsGateway
  }

  setProvider = newProvider => {
    this.web3.setProvider(newProvider)
  }

  setIpfsGateway = newGateway => {
    this.ipfsGateway = newGateway
  }
}

export default StandardContract
