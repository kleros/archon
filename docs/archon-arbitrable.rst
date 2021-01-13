.. _arbitrable:

.. include:: include_announcement.rst

=================
archon.arbitrable
=================

This package provides the functionality to interact with ``Arbitrable`` smart contracts. An
arbitrable contract creates a dispute and enforces the ruling made by an arbitrator.
Arbitrable contracts are also responsible for ``Evidence`` and ``MetaEvidence``.

.. tip:: See `ERC 792 <https://github.com/ethereum/EIPs/issues/792>`_. for more information on ``Arbitrable`` contracts.


------------------------------------------------------------------------------

getEvidence()
=====================

.. code-block:: javascript

    archon.arbitrable.getEvidence(contractAddress, arbitratorAddress, evidenceGroupID, options={});

Fetch and validate evidence via the Arbitrable smart contract ``Evidence`` event logs.
For a particular dispute.

.. tip:: See `ERC 1497 <https://github.com/ethereum/EIPs/issues/1497>`_. for the ``EvidenceJSON`` spec and information on how to correctly use the events with hashes

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrable contract.

2) ``arbitratorAddress`` - ``String``: The address of the arbitrator contract.

3) ``evidenceGroupID`` - ``Number``: The evidence group ID.

4) ``options`` - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
strictHashes  bool    If true, an error will throw if hash validations fail.
customHashFn  fn      Hashing function that should be used to validate the hashes.
fromBlock     int     The block where we start searching for event logs.
toBlock       int     The block where we will stop searching for event logs.
filters       object  Additional filters for event logs.
============  ======  ======================================================

.. tip:: Use :ref:`getDispute <getDispute>` to get the evidenceGroupID for a dispute.

-------
Returns
-------

``Promise.<Object[]>`` - A Promise resolving to an array of objects containing the ``EvidenceJSON``,
the validity of the ``JSON`` and evidence file, and submission information.


.. code-block:: javascript

    {
      evidenceJSONValid: <Bool>, // validity of evidenceJSON
      fileValid: <Bool>, // validity of evidence found at evidenceJSON.fileURI
      evidenceJSON: <Object>,
      submittedBy: <String>, // from event log
      submittedAt: <Number>, // epoch timestamp in seconds
      blockNumber: <Number>,
      transactionHash: <String> // The hash of the submission transaction
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrable.getEvidence(
      "0x91697c78d48e9c83b71727ddd41ccdc95bb2f012", // arbitrable contract address
      "0x211f01e59b425253c0a0e9a7bf612605b42ce82c", // arbitrator contract address
      1, // dispute ID
      {
        strictHashes: true
      }
    ).then(data => {
      console.log(data)
    })

    > [{
        evidenceJSONValid: true,
        fileValid: true,
        evidenceJSON: {"fileURI": "/ipfs/...", ...},
        submittedBy: "0x8254175f6a6E0FE1f63e0eeb0ae487cCf3950BFb",
        submittedAt: 1539022733,
        blockNumber: 6503576,
        transactionHash: "0xe91603b9d4bf506972820f499bf221cdfb48cbfd426125af5ab647dca39a3f4e"
      },
      {
        evidenceJSONValid: true,
        fileValid: true,
        evidenceJSON: {"fileURI": "/ipfs/...", ...},
        submittedBy: "0xc55a13e36d93371a5b036a21d913a31CD2804ba4",
        submittedAt: 1539025000,
        blockNumber: 6503570,
        transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
      }]

-----------------------------------------------------------------------------

getMetaEvidence()
=====================

.. code-block:: javascript

    archon.arbitrable.getMetaEvidence(contractAddress, metaEvidenceID, options={});

Fetch and validate MetaEvidence via the Arbitrable smart contract ``MetaEvidence`` event logs.
There are up to 3 hashes validated. The hash of the ``MetaEvidenceJSON``, the hash of the
primary document file specified at ``MetaEvidenceJSON.fileURI``, and the hash of the
external interface used to render the evidence found at ``MetaEvidenceJSON.evidenceDisplayInterfaceURL``.

.. tip:: See `ERC 1497 <https://github.com/ethereum/EIPs/issues/1497>`_. for the ``MetaEvidenceJSON`` spec and information on how to correctly use the events with hashes

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrable contract.

2) ``metaEvidenceID`` - ``Number|String``: The unique identifier of the MetaEvidence event log.

3) ``options`` - ``Object``: Optional parameters.

The options parameter can include:

================  ======  ======================================================
Key               Type    Description
================  ======  ======================================================
strictHashes      bool    If true, an error will throw if hash validations fail.
customHashFn      fn      Hashing function that should be used to validate the hashes.
fromBlock         int     The block where we start searching for event logs.
toBlock           int     The block where we will stop searching for event logs.
filters           object  Additional filters for event logs.
scriptParameters  object  Parameters to pass to sandboxed script.
================  ======  ======================================================

.. tip:: Use :ref:`getDispute <getDispute>` to get the metaEvidenceID for a dispute.

.. note:: If more than one MetaEvidence exists for the given metaEvidenceID, only the first submitted metaEvidence will be returned.

.. tip:: See :ref:`MetaEvidece Scripts <metaEvidenceScripts>` for detailed description on creating scripts compatible with Archon.

-------
Returns
-------

``Promise.<Object>`` - Promise resolving to an object containing the ``MetaEvidenceJSON`` and the validity of the the hashes

.. code-block:: javascript

    {
      metaEvidenceValid: <Bool>,
      fileValid: <Bool>,
      interfaceValid: <Bool>,
      metaEvidenceJSON: <Object>,
      submittedAt: <Number>,
      blockNumber: <Number>,
      transactionHash: <String>
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrable.getMetaEvidence(
      '0x91697c78d48e9c83b71727ddd41ccdc95bb2f012',
      1,
      {
        strictHashes: false
      }
    ).then(data => {
      console.log(data)
    })

    > {
        metaEvidenceValid: true,
        fileValid: true,
        interfaceValid: false,
        metaEvidenceJSON: {"fileURI": "/ipfs/...", ...},
        submittedAt: 1539025000,
        blockNumber: 6503570,
        transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
      }

-----------------------------------------------------------------------------

getRuling()
=====================

.. code-block:: javascript

    archon.arbitrable.getRuling(contractAddress, arbitratorAddress, disputeID, options={});

Fetch data from the ``Ruling`` event log.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrable contract.

2) ``arbitratorAddress`` - ``String``: The address of the arbitrator contract.

3) ``disputeID`` - ``Number``: The unique identifier of the dispute.

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

``Promise.<Object>`` - A Promise resolving to data from the ruling event log, including the final ruling.

.. code-block:: javascript

    {
      ruling: <String>, // The ruling returned as a number string
      ruledAt: <Number>, // epoch timestamp in seconds
      blockNumber: <Number>,
      transactionHash: <String> // The hash of the submission transaction
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrable.getRuling(
      '0x91697c78d48e9c83b71727ddd41ccdc95bb2f012',
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c',
      1
    ).then(data => {
      console.log(data)
    })

    > {
      ruling: "1",
      ruledAt: 1539025000,
      blockNumber: 6503570,
      transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
    }

-----------------------------------------------------------------------------

.. _getDispute:

getDispute()
============

.. code-block:: javascript

    archon.arbitrable.getDispute(contractAddress, arbitratorAddress, disputeID, options={});

Fetch the dispute creation event. This event is used to link ``metaEvidenceID`` to a dispute.

----------
Parameters
----------

1) ``contractAddress`` - ``String``: The address of the arbitrable contract.

2) ``arbitratorAddress`` - ``String``: The address of the arbitrator contract.

3) ``disputeID`` - ``Number``: The unique identifier of the dispute.

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

``Promise.<Object>`` - A Promise resolving to data from the dispute event log including the ``metaEvidenceID``

.. code-block:: javascript

      {
        metaEvidenceID: <String>,
        evidenceGroupID: <String>,
        createdAt: <Number>,
        blockNumber: <Number>,
        transactionHash: <String>
      }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrable.getDispute(
      '0x91697c78d48e9c83b71727ddd41ccdc95bb2f012',
      '0x211f01e59b425253c0a0e9a7bf612605b42ce82c',
      1
    ).then(data => {
      console.log(data)
    })

    > {
      metaEvidenceID: "0",
      evidenceGroupID: "3",
      createdAt: 1539025000,
      blockNumber: 6503570,
      transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
    }
