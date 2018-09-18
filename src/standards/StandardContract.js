import Web3 from 'web3'

class StandardContract {
  /**
   * Constructor ArbitrableTransaction.
   * @param {object} web3Provider instance.
   */
  constructor(web3Provider) {
    this.web3 = new Web3(web3Provider)
  }

  setProvider = newProvider => {
    this.web3.setProvider(newProvider)
  }
}

export default StandardContract
