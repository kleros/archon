pragma solidity ^0.4.15;

contract TestArbitrable {
  /* EVENTS */
  event MetaEvidence(uint indexed _metaEvidenceID, string _evidence);

  event Dispute(address indexed _arbitrator, uint indexed _disputeID, uint _metaEvidenceID, uint _evidenceGroupID);

  event Evidence(address indexed _arbitrator, uint indexed _evidenceGroupID, address indexed _party, string _evidence);

  event Ruling(address indexed _arbitrator, uint indexed _disputeID, uint _ruling);

  /* EVENT EMITTERS */
  function emitMetaEvidence(uint _metaEvidenceID, string _evidence) public {
    emit MetaEvidence(_metaEvidenceID, _evidence);
  }

  function emitEvidence(address _arbitrator, uint _evidenceGroupID, address _party, string _evidence) public {
    emit Evidence(_arbitrator, _evidenceGroupID, _party, _evidence);
  }

  function emitRuling(address _arbitrator, uint _disputeID, uint _ruling) public {
    emit Ruling(_arbitrator, _disputeID, _ruling);
  }

  function emitDispute(address _arbitrator, uint _disputeID, uint _metaEvidenceID, uint _evidenceGroupID) public {
    emit Dispute(_arbitrator, _disputeID, _metaEvidenceID, _evidenceGroupID);
  }
}
