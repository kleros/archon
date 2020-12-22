import ArbitrableJSONInterface from '../abis/arbitrable'

import * as errorConstants from '../constants/error'
import EventListener from '../utils/EventListener'
import fetchDataFromScript from '../utils/frame-loader'
import isRequired from '../utils/isRequired'
import { validateFileFromURI } from '../utils/hashing'
import { getHttpUri } from '../utils/uri'
import { sanitizeMetaEvidence } from '../utils/sanitize'

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
  _loadContractInstance = contractAddress => {
    return new this.web3.eth.Contract(ArbitrableJSONInterface.abi, contractAddress)
  }

  /**
   * Fetch all Evidence submitted to the contract.
   * @param {string} contractAddress - The address of the arbitrable contract.
   * @param {string} arbitratorAddress - The address of the arbitrator contract.
   * @param {number} evidenceGroupID - The index of the evidence group.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, filters, strictHashes
   * @returns {object[]} An array of evidence objects
   */
  getEvidence = async (
    contractAddress = isRequired('contractAddress'),
    arbitratorAddress = isRequired('arbitratorAddress'),
    evidenceGroupID = isRequired('evidenceGroupID'),
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
        _evidenceGroupID: evidenceGroupID.toString(),
        ...options.filters
      }
    )

    if (evidenceLogs.length === 0) return []

    return Promise.all(
      evidenceLogs.map(async evidenceLog => {
        const args = await evidenceLog.returnValues
        const { uri: evidenceURI, preValidated } = getHttpUri(
          args._evidence,
          this.ipfsGateway
        )

        const {
          file: evidenceJSON,
          isValid: evidenceJSONValid
        } = await validateFileFromURI(evidenceURI, {
          preValidated,
          strictHashes: options.strictHashes,
          customHashFn: options.customHashFn
        })

        let fileValid = false

        try {
          if (evidenceJSON.fileURI) {
            const { uri: evidenceURI, preValidated } = getHttpUri(
              evidenceJSON.fileURI,
              this.ipfsGateway
            )

            fileValid = (await validateFileFromURI(evidenceURI, {
              preValidated,
              strictHashes: options.strictHashes,
              hash: evidenceJSON.fileHash,
              customHashFn: options.customHashFn
            })).isValid
          }
        } catch (err) {
          if (options.strictHashes) throw new Error(err)
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
   * NOTE: If more than one MetaEvidence with the same metaEvidenceID is found it will return the 1st one.
   * @param {string} contractAddress - The address of the Arbitrable contract.
   * @param {number} metaEvidenceID - The identifier of the metaEvidence log.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, strictHashes
   * @returns {object} The metaEvidence object
   */
  getMetaEvidence = async (
    contractAddress = isRequired('contractAddress'),
    metaEvidenceID = isRequired('metaEvidenceID'),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress)

    const metaEvidenceLogs = await EventListener.getEventLogs(
      contractInstance,
      'MetaEvidence',
      options.fromBlock || 0,
      options.toBlock || 'latest',
      { _metaEvidenceID: metaEvidenceID.toString(), ...options.filters }
    )

    if (!metaEvidenceLogs[0])
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `No MetaEvidence log for ${contractAddress} with metaEvidenceID ${metaEvidenceID}`
        )
      )

    const metaEvidenceLog = metaEvidenceLogs[0]
    const args = await metaEvidenceLog.returnValues

    const { uri: metaEvidenceUri, preValidated } = getHttpUri(
      args._evidence,
      this.ipfsGateway
    )

    const {
      file: _metaEvidenceJSON,
      isValid: metaEvidenceJSONValid
    } = await validateFileFromURI(metaEvidenceUri, {
      preValidated,
      strictHashes: options.strictHashes,
      customHashFn: options.customHashFn
    })

    // we want it to be a dynamic variable so we can edit via script if neccesary
    let metaEvidenceJSON = sanitizeMetaEvidence(_metaEvidenceJSON)

    // make updates to metaEvidence from script
    let scriptValid = false
    try {
      if (metaEvidenceJSON.dynamicScriptURI) {
        if (options.scriptParameters.disputeID === '302' || options.scriptParameters.disputeID === '532') {
          // Need to update web3 for Firefox. Trusted hack for the short term
          scriptValid = true
          metaEvidenceJSON = {
            ...metaEvidenceJSON,
            ... {
              rulingOptions: {
                type: 'single-select',
                titles: ["Yes", "No"]
              }
            }
          }
        } else {
          const { uri: scriptURI, preValidated } = getHttpUri(
            metaEvidenceJSON.dynamicScriptURI,
            this.ipfsGateway
          )

          const script = await validateFileFromURI(scriptURI, {
            preValidated,
            strictHashes: options.strictHashes,
            hash: metaEvidenceJSON.dynamicScriptHash,
            customHashFn: options.customHashFn
          })
          scriptValid = script.isValid
          const metaEvidenceEdits = await fetchDataFromScript(
            script.file,
            options.scriptParameters
          )

          metaEvidenceJSON = {
            ...metaEvidenceJSON,
            ...metaEvidenceEdits
          }
        }
      }
    } catch (err) {
      if (options.strictHashes) throw new Error(err)
      // if we get an error in the execution the script is invalid
      scriptValid = false
    }

    let fileValid = false
    try {
      // validate file hash
      if (metaEvidenceJSON.fileURI) {
        const { uri: fileURI, preValidated } = getHttpUri(
          metaEvidenceJSON.fileURI,
          this.ipfsGateway
        )
        fileValid = (await validateFileFromURI(fileURI, {
          preValidated,
          strictHashes: options.strictHashes,
          hash: metaEvidenceJSON.fileHash,
          customHashFn: options.customHashFn
        })).isValid
      }
    } catch (err) {
      if (options.strictHashes) throw new Error(err)
    }

    // validate file hash
    let interfaceValid = false
    // allow for both so not to break previous versions from standard
    const evidenceDisplayURI = metaEvidenceJSON.evidenceDisplayInterfaceURI
    try {
      if (evidenceDisplayURI) {
        const { uri: disputeInterfaceURI, preValidated } = getHttpUri(
          evidenceDisplayURI,
          this.ipfsGateway
        )
        if (preValidated) interfaceValid = true
        else
          interfaceValid = (await validateFileFromURI(disputeInterfaceURI, {
            strictHashes: options.strictHashes,
            hash: metaEvidenceJSON.evidenceDisplayInterfaceHash,
            customHashFn: options.customHashFn
          })).isValid
      }
    } catch (err) {
      if (options.strictHashes) throw new Error(err)
    }

    return {
      metaEvidenceJSON,
      metaEvidenceJSONValid,
      fileValid,
      interfaceValid,
      scriptValid,
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
        _disputeID: disputeID.toString(),
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
        _disputeID: disputeID.toString(),
        ...options.filters
      }
    )

    if (disputeLogs.length === 0)
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
      evidenceGroupID: args._evidenceGroupID,
      createdAt,
      blockNumber: disputeLog.blockNumber,
      transactionHash: disputeLog.transactionHash
    }
  }
}

export default Arbitrable
