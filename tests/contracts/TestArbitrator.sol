pragma solidity ^0.4.15;

contract TestArbitrator {
  enum DisputeStatus {Waiting, Appealable, Solved}

  /* TEST VARS */
  uint _arbitrationCost;
  DisputeStatus _status;
  uint _appealCost;
  uint _ruling;

  /* TEST SETTERS */
  function setArbitrationCost(uint cost) {
    _arbitrationCost = cost;
  }

  function setDisputeStatus(DisputeStatus status) {
    _status = status;
  }

  function setAppealCost(uint cost) {
    _appealCost = cost;
  }

  function setCurrentRuling(uint ruling) {
    _ruling = ruling;
  }

  /* ARBITRATOR */

  /** @dev Compute the cost of arbitration. It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
   *  @param _extraData Can be used to give additional info on the dispute to be created.
   *  @return fee Amount to be paid.
   */
  function arbitrationCost(bytes _extraData) public constant returns(uint fee) {
    fee = _arbitrationCost;
  }

  /** @dev Compute the cost of appeal. It is recommended not to increase it often, as it can be higly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
   *  @param _disputeID ID of the dispute to be appealed.
   *  @param _extraData Can be used to give additional info on the dispute to be created.
   *  @return fee Amount to be paid.
   */
  function appealCost(uint _disputeID, bytes _extraData) public constant returns(uint fee) {
    fee = _appealCost;
  }

  /** @dev Return the status of a dispute.
   *  @param _disputeID ID of the dispute to rule.
   *  @return status The status of the dispute.
   */
  function disputeStatus(uint _disputeID) public constant returns(DisputeStatus status) {
    status = _status;
  }

  /** @dev Return the current ruling of a dispute. This is useful for parties to know if they should appeal.
   *  @param _disputeID ID of the dispute.
   *  @return ruling The ruling which has been given or the one which will be given if there is no appeal.
   */
  function currentRuling(uint _disputeID) public constant returns(uint ruling) {
    ruling = _ruling;
  }

  /* EVENTS */

  /** @dev To be raised when a dispute can be appealed.
   *  @param _disputeID ID of the dispute.
   */
  event AppealPossible(uint indexed _disputeID, address indexed _arbitrable);

  /** @dev To be raised when a dispute is created.
   *  @param _disputeID ID of the dispute.
   *  @param _arbitrable The contract which created the dispute.
   */
  event DisputeCreation(uint indexed _disputeID, address indexed _arbitrable);

  /** @dev To be raised when the current ruling is appealed.
   *  @param _disputeID ID of the dispute.
   *  @param _arbitrable The contract which created the dispute.
   */
  event AppealDecision(uint indexed _disputeID, address indexed _arbitrable);

  /* TEST EMITTERS */

  function emitAppealPossible(uint _disputeID, address _arbitrable) public {
    emit AppealPossible(_disputeID, _arbitrable);
  }

  function emitDisputeCreation(uint _disputeID, address _arbitrable) public {
    emit DisputeCreation(_disputeID, _arbitrable);
  }

  function emitAppealDecision(uint _disputeID, address _arbitrable) public {
    emit AppealDecision(_disputeID, _arbitrable);
  }
}
