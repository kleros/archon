pragma solidity ^0.4.15;

contract TestArbitrable {

  event MetaEvidence(uint indexed _metaEvidenceID, string _evidence);

  /** @dev To be emmited when a dispute is created to link the correct meta-evidence to the disputeID
   *  @param _arbitrator The arbitrator of the contract.
   *  @param _disputeID ID of the dispute in the Arbitrator contract.
   *  @param _metaEvidenceID Unique identifier of meta-evidence.
   */
  event Dispute(address indexed _arbitrator, uint indexed _disputeID, uint _metaEvidenceID);

  /** @dev To be raised when evidence are submitted. Should point to the ressource (evidences are not to be stored on chain due to gas considerations).
   *  @param _arbitrator The arbitrator of the contract.
   *  @param _disputeID ID of the dispute in the Arbitrator contract.
   *  @param _party The address of the party submiting the evidence. Note that 0x0 refers to evidence not submitted by any party.
   *  @param _evidence A URI to the evidence JSON file whose name should be its keccak256 hash followed by .json.
   */
  event Evidence(address indexed _arbitrator, uint indexed _disputeID, address _party, string _evidence);

  function emitMetaEvidence(uint _metaEvidenceID, string _evidence) public {
    emit MetaEvidence(_metaEvidenceID, _evidence);
  }
}
