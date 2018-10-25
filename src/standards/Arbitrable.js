import ArbitrableJSONInterface from 'kleros-interaction/build/contracts/Arbitrable'

import * as errorConstants from '../constants/error'
import EventListener from '../utils/EventListener'
import isRequired from '../utils/isRequired'
import { validateFileFromURI } from '../utils/hashing'

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
   * @param {string} arbitratorAddress - The address of the arbitrator contract.
   * @param {number} disputeID - The index of the dispute.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, filters, strictHashes
   * @returns {object[]} An array of evidence objects
   */
  getEvidence = async (
    contractAddress = isRequired('contractAddress'),
    arbitratorAddress = isRequired('arbitratorAddress'),
    disputeID = isRequired('isRequired'),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const evidenceLogs = await EventListener.getEventLogs(
      contractInstance,
      'Evidence',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      {
        _arbitrator: arbitratorAddress,
        _disputeID: disputeID,
        ...options.filters
      }
    )

    if (evidenceLogs.length === 0) return []

    return Promise.all(
      evidenceLogs.map(async evidenceLog => {
        const args = await evidenceLog.returnValues
        const evidenceURI = args._evidence

        const {
          file: evidenceJSON,
          isValid: evidenceJSONValid
        } = await validateFileFromURI(evidenceURI, {
          evidence: true,
          strictHashes: options.strictHashes,
          customHashFn: options.customHashFn
        })

        let fileValid

        try {
          fileValid = evidenceJSON.fileURI
            ? (await validateFileFromURI(evidenceJSON.fileURI, {
                evidence: true,
                strictHashes: options.strictHashes,
                hash: evidenceJSON.fileHash,
                customHashFn: options.customHashFn
              })).isValid
            : null
        } catch (err) {
          if (options.strictHashes) throw new Error(err)
          fileValid = false
        }

        const submittedAt = (await new Promise((resolve, reject) => {
          this.web3.eth.getBlock(evidenceLog.blockNumber, (error, result) => {
            if (error) reject(error)

            resolve(result)
          })
        })).timestamp

        return {
          evidenceJSONValid,
          fileValid,
          evidenceJSON,
          submittedAt,
          submittedBy: args._party,
          blockNumber: evidenceLog.blockNumber,
          transactionHash: evidenceLog.transactionHash
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

    const metaEvidenceLogs = await EventListener.getEventLogs(
      contractInstance,
      'MetaEvidence',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      { _metaEvidenceID: metaEvidenceID, ...options.filters }
    )

    if (!metaEvidenceLogs[0])
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `No MetaEvidence log for ${contractAddress} with metaEvidenceID ${metaEvidenceID}`
        )
      )

    if (metaEvidenceLogs.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `More than one MetaEvidence returned for metaEvidenceID ${metaEvidenceID}`
        )
      )

    const metaEvidenceLog = metaEvidenceLogs[0]
    const args = await metaEvidenceLog.returnValues
    const metaEvidenceUri = args._evidence

    const {
      file: metaEvidenceJSON,
      isValid: metaEvidenceJSONValid
    } = await validateFileFromURI(metaEvidenceUri, {
      evidence: true,
      strictHashes: options.strictHashes,
      customHashFn: options.customHashFn
    })

    let fileValid
    try {
      // validate file hash
      fileValid = metaEvidenceJSON.fileURI
        ? (await validateFileFromURI(metaEvidenceJSON.fileURI, {
            evidence: true,
            strictHashes: options.strictHashes,
            hash: metaEvidenceJSON.fileHash,
            customHashFn: options.customHashFn
          })).isValid
        : null
    } catch (err) {
      if (options.strictHashes) throw new Error(err)
      fileValid = false
    }

    // validate file hash
    let interfaceValid
    try {
      interfaceValid = metaEvidenceJSON.evidenceDisplayInterfaceURL
        ? (await validateFileFromURI(
            metaEvidenceJSON.evidenceDisplayInterfaceURL,
            {
              strictHashes: options.strictHashes,
              hash: metaEvidenceJSON.evidenceDisplayInterfaceHash,
              customHashFn: options.customHashFn
            }
          )).isValid
        : { isValid: null }
    } catch (err) {
      if (options.strictHashes) throw new Error(err)
      interfaceValid = false
    }

    return {
      metaEvidenceJSON,
      metaEvidenceJSONValid,
      fileValid,
      interfaceValid,
      blockNumber: metaEvidenceLog.blockNumber,
      transactionHash: metaEvidenceLog.transactionHash
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
    contractAddress = isRequired('contractAddress'),
    arbitratorAddress = isRequired('arbitratorAddress'),
    disputeID = isRequired('disputeID'),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const rulingLogs = await EventListener.getEventLogs(
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

    if (rulingLogs.length === 0)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `There is no ruling for dispute ${disputeID} in arbitrator ${arbitratorAddress}`
        )
      )
    else if (rulingLogs.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `There is more than one ruling for dispute ${disputeID} in arbitrator ${arbitratorAddress}`
        )
      )

    const rulingLog = rulingLogs[0]
    const args = await rulingLog.returnValues

    const ruledAt = (await new Promise((resolve, reject) => {
      this.web3.eth.getBlock(rulingLog.blockNumber, (error, result) => {
        if (error) reject(error)

        resolve(result)
      })
    })).timestamp

    return {
      ruling: args._ruling,
      ruledAt,
      blockNumber: rulingLog.blockNumber,
      transactionHash: rulingLog.transactionHash
    }
  }

  /**
   * Get the event log emitted when a dispute has been created. This event links
   * metaEvidence to a dispute by _metaEvidenceID.
   * @param {string} contractAddress - The address of the contract.
   * @param {string} arbitratorAddress - The address of the arbitrator contract.
   * @param {number} disputeID - The index of the dispute.
   * @param {object} options - Optional parameters. Includes fromBlock and toBlock.
   * @returns {object} The data from the event log
   */
  getDispute = async (
    contractAddress = isRequired('contractAddress'),
    arbitratorAddress = isRequired('arbitratorAddress'),
    disputeID = isRequired('isRequired'),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const disputeLogs = await EventListener.getEventLogs(
      contractInstance,
      'Dispute',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      {
        _arbitrator: arbitratorAddress,
        _disputeID: disputeID,
        ...options.filters
      }
    )

    if (!disputeLogs[0])
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `No Dispute log for ${contractAddress} with arbitrator ${arbitratorAddress} and disputeID ${disputeID}`
        )
      )

    if (disputeLogs.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `More than one Dispute returned for arbitrator ${arbitratorAddress} and disputeID ${disputeID}`
        )
      )

    const disputeLog = disputeLogs[0]
    const args = await disputeLog.returnValues
    const createdAt = (await new Promise((resolve, reject) => {
      this.web3.eth.getBlock(disputeLog.blockNumber, (error, result) => {
        if (error) reject(error)

        resolve(result)
      })
    })).timestamp

    return {
      metaEvidenceID: args._metaEvidenceID,
      createdAt,
      blockNumber: disputeLog.blockNumber,
      transactionHash: disputeLog.transactionHash
    }
  }
}

export default Arbitrable
