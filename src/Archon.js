import isRequired from './utils/isRequired'
import { Arbitrable, Arbitrator } from './standards'

/**
 * Archon provides functionality for Arbitrator and Arbitrable Ethereum smart contracts
 * as defined in ERC 792 and ___insert_evidence_standard_ERC___.
 */
class Archon {
  /**
   * Instantiates a new Archon instance that provides the public interface
   * to Kleros contracts and library. All params are required. To use an individual
   * portion of the API import a class and initialize it yourself.
   * @param {string} ethereumProvider - The Web3.js Provider instance you would like the
   *                 Kleros.js library to use for interacting with the
   *                 Ethereum network.
   */
  constructor(ethereumProvider) {
    this.arbitrator = new Arbitrator(ethereumProvider)
    this.arbitrable = new Arbitrable(ethereumProvider)
  }

  /**
   * Set the provider instance.
   * @param {object} provider - The provider object.
   */
  setProvider = (provider = isRequired('provider')) => {
    this.arbitrator.setProvider(provider)
    this.arbitrable.setProvider(provider)
  }
}

export default Archon
