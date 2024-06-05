import ArbitrableJSONInterface from "../abis/arbitrable";

import * as errorConstants from "../constants/error";
import EventListener from "../utils/EventListener";
import fetchDataFromScript from "../utils/frame-loader";
import isRequired from "../utils/isRequired";
import { validateFileFromURI } from "../utils/hashing";
import { getHttpUri } from "../utils/uri";
import { sanitizeMetaEvidence } from "../utils/sanitize";

import StandardContract from "./StandardContract";

// Polyfill to support Promise.allSettled with node < 12
Promise.allSettled =
  Promise.allSettled ||
  ((promises) =>
    Promise.all(
      promises.map((p) =>
        p
          .then((v) => ({
            status: "fulfilled",
            value: v,
          }))
          .catch((e) => ({
            status: "rejected",
            reason: e,
          }))
      )
    ));

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
  _loadContractInstance = (contractAddress) => {
    return new this.web3.eth.Contract(ArbitrableJSONInterface.abi, contractAddress);
  };

  /**
   * Fetch all Evidence submitted to the contract.
   * @param {string} contractAddress - The address of the arbitrable contract.
   * @param {string} arbitratorAddress - The address of the arbitrator contract.
   * @param {number} evidenceGroupID - The index of the evidence group.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, filters, strict
   * @returns {object[]} An array of evidence objects
   */
  getEvidence = async (
    contractAddress = isRequired("contractAddress"),
    arbitratorAddress = isRequired("arbitratorAddress"),
    evidenceGroupID = isRequired("evidenceGroupID"),
    options = {}
  ) => {
    const strict = options.strict || options.strictHashes;

    const contractInstance = this._loadContractInstance(contractAddress);

    const evidenceLogs = await EventListener.getEventLogs(
      contractInstance,
      "Evidence",
      options.fromBlock || 0,
      options.toBlock || "latest",
      {
        _arbitrator: arbitratorAddress,
        _evidenceGroupID: evidenceGroupID.toString(),
        ...options.filters,
      }
    );

    if (evidenceLogs.length === 0) return [];

    return (
      await Promise.allSettled(
        evidenceLogs.map(async (evidenceLog) => {
          const args = await evidenceLog.returnValues;
          const { uri: evidenceURI, preValidated } = getHttpUri(args._evidence, this.ipfsGateway);

          const { file: evidenceJSON, isValid: evidenceJSONValid } = await validateFileFromURI(evidenceURI, {
            preValidated,
            strict,
            customHashFn: options.customHashFn,
          });

          let fileValid = false;

          try {
            if (evidenceJSON.fileURI) {
              const { uri: evidenceURI, preValidated } = getHttpUri(evidenceJSON.fileURI, this.ipfsGateway);

              fileValid = (
                await validateFileFromURI(evidenceURI, {
                  preValidated,
                  strict,
                  hash: evidenceJSON.fileHash,
                  customHashFn: options.customHashFn,
                })
              ).isValid;
            }
          } catch (err) {
            if (strict) {
              throw new Error(err);
            }

            console.warn("Invalid evidence file:", err);
          }

          const submittedAt = (
            await new Promise((resolve, reject) => {
              this.web3.eth.getBlock(evidenceLog.blockNumber, (error, result) => {
                if (error) reject(error);

                resolve(result);
              });
            })
          ).timestamp;

          return {
            evidenceJSONValid,
            fileValid,
            evidenceJSON,
            submittedAt,
            submittedBy: args._party,
            blockNumber: evidenceLog.blockNumber,
            transactionHash: evidenceLog.transactionHash,
          };
        })
      )
    ).map((r) => (r.value ? r.value : r));
  };

  getSubgraph = (chainID) => {
    switch (chainID) {
      case 1:
        return "https://api.studio.thegraph.com/query/61738/kleros-display-mainnet/version/latest";
      case 100:
        return "https://api.studio.thegraph.com/query/61738/kleros-display-gnosis/version/latest";
      case 11155111:
        return "https://api.studio.thegraph.com/query/61738/kleros-display-sepolia/version/latest";
      default:
        return null;
    }
  };

  /**
   * Fetch all Evidence submitted to the contract.
   * @param {number} disputeID - The id of the dispute.
   * @param {number} chainID - The id of the chain.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, filters, strict
   * @returns {object[]} An array of evidence objects
   */
  getEvidenceFromDisputeID = async (
    disputeID = isRequired("disputeID"),
    chainID = isRequired("chainID"),
    options = {}
  ) => {
    const strict = options.strict || options.strictHashes;

    const subgraph = this.getSubgraph(chainID);

    const query = {
      query: `{
        disputes(first: 1, where: {id: "${disputeID}"}) {
          evidenceGroup {
            evidence {
              URI
              sender
              creationTime
            }
          }
        }
      }`,
    };
    const dispute = (await (await fetch(subgraph, { method: "POST", 
                                                    body: JSON.stringify(query),
                                                    headers: {
                                                      'Content-Type': 'application/json',
                                                    }, })).json())?.data?.disputes;
    return (
      await Promise.allSettled(
        dispute[0]?.evidenceGroup?.evidence.map(async (evidence) => {
          const { uri: evidenceURI, preValidated } = getHttpUri(evidence.URI, this.ipfsGateway);

          const { file: evidenceJSON, isValid: evidenceJSONValid } = await validateFileFromURI(evidenceURI, {
            preValidated,
            strict,
            customHashFn: options.customHashFn,
          });

          let fileValid = false;

          try {
            if (evidenceJSON.fileURI) {
              const { uri: evidenceURI, preValidated } = getHttpUri(evidenceJSON.fileURI, this.ipfsGateway);

              fileValid = (
                await validateFileFromURI(evidenceURI, {
                  preValidated,
                  strict,
                  hash: evidenceJSON.fileHash,
                  customHashFn: options.customHashFn,
                })
              ).isValid;
            }
          } catch (err) {
            if (strict) {
              throw new Error(err);
            }

            console.warn("Invalid evidence file:", err);
          }

          return {
            evidenceJSONValid,
            fileValid,
            evidenceJSON,
            submittedAt: parseInt(evidence.creationTime),
            submittedBy: evidence.sender,
          };
        })
      )
    ).map((r) => (r.value ? r.value : r));
  };

  /**
   * Get the MetaEvidence object for a metaEvidenceID. Hashes will be validated.
   * By default MetaEvidence will be returned regardless of the validity of the hashes
   * with an indicator on whether the hash was valid or not. To throw an error instead,
   * use strict = true in options object.
   * NOTE: If more than one MetaEvidence with the same metaEvidenceID is found it will return the 1st one.
   * @param {string} contractAddress - The address of the Arbitrable contract.
   * @param {number} disputeID - The identifier of the metaEvidence log.
   * @param {number} chainID - The identifier of the metaEvidence log.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, strict, getJsonRpcUrl
   * @returns {object} The metaEvidence object
   */
  async getMetaEvidenceFromDisputeID(
    contractAddress = isRequired("contractAddress"),
    disputeID = isRequired("disputeID"),
    chainID = isRequired("chainID"),
    options = {}
  ) {
    const { getJsonRpcUrl = () => {} } = options;
    const strict = options.strict || options.strictHashes;

    const resp = await (
      await fetch(
        `https://kleros-api.netlify.app/.netlify/functions/get-dispute-metaevidence?chainId=${chainID}&disputeId=${disputeID}`
      )
    ).json();

    const metaEvidenceURI = resp.metaEvidenceUri;

    if (!metaEvidenceURI)
      throw new Error(
        errorConstants.CONTRACT_ERROR(`No MetaEvidence log for ${contractAddress} with disputeID ${disputeID}`)
      );

    const { uri: metaEvidenceUri, preValidated } = getHttpUri(metaEvidenceURI, this.ipfsGateway);

    const { file: _metaEvidenceJSON, isValid: metaEvidenceJSONValid } = await validateFileFromURI(metaEvidenceUri, {
      preValidated,
      strict,
      customHashFn: options.customHashFn,
    });

    // we want it to be a dynamic variable so we can edit via script if neccesary
    let metaEvidenceJSON = sanitizeMetaEvidence(_metaEvidenceJSON);

    // make updates to metaEvidence from script
    let scriptValid = false;
    try {
      if (metaEvidenceJSON.dynamicScriptURI) {
        const scriptParameters = options.scriptParameters || {};

        if (scriptParameters.disputeID === "302" || scriptParameters.disputeID === "532") {
          // Need to update web3 for Firefox. Trusted hack for the short term
          scriptValid = true;
          metaEvidenceJSON = {
            ...metaEvidenceJSON,
            ...{
              rulingOptions: {
                type: "single-select",
                titles: ["Yes", "No"],
              },
            },
          };
        } else {
          const { uri: scriptURI, preValidated } = getHttpUri(metaEvidenceJSON.dynamicScriptURI, this.ipfsGateway);

          const script = await validateFileFromURI(scriptURI, {
            preValidated,
            strict,
            hash: metaEvidenceJSON.dynamicScriptHash,
            customHashFn: options.customHashFn,
          });

          scriptValid = script.isValid;

          const fileParameters = {
            arbitratorChainID: metaEvidenceJSON.arbitratorChainID,
            arbitrableChainID: metaEvidenceJSON.arbitrableChainID,
          };

          if (
            fileParameters.arbitrableChainID !== undefined &&
            scriptParameters.arbitrableChainID !== undefined &&
            Number(fileParameters.arbitrableChainID) !== Number(scriptParameters.arbitrableChainID)
          ) {
            throw new Error(
              `MetaEvidence requires 'arbitrableChainID' to be ${fileParameters.arbitrableChainID}, but ${scriptParameters.arbitrableChainID} was given`
            );
          }

          if (
            fileParameters.arbitratorChainID !== undefined &&
            scriptParameters.arbitratorChainID !== undefined &&
            Number(fileParameters.arbitratorChainID) !== Number(scriptParameters.arbitratorChainID)
          ) {
            throw new Error(
              `MetaEvidence requires 'arbitratorChainID' to be ${fileParameters.arbitratorChainID}, but ${scriptParameters.arbitratorChainID} was given.`
            );
          }

          const injectedParameters = {
            ...fileParameters,
            ...scriptParameters,
          };

          injectedParameters.arbitrableContractAddress =
            injectedParameters.arbitrableContractAddress || contractAddress;
          injectedParameters.arbitratorJsonRpcUrl =
            injectedParameters.arbitratorJsonRpcUrl || getJsonRpcUrl(injectedParameters.arbitratorChainID);
          injectedParameters.arbitrableChainID =
            injectedParameters.arbitrableChainID || injectedParameters.arbitratorChainID;
          injectedParameters.arbitrableJsonRpcUrl =
            injectedParameters.arbitrableJsonRpcUrl || getJsonRpcUrl(injectedParameters.arbitrableChainID);

          if (
            injectedParameters.arbitratorChainID !== undefined &&
            injectedParameters.arbitratorJsonRpcUrl === undefined
          ) {
            console.warn(
              `Could not obtain a valid 'arbitratorJsonRpcUrl' for chain ID ${injectedParameters.arbitratorChainID} on the Arbitrator side.
You should either provide it directly or provide a 'options.getJsonRpcUrl(chainID: number) => string' callback.`
            );
          }

          if (
            injectedParameters.arbitrableChainID !== undefined &&
            injectedParameters.arbitrableJsonRpcUrl === undefined
          ) {
            console.warn(
              `Could not obtain a valid 'arbitrableJsonRpcUrl' for chain ID ${injectedParameters.arbitrableChainID} on the Arbitrable side.
You should either provide it directly or provide a 'options.getJsonRpcUrl(chainID: number) => string' callback.`
            );
          }

          const metaEvidenceEdits = await fetchDataFromScript(script.file, injectedParameters);

          metaEvidenceJSON = {
            ...metaEvidenceJSON,
            ...metaEvidenceEdits,
          };
        }
      }
    } catch (err) {
      if (strict) {
        throw new Error(err);
      }

      // if we get an error in the execution the script is invalid
      console.warn("Invalid MetaEvidence file:", err);
      scriptValid = false;
    }

    let fileValid = false;
    try {
      // validate file hash
      if (metaEvidenceJSON.fileURI) {
        const { uri: fileURI, preValidated } = getHttpUri(metaEvidenceJSON.fileURI, this.ipfsGateway);
        fileValid = (
          await validateFileFromURI(fileURI, {
            preValidated,
            strict,
            hash: metaEvidenceJSON.fileHash,
            customHashFn: options.customHashFn,
          })
        ).isValid;
      }
    } catch (err) {
      if (strict) {
        throw new Error(err);
      }

      console.warn("Invalid fileURI:", err);
    }

    // validate file hash
    let interfaceValid = false;
    // allow for both so not to break previous versions from standard
    const evidenceDisplayURI = metaEvidenceJSON.evidenceDisplayInterfaceURI;
    try {
      if (evidenceDisplayURI) {
        const { uri: disputeInterfaceURI, preValidated } = getHttpUri(evidenceDisplayURI, this.ipfsGateway);
        if (preValidated) interfaceValid = true;
        else
          interfaceValid = (
            await validateFileFromURI(disputeInterfaceURI, {
              strict,
              hash: metaEvidenceJSON.evidenceDisplayInterfaceHash,
              customHashFn: options.customHashFn,
            })
          ).isValid;
      }
    } catch (err) {
      if (strict) {
        throw new Error(err);
      }

      console.warn("Invalid evidenceDisplayURI:", err);
    }

    return {
      metaEvidenceJSON,
      metaEvidenceJSONValid,
      fileValid,
      interfaceValid,
      scriptValid,
    };
  }

  /**
   * Get the MetaEvidence object for a metaEvidenceID. Hashes will be validated.
   * By default MetaEvidence will be returned regardless of the validity of the hashes
   * with an indicator on whether the hash was valid or not. To throw an error instead,
   * use strict = true in options object.
   * NOTE: If more than one MetaEvidence with the same metaEvidenceID is found it will return the 1st one.
   * @param {string} contractAddress - The address of the Arbitrable contract.
   * @param {number} metaEvidenceID - The identifier of the metaEvidence log.
   * @param {object} options - Additional paramaters. Includes fromBlock, toBlock, strict, getJsonRpcUrl
   * @returns {object} The metaEvidence object
   */
  async getMetaEvidence(
    contractAddress = isRequired("contractAddress"),
    metaEvidenceID = isRequired("metaEvidenceID"),
    options = {}
  ) {
    const { getJsonRpcUrl = () => {} } = options;
    const strict = options.strict || options.strictHashes;
    const contractInstance = this._loadContractInstance(contractAddress);

    const metaEvidenceLogs = await EventListener.getEventLogs(
      contractInstance,
      "MetaEvidence",
      options.fromBlock || 0,
      options.toBlock || "latest",
      { _metaEvidenceID: metaEvidenceID.toString(), ...options.filters }
    );

    if (!metaEvidenceLogs[0])
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `No MetaEvidence log for ${contractAddress} with metaEvidenceID ${metaEvidenceID}`
        )
      );

    const metaEvidenceLog = metaEvidenceLogs[0];
    const args = await metaEvidenceLog.returnValues;

    const { uri: metaEvidenceUri, preValidated } = getHttpUri(args._evidence, this.ipfsGateway);

    const { file: _metaEvidenceJSON, isValid: metaEvidenceJSONValid } = await validateFileFromURI(metaEvidenceUri, {
      preValidated,
      strict,
      customHashFn: options.customHashFn,
    });

    // we want it to be a dynamic variable so we can edit via script if neccesary
    let metaEvidenceJSON = sanitizeMetaEvidence(_metaEvidenceJSON);

    // make updates to metaEvidence from script
    let scriptValid = false;
    try {
      if (metaEvidenceJSON.dynamicScriptURI) {
        const scriptParameters = options.scriptParameters || {};

        if (scriptParameters.disputeID === "302" || scriptParameters.disputeID === "532") {
          // Need to update web3 for Firefox. Trusted hack for the short term
          scriptValid = true;
          metaEvidenceJSON = {
            ...metaEvidenceJSON,
            ...{
              rulingOptions: {
                type: "single-select",
                titles: ["Yes", "No"],
              },
            },
          };
        } else {
          const { uri: scriptURI, preValidated } = getHttpUri(metaEvidenceJSON.dynamicScriptURI, this.ipfsGateway);

          const script = await validateFileFromURI(scriptURI, {
            preValidated,
            strict,
            hash: metaEvidenceJSON.dynamicScriptHash,
            customHashFn: options.customHashFn,
          });

          scriptValid = script.isValid;

          const fileParameters = {
            arbitratorChainID: metaEvidenceJSON.arbitratorChainID,
            arbitrableChainID: metaEvidenceJSON.arbitrableChainID,
          };

          if (
            fileParameters.arbitrableChainID !== undefined &&
            scriptParameters.arbitrableChainID !== undefined &&
            Number(fileParameters.arbitrableChainID) !== Number(scriptParameters.arbitrableChainID)
          ) {
            throw new Error(
              `MetaEvidence requires 'arbitrableChainID' to be ${fileParameters.arbitrableChainID}, but ${scriptParameters.arbitrableChainID} was given`
            );
          }

          if (
            fileParameters.arbitratorChainID !== undefined &&
            scriptParameters.arbitratorChainID !== undefined &&
            Number(fileParameters.arbitratorChainID) !== Number(scriptParameters.arbitratorChainID)
          ) {
            throw new Error(
              `MetaEvidence requires 'arbitratorChainID' to be ${fileParameters.arbitratorChainID}, but ${scriptParameters.arbitratorChainID} was given.`
            );
          }

          const injectedParameters = {
            ...fileParameters,
            ...scriptParameters,
          };

          injectedParameters.arbitrableContractAddress =
            injectedParameters.arbitrableContractAddress || contractAddress;
          injectedParameters.arbitratorJsonRpcUrl =
            injectedParameters.arbitratorJsonRpcUrl || getJsonRpcUrl(injectedParameters.arbitratorChainID);
          injectedParameters.arbitrableChainID =
            injectedParameters.arbitrableChainID || injectedParameters.arbitratorChainID;
          injectedParameters.arbitrableJsonRpcUrl =
            injectedParameters.arbitrableJsonRpcUrl || getJsonRpcUrl(injectedParameters.arbitrableChainID);

          if (
            injectedParameters.arbitratorChainID !== undefined &&
            injectedParameters.arbitratorJsonRpcUrl === undefined
          ) {
            console.warn(
              `Could not obtain a valid 'arbitratorJsonRpcUrl' for chain ID ${injectedParameters.arbitratorChainID} on the Arbitrator side.
You should either provide it directly or provide a 'options.getJsonRpcUrl(chainID: number) => string' callback.`
            );
          }

          if (
            injectedParameters.arbitrableChainID !== undefined &&
            injectedParameters.arbitrableJsonRpcUrl === undefined
          ) {
            console.warn(
              `Could not obtain a valid 'arbitrableJsonRpcUrl' for chain ID ${injectedParameters.arbitrableChainID} on the Arbitrable side.
You should either provide it directly or provide a 'options.getJsonRpcUrl(chainID: number) => string' callback.`
            );
          }

          const metaEvidenceEdits = await fetchDataFromScript(script.file, injectedParameters);

          metaEvidenceJSON = {
            ...metaEvidenceJSON,
            ...metaEvidenceEdits,
          };
        }
      }
    } catch (err) {
      if (strict) {
        throw new Error(err);
      }

      // if we get an error in the execution the script is invalid
      console.warn("Invalid MetaEvidence file:", err);
      scriptValid = false;
    }

    let fileValid = false;
    try {
      // validate file hash
      if (metaEvidenceJSON.fileURI) {
        const { uri: fileURI, preValidated } = getHttpUri(metaEvidenceJSON.fileURI, this.ipfsGateway);
        fileValid = (
          await validateFileFromURI(fileURI, {
            preValidated,
            strict,
            hash: metaEvidenceJSON.fileHash,
            customHashFn: options.customHashFn,
          })
        ).isValid;
      }
    } catch (err) {
      if (strict) {
        throw new Error(err);
      }

      console.warn("Invalid fileURI:", err);
    }

    // validate file hash
    let interfaceValid = false;
    // allow for both so not to break previous versions from standard
    const evidenceDisplayURI = metaEvidenceJSON.evidenceDisplayInterfaceURI;
    try {
      if (evidenceDisplayURI) {
        const { uri: disputeInterfaceURI, preValidated } = getHttpUri(evidenceDisplayURI, this.ipfsGateway);
        if (preValidated) interfaceValid = true;
        else
          interfaceValid = (
            await validateFileFromURI(disputeInterfaceURI, {
              strict,
              hash: metaEvidenceJSON.evidenceDisplayInterfaceHash,
              customHashFn: options.customHashFn,
            })
          ).isValid;
      }
    } catch (err) {
      if (strict) {
        throw new Error(err);
      }

      console.warn("Invalid evidenceDisplayURI:", err);
    }

    return {
      metaEvidenceJSON,
      metaEvidenceJSONValid,
      fileValid,
      interfaceValid,
      scriptValid,
      blockNumber: metaEvidenceLog.blockNumber,
      transactionHash: metaEvidenceLog.transactionHash,
    };
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
    contractAddress = isRequired("contractAddress"),
    arbitratorAddress = isRequired("arbitratorAddress"),
    disputeID = isRequired("disputeID"),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress);

    const rulingLogs = await EventListener.getEventLogs(
      contractInstance,
      "Ruling",
      options.fromBlock || 0,
      options.toBlock || "latest",
      {
        _arbitrator: arbitratorAddress,
        _disputeID: disputeID.toString(),
        ...options.filters,
      }
    );

    if (rulingLogs.length === 0)
      throw new Error(
        errorConstants.CONTRACT_ERROR(`There is no ruling for dispute ${disputeID} in arbitrator ${arbitratorAddress}`)
      );
    else if (rulingLogs.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `There is more than one ruling for dispute ${disputeID} in arbitrator ${arbitratorAddress}`
        )
      );

    const rulingLog = rulingLogs[0];
    const args = await rulingLog.returnValues;

    const ruledAt = (
      await new Promise((resolve, reject) => {
        this.web3.eth.getBlock(rulingLog.blockNumber, (error, result) => {
          if (error) reject(error);

          resolve(result);
        });
      })
    ).timestamp;

    return {
      ruling: args._ruling,
      ruledAt,
      blockNumber: rulingLog.blockNumber,
      transactionHash: rulingLog.transactionHash,
    };
  };

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
    contractAddress = isRequired("contractAddress"),
    arbitratorAddress = isRequired("arbitratorAddress"),
    disputeID = isRequired("isRequired"),
    options = {}
  ) => {
    const contractInstance = this._loadContractInstance(contractAddress);

    const disputeLogs = await EventListener.getEventLogs(
      contractInstance,
      "Dispute",
      options.fromBlock || 0,
      options.toBlock || "latest",
      {
        _arbitrator: arbitratorAddress,
        _disputeID: disputeID.toString(),
        ...options.filters,
      }
    );

    if (disputeLogs.length === 0)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `No Dispute log for ${contractAddress} with arbitrator ${arbitratorAddress} and disputeID ${disputeID}`
        )
      );

    if (disputeLogs.length > 1)
      throw new Error(
        errorConstants.CONTRACT_ERROR(
          `More than one Dispute returned for arbitrator ${arbitratorAddress} and disputeID ${disputeID}`
        )
      );

    const disputeLog = disputeLogs[0];
    const args = await disputeLog.returnValues;
    const createdAt = (
      await new Promise((resolve, reject) => {
        this.web3.eth.getBlock(disputeLog.blockNumber, (error, result) => {
          if (error) reject(error);

          resolve(result);
        });
      })
    ).timestamp;

    return {
      metaEvidenceID: args._metaEvidenceID,
      evidenceGroupID: args._evidenceGroupID,
      createdAt,
      blockNumber: disputeLog.blockNumber,
      transactionHash: disputeLog.transactionHash,
    };
  };
}

export default Arbitrable;
