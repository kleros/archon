import ArbitrableJSONInterface from 'kleros-interaction/build/contracts/Arbitrable'

import * as errorConstants from '../constants/error'
import EventListener from '../utils/EventListener'
import isRequired from '../utils/isRequired'
import { validateFileFromURI } from '../utils/validation'

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
   * Fetch all Evidence submitted to the contract.
   * @param {string} contractAddress - The address of the arbitrable contract.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, filters, strictHashes
   * @returns {object[]} An array of evidence objects
   */
  getEvidence = async (
    contractAddress = isRequired('contractAddress'),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const evidenceLogs = await EventListener.getEventLogs(
      contractInstance,
      'Evidence',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      options.filters || {}
    )

    if (evidenceLogs.length === 0) return []

    return Promise.all(
      evidenceLogs.map(async evidenceLog => {
        const args = await evidenceLog.returnValues
        const evidenceURI = args._evidence

        const {
          file: evidenceJSON,
          isValid: evidenceValid
        } = await validateFileFromURI(evidenceURI, {
          evidence: true,
          strictHashes: options.strictHashes
        })

        const { isValid: fileValid } = evidenceJSON.fileURI
          ? await validateFileFromURI(evidenceJSON.fileURI, {
              evidence: true,
              strictHashes: options.strictHashes,
              hash: evidenceJSON.fileHash
            })
          : { isValid: null }

        const submittedAt = (await new Promise((resolve, reject) => {
          this.web3.eth.getBlock(evidenceLog.blockNumber, (error, result) => {
            if (error) reject(error)

            resolve(result)
          })
        })).timestamp

        return {
          evidenceValid,
          fileValid,
          ...evidenceJSON,
          ...{ submittedBy: args._party, submittedAt }
        }
      })
    )
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
    contractAddress = isRequired('contractAddress'),
    metaEvidenceID = 0,
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const metaEvidenceLog = await EventListener.getEventLogs(
      contractInstance,
      'MetaEvidence',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      { _metaEvidenceID: metaEvidenceID, ...options.filters }
    )

    if (!metaEvidenceLog[0])
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `No MetaEvidence log for ${contractAddress} with metaEvidenceID ${metaEvidenceID}`
        )
      )

    if (metaEvidenceLog.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `More than one MetaEvidence returned for metaEvidenceID ${metaEvidenceID}`
        )
      )

    const args = await metaEvidenceLog[0].returnValues
    const metaEvidenceUri = args._evidence

    const {
      file: metaEvidenceJSON,
      isValid: metaEvidenceValid
    } = await validateFileFromURI(metaEvidenceUri, {
      evidence: true,
      strictHashes: options.strictHashes
    })

    // validate file hash
    const { isValid: fileValid } = metaEvidenceJSON.fileURI
      ? await validateFileFromURI(metaEvidenceJSON.fileURI, {
          evidence: true,
          strictHashes: options.strictHashes,
          hash: metaEvidenceJSON.fileHash
        })
      : { isValid: null }

    return {
      ...metaEvidenceJSON,
      metaEvidenceValid,
      fileValid
    }
  }

  /**
   * Fetch the ruling for a dispute.
   * @param {string} contractAddress - The address of the arbitrable contract.
   * @param {string} arbitratorAddress - The address of the arbitrator contract.
   * @param {number} disputeID - The index of the dispute.
   * @param {object} options - Optional parameters. Includes fromBlock and toBlock.
   * @returns {number} The number denoting the ruling.
   */
  getRuling = async (
    contractAddress,
    arbitratorAddress,
    disputeID,
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const rulingLog = await EventListener.getEventLogs(
      contractInstance,
      'Ruling',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      {
        _arbitrator: arbitratorAddress,
        _disputeID: disputeID,
        ...options.filters
      }
    )

    if (rulingLog.length === 0) return null
    else if (rulingLog.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `There is more than one ruling for dispute ${disputeID} in arbitrator ${arbitratorAddress}`
        )
      )

    const args = await rulingLog[0].returnValues

    return args._ruling
  }
}

export default Arbitrable
