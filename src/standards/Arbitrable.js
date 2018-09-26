import ArbitrableJSONInterface from 'kleros-interaction/build/contracts/Arbitrable'
import axios from 'axios'

import * as errorConstants from '../constants/error'
import EventListener from '../utils/EventListener'
import isRequired from '../utils/isRequired'
import { validMultihash } from '../utils/hash'
import { getHttpUri, getURISuffix } from '../utils/uri'

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
   */
  getEvidence = async (
     contractAddress = isRequired('contractAddress'),
     metaEvidenceID = 0,
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

    if (evidenceLogs.length < 1)
      return []

    return Promise.all(
      evidenceLogs.map(async evidenceLog => {
        const args = await evidenceLog.returnValues
        let evidenceURI = args._evidence

        const { uri, preValidated } = getHttpUri(evidenceURI)
        const evidence = await httpRequest('GET', uri)

        let fileHashValid = true
        // validate file hash
        if (evidence.fileURI) {
          const { uri, preValidated } = getHttpUri(evidenceURI)

          if (!preValidated) {
            const fileResponse = await axios.get(uri)
            if (fileResponse.status !== 200)
              throw new Error(
                errorConstants.HTTP_ERROR(
                  `Unable to fetch file at ${
                    metaEvidence.fileURI
                  }. Returned status code ${fileResponse.status}`
                )
              )

            if (
              !validMultihash(
                metaEvidence.fileHash || getURISuffix(metaEvidence.fileURI),
                fileResponse.data
              )
            ) {
              fileHashValid = false
              if (options.strictHashes)
                throw new Error(errorConstants.VALIDATION_ERROR(
                  `File hash validation failed`
                ))
            }
          }
        }

        const submittedAt = new Promise((resolve, reject) => {
          this.web3.eth.getBlock(evidenceLog.blockNumber, (error, result) => {
            if (error) reject(error)

            resolve(result)
          })
        }).timestamp

        return {
          ...evidence.body,
          ...{ submittedBy: evidenceLog.args._party, submittedAt }
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
      throw new Error(errorConstants.CONTRACT_ERROR(
        `No MetaEvidence log for ${contractAddress} with metaEvidenceID ${metaEvidenceID}`
      ))

    if (metaEvidenceLog.length > 1)
      throw new Error(errorConstants.CONTRACT_ERROR(
        `More than one MetaEvidence returned for metaEvidenceID ${metaEvidenceID}`
      ))

    const args = await metaEvidenceLog[0].returnValues
    let metaEvidenceUri = args._evidence

    const { uri, preValidated } = getHttpUri(metaEvidenceUri)

    const httpResponse = await axios.get(uri)

    // TODO smart error handling
    if (httpResponse.status !== 200)
      throw new Error(errorConstants.HTTP_ERROR(
        `Unable to fetch MetaEvidence at ${metaEvidenceUri}. Returned status code ${
          httpResponse.status
        }`
      ))
    const { selfHash, ...metaEvidence } = httpResponse.data

    let metaEvidenceHashValid = true
    if (
      !preValidated &&
      !validMultihash(selfHash || getURISuffix(metaEvidenceUri), metaEvidence)
    ) {
      metaEvidenceHashValid = false
      if (options.strictHashes)
        throw new Error(errorConstants.VALIDATION_ERROR(
          `MetaEvidence hash validation failed`
        ))
    }

    let fileHashValid = true
    // validate file hash
    if (metaEvidence.fileURI) {
      const { uri, preValidated } = getHttpUri(metaEvidence.fileURI)

      if (!preValidated) {
        const fileResponse = await axios.get(uri)
        if (fileResponse.status !== 200)
          throw new Error(errorConstants.HTTP_ERROR(
            `Unable to fetch file at ${metaEvidence.fileURI}. Returned status code ${fileResponse.status}`
          ))

        if (
          !validMultihash(
            metaEvidence.fileHash || getURISuffix(metaEvidence.fileURI),
            fileResponse.data
          )
        ) {
          fileHashValid = false
          if (options.strictHashes)
            throw new Error(errorConstants.VALIDATION_ERROR(
              `File hash validation failed`
            ))
        }
      }
    }

    return {
      ...metaEvidence,
      metaEvidenceHashValid,
      fileHashValid
    }
  }
}

export default Arbitrable
