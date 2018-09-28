import ArbitratorContractInterface from 'kleros-interaction/build/contracts/Arbitrator'

import isRequired from '../utils/isRequired'
import * as arbitratorConstants from '../constants/arbitrator'

import StandardContract from './StandardContract'

/**
 * Provides interaction with standard Arbitrable contracts
 */
class Arbitrator extends StandardContract {
  // enums and constants
  DisputeStatus = arbitratorConstants.DisputeStatus

  /**
   * Load an arbitrable web3 contract instance
   * @param {string} contractAddress - Address of the Arbitrable contract.
   * @returns {object} web3 contract instance
   */
  _loadContractInstance = contractAddress =>
    new this.web3.eth.Contract(ArbitratorContractInterface.abi, contractAddress)

  /**
   * Fetch the arbitration cost.
   * @param {string} contractAddress - The address of the arbitrator contract.
   * @param {stirng} extraData - Hex string representing the extra data for the dispute.
   * @returns {number} The arbitration cost in WEI
   */
   getArbitrationCost = async (
     contractAddress = isRequired('contractAddress'),
     extraData = "0x0"
   ) => {
     const contractInstance = this._loadContractInstance(contractAddress)

     return contractInstance.arbitrationCost(extraData)
   }

   /**
    * Fetch the appeal cost.
    * @param {string} contractAddress - The address of the arbitrator contract.
    * @param {number} disputeID - The index of the dispute.
    * @param {stirng} extraData - Hex string representing the extra data for the dispute.
    * @returns {number} The appeal cost in WEI
    */
   getAppealCost = async (
     contractAddress = isRequired('contractAddress'),
     disputeID = isRequired('disputeID'),
     extraData = "0x0"
   ) => {
     const contractInstance = this._loadContractInstance(contractAddress)

     return contractInstance.appealCost(disputeID, extraData)
   }

   /**
    * Fetch the current ruling.
    * @param {string} contractAddress - The address of the arbitrator contract.
    * @param {number} disputeID - The index of the dispute.
    * @param {stirng} extraData - Hex string representing the extra data for the dispute.
    * @returns {number} The current ruling of the dispute.
    */
   getCurrentRuling = async (
     contractAddress = isRequired('contractAddress'),
     disputeID = isRequired('disputeID'),
     extraData = "0x0"
   ) => {
     const contractInstance = this._loadContractInstance(contractAddress)

     return currentRuling.appealCost(disputeID)
   }

   /**
    * Fetch the current ruling.
    * @param {string} contractAddress - The address of the arbitrator contract.
    * @param {number} disputeID - The index of the dispute.
    * @returns {string} The status of the dispute.
    */
   getDisputeStatus = async (
     contractAddress = isRequired('contractAddress'),
     disputeID = isRequired('disputeID'),
   ) => {
     const contractInstance = this._loadContractInstance(contractAddress)

     return currentRuling.appealCost(disputeID)
   }

   /**
    * Fetch the data from the DisputeCreation event log. This includes the arbitrable contract,
    * the blockNumber, transactionHash and the createdAt timestamp.
    * @param {string} contractAddress - The address of the arbitrator contract.
    * @param {number} disputeID - The index of the dispute.
    * @return {object} Data from the dispute creation log.
    */
   getDisputeCreation = async (
     contractAddress = isRequired('contractAddress'),
     disputeID = isRequired('disputeID')
   ) => {
     const contractInstance = this._loadContractInstance(contractAddress)

     const disputeCreationLog = await EventListener.getEventLogs(
       contractInstance,
       'DisputeCreation',
       options.fromBlock || 0,
       options.toBlock || 'latest',
       { _disputeID: disputeID, ...options.filters }
     )

     if (!metaEvidenceLog[0])
       throw new Error(
         errorConstants.CONTRACT_ERROR(
           `No record of dispute creation for dispute ${disputeID}`
         )
       )

     if (metaEvidenceLog.length > 1)
       throw new Error(
         errorConstants.CONTRACT_ERROR(
           `More than one record of dispute creation for dispute ${disputeID}`
         )
       )

     const creationLog = disputeCreationLog[0]
     const createdAt = (await new Promise((resolve, reject) => {
       this.web3.eth.getBlock(creationLog.blockNumber, (error, result) => {
         if (error) reject(error)

         resolve(result)
       })
     })).timestamp

     const args = await creationLog.returnValues
     return {
       createdAt,
       arbitrableContract: args._arbitrable,
       blockNumber: creationLog.blockNumber,
       transactionHash: creationLog.transactionHash,
       logIndex: creationLog.logIndex
     }
   }

   /**
    * Fetch the data from the AppealDecision event log. This includes the arbitrable contract,
    * the blockNumber, transactionHash and the createdAt timestamp.
    * @param {string} contractAddress - The address of the arbitrator contract.
    * @param {number} disputeID - The index of the dispute.
    * @param {number} appealNumber - The number of the appeal.
    * @return {object} Data from the appeal decision log.
    */
   getAppealDecision = async (
     contractAddress = isRequired('contractAddress'),
     disputeID = isRequired('disputeID'),
     appealNumber = isRequired('appealNumber')
   ) => {
     const contractInstance = this._loadContractInstance(contractAddress)

     const appealDecisionLog = await EventListener.getEventLogs(
       contractInstance,
       'AppealDecision',
       options.fromBlock || 0,
       options.toBlock || 'latest',
       { _disputeID: disputeID, ...options.filters }
     )

     const appealLog = appealDecisionLog[appealNumber - 1]
     if (!appealLog)
       throw new Error(
         errorConstants.CONTRACT_ERROR(
           `No record of appeal number ${appealNumber} for dispute ${disputeID}`
         )
       )

     const appealedAt = (await new Promise((resolve, reject) => {
       this.web3.eth.getBlock(appealLog.blockNumber, (error, result) => {
         if (error) reject(error)

         resolve(result)
       })
     })).timestamp

     const args = await creationLog.returnValues
     return {
       appealedAt,
       arbitrableContract: args._arbitrable,
       blockNumber: creationLog.blockNumber,
       transactionHash: creationLog.transactionHash,
       logIndex: creationLog.logIndex
     }
   }
}

export default Arbitrator
