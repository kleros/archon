import ArbitrableJSONInterface from 'kleros-interaction/build/contracts/Arbitrable'
import axios from 'axios'

import EventListener from '../utils/EventListener'
import isRequired from '../utils/isRequired'
import { validMultihash } from '../utils/hash'
import { getURISuffix, getURIProtocol } from '../utils/uri'

import StandardContract from './StandardContract'

/**
 * Provides interaction with standard Arbitrable contracts
 * @example
 * const arbitrable = new Arbitable(web3Provider)
 */
class Arbitrable extends StandardContract {
  /**
   * Load an arbitrable web3 contract instance
   * @param {string} contractAddress - Address of the Arbitrable contract.
   * @returns {object} web3 contract instance
   */
  _loadContractInstance = contractAddress =>
    new this.web3.eth.Contract(ArbitrableJSONInterface.abi, contractAddress)

  /**
   * Get the metaEvidenceID for a dispute from the Dispute event log.
   * @param {string} contractAddress - Address of the Arbitrable contract.
   * @param {string} arbitratorAddress - Address of the Arbitrator contract.
   * @param {number} disputeID - The dispute index.
   */
  getMetaEvidenceIDForDispute = async (
    contractAddress = isRequired('contractAddress'),
    arbitratorAddress = isRequired('arbitratorAddress'),
    disputeID = isRequired('disputeID')
  ) => {
    // TODO
  }

  /**
   * Get the MetaEvidence object for a metaEvidenceID. Hashes will be validated.
   * By default MetaEvidence will be returned regardless of the validity of the hashes
   * with an indicator on whether the hash was valid or not. To throw an error instead,
   * use strictHashes = true in options object.
   * @param {string} contractAddress - The address of the Arbitrable contract.
   * @param {number} metaEvidenceID - The identifier of the metaEvidence log
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, strictHashes
   * @returns {object} The metaEvidence object
   */
  getMetaEvidence = async (
    contractAddress,
    metaEvidenceID = 0,
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const metaEvidenceLog = await EventListener.getEventLogs(
      contractInstance,
      'MetaEvidence',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      { _metaEvidenceID: metaEvidenceID }
    )

    // TODO smart error handling
    if (!metaEvidenceLog[0])
      throw new Error(
        `No MetaEvidence log for ${contractAddress} with metaEvidenceID ${metaEvidenceID}`
      )

    const args = await metaEvidenceLog[0].returnValues
    let metaEvidenceUri = args._evidence
    const JSONProtocol = getURIProtocol(metaEvidenceUri)

    let metaEvidencePreValidated = false
    switch (JSONProtocol) {
      case 'http':
        break
      case 'ipfs':
        ipfsID = getURISuffix(metaEvidenceUri)
        metaEvidenceUri = `${process.env.IPFS_GATEWAY_URI}/${ipfsID}`
        metaEvidencePreValidated = true
        break
      default:
        throw new Error(`Unrecognized protocol ${protocol}`)
    }

    // TODO handle different protocols than HTTP (e.g. ipfs://)
    const httpResponse = await axios.get(metaEvidenceUri)

    // TODO smart error handling
    if (httpResponse.status !== 200)
      throw new Error(
        `HTTP Error: Unable to fetch MetaEvidence at ${metaEvidenceUri}. Returned status code ${
          httpResponse.status
        }`
      )
    const { selfHash, ...metaEvidence } = httpResponse.data

    let metaEvidenceHashValid = true

    if (
      !metaEvidencePreValidated &&
      !validMultihash(selfHash || getURISuffix(metaEvidenceUri), metaEvidence)
    ) {
      metaEvidenceHashValid = false
      if (options.strictHashes)
        throw new Error(
          `Hash Validation Error: MetaEvidence hash validation failed`
        )
    }

    let fileHashValid = true
    // validate file hash
    if (metaEvidence.fileURI) {
      const fileProtocol = getURIProtocol(metaEvidence.fileURI)
      let filePreValidated = false
      switch (JSONProtocol) {
        case 'http':
          break
        case 'ipfs':
          filePreValidated = true
          break
        default:
          throw new Error(`Unrecognized protocol ${protocol}`)
      }

      let fileValidation = true

      if (!filePreValidated) {
        const fileResponse = await axios.get(metaEvidence.fileURI)
        if (fileResponse.status !== 200)
          throw new Error(
            `HTTP Error: Unable to fetch file at ${
              metaEvidence.fileURI
            }. Returned status code ${fileResponse.status}`
          )

        if (!validMultihash(metaEvidence.fileHash, fileResponse.data)) {
          fileHashValid = false
          if (options.strictHashes)
            throw new Error(`Hash Validation Error: File hash validation failed`)
        }
      }
    }

    return {
      ...metaEvidence,
      metaEvidenceHashValid,
      fileHashValid
    }
  }

  /**
   * Get the evidence submitted in a dispute.
   * @returns {object[]} An array of evidence objects.
   */
  getEvidence = async () => {
    // TODO
  }
}

export default Arbitrable
