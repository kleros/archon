.. _arbitrator:

.. include:: include_announcement.rst

=================
archon.arbitrator
=================

This package provides the functionality to interact with Arbitrator contracts.
An ``Arbitrator`` contract makes rulings on disputes.

.. tip:: See `ERC 792 <https://github.com/ethereum/EIPs/issues/792>`_. for more information on ``Arbitrator`` contracts.

------------------------------------------------------------------------------

DisputeStatus
=====================

The dispute status enum used to map a ``DisputeStatus`` int to plain text status.

The enum is defined in the ``Arbitrator`` contract as follows:

.. code-block:: guess

    enum DisputeStatus {Waiting, Appealable, Solved}

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.DisputeStatus[1]
    > 'Appealable'

------------------------------------------------------------------------------

getArbitrationCost()
=====================

.. code-block:: javascript

    archon.arbitrator.getArbitrationCost(contractAddress, extraData='0x0');

Get the arbitration cost based from ``extraData``.

.. note:: The format of extraData will depend on the implementation of the Arbitrator.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrator contract.

2) ``extraData`` - ``String``: Hex string representing some bytes used by arbitrator for customization of dispute resolution.

-------
Returns
-------

``Number`` - The cost of arbitration (in WEI)

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.getArbitrationCost(
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c'
    ).then(data => {
      console.log(data)
    })
    > 150000000000000000

-----------------------------------------------------------------------------

getAppealCost()
=====================

.. code-block:: javascript

    archon.arbitrator.getAppealCost(contractAddress, disputeID, extraData='0x0');

Get the cost of an appeal for a specific dispute base on ``extraData``.

.. note:: The format of extraData will depend on the implementation of the Arbitrator.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrator contract.

2) ``disputeID`` - ``Number``: The unique identifier of the dispute.

3) ``extraData`` - ``String``: Hex string representing some bytes used by arbitrator for customization of dispute resolution.

-------
Returns
-------

``Number`` - The cost of arbitration (in WEI)

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.getAppealCost(
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c'
    ).then(data => {
      console.log(data)
    })
    > 150000000000000000

-----------------------------------------------------------------------------

getCurrentRuling()
=====================

.. code-block:: javascript

    archon.arbitrator.getCurrentRuling(contractAddress, disputeID);

Get the current ruling of a dispute.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrator contract.

2) ``disputeID`` - ``Number``: The unique identifier of the dispute.

-------
Returns
-------

``Number`` - The current ruling of the dispute.

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.getCurrentRuling(
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c',
      15
    ).then(data => {
      console.log(data)
    })
    > 2

-----------------------------------------------------------------------------

getDisputeStatus()
=====================

.. code-block:: javascript

    archon.arbitrator.getDisputeStatus(contractAddress, disputeID);

Get the status of the dispute.

.. tip:: Use archon.arbitrator.DisputeStatus to get a plain text status.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrator contract.

2) ``disputeID`` - ``Number``: The unique identifier of the dispute.

-------
Returns
-------

``Number`` - The status of a dispute

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.getDisputeStatus(
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c',
      15
    ).then(data => {
      console.log(data)
    })
    > 0

-----------------------------------------------------------------------------

getDisputeCreation()
====================

.. code-block:: javascript

    archon.arbitrator.getDisputeCreation(contractAddress, disputeID, options={})

Fetch the dispute creation event log and return data about the dispute creation.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrator contract.

2) ``disputeID`` - ``Number``: The unique identifier of the dispute.

3) ``options`` - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
fromBlock     int     The block where we start searching for event logs.
toBlock       int     The block where we will stop searching for event logs.
filters       object  Additional filters for event logs.
============  ======  ======================================================

-------
Returns
-------

``Object`` - Data from the dispute creation log.

.. code-block:: javascript

    {
      createdAt: <Number>, // epoch timestamp in seconds
      arbitrableContract: <String>,
      blockNumber: <Number>,
      transactionHash: <String>
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.getDisputeCreation(
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c',
      15
    ).then(data => {
      console.log(data)
    })
    > {
      createdAt: 1539000000,
      arbitrableContract: "0x91697c78d48e9c83b71727ddd41ccdc95bb2f012",
      blockNumber: 6459000,
      transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
    }

-----------------------------------------------------------------------------

getAppealDecision()
====================

.. code-block:: javascript

    archon.arbitrator.getAppealDecision(contractAddress, disputeID, appealNumber, options={})

Fetch the appeal decision event log and return data about the appeal.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrator contract.

2) ``disputeID`` - ``Number``: The unique identifier of the dispute.

3) ``appealNumber`` - ``Number``: The appeal number. Must be >= 1

4) ``options`` - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
fromBlock     int     The block where we start searching for event logs.
toBlock       int     The block where we will stop searching for event logs.
filters       object  Additional filters for event logs.
============  ======  ======================================================

-------
Returns
-------

``Object`` - Data from the dispute creation log.

.. code-block:: javascript

    {
      appealedAt: <Number>, // epoch timestamp in seconds
      arbitrableContract: <String>,
      blockNumber: <Number>,
      transactionHash: <String>
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrator.getAppealDecision(
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c',
      15,
      1
    ).then(data => {
      console.log(data)
    })
    > {
      appealedAt: 1539025733,
      arbitrableContract: "0x91697c78d48e9c83b71727ddd41ccdc95bb2f012",
      blockNumber: 6459276,
      transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
    }
