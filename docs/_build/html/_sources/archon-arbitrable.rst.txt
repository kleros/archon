.. _arbitrable:

.. include:: include_announcement.rst

=================
archon.arbitrable
=================

This package provides the functionality to interact with Arbitrable contracts.

------------------------------------------------------------------------------

getEvidence()
=====================

.. code-block:: javascript

    archon.arbitrable.getEvidence(contractAddress, options={});

Fetch and validate evidence via the Arbitrable smart contract ``Evidence`` event logs.

.. tip:: See ERC ___ for the ``EvidenceJSON`` spec and information on how to correctly use the events with hashes <link>

----------
Parameters
----------

:contractAddress: - ``String``: The address of the arbitrable contract.
:options: - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
strictHashes  bool    If true, an error will throw if hash validations fail.
fromBlock     int     The block where we start searching for event logs.
toBlock       int     The block where we will stop searching for event logs.
filters       object  Additional filters for event logs.
============  ======  ======================================================

-------
Returns
-------

``Object[]`` - An array of objects containing the ``EvidenceJSON``,
the validity of the ``JSON`` and evidence file, and submission information.


.. code-block:: javascript

    {
      evidenceValid: <Bool>, // validity of evidenceJSON
      fileValid: <Bool>, // validity of evidence found at evidenceJSON.fileURI
      evidenceJSON: <Object>,
      submittedBy: <String>,
      submittedAt: <Number> // epoch timestamp in seconds
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrable.getEvidence(
      '0x91697c78d48e9c83b71727ddd41ccdc95bb2f012',
      {
        strictHashes: true
      }
    ).then(data => {
      console.log(data)
    })
    > [{
        evidenceValid: true,
        fileValid: true,
        evidenceJSON: {"fileURI": "/ipfs/...", ...},
        submittedBy: '0x8254175f6a6E0FE1f63e0eeb0ae487cCf3950BFb',
        submittedAt: 1539022733
      },
      {
        evidenceValid: true,
        fileValid: true,
        evidenceJSON: {"fileURI": "/ipfs/...", ...},
        submittedBy: '0xc55a13e36d93371a5b036a21d913a31CD2804ba4',
        submittedAt: 1539025000
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

.. tip:: See ERC ___ for the ``MetaEvidenceJSON`` spec and information on how to correctly use the events with hashes <link>

----------
Parameters
----------

:contractAddress: - ``String``: The address of the arbitrable contract.
:metaEvidenceID: - ``Number``: The unique identifier of the MetaEvidence event log.
:options: - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
strictHashes  bool    If true, an error will throw if hash validations fail.
fromBlock     int     The block where we start searching for event logs.
toBlock       int     The block where we will stop searching for event logs.
filters       object  Additional filters for event logs.
============  ======  ======================================================

-------
Returns
-------

``Object`` - An objects containing the ``MetaEvidenceJSON`` and the validity of the the hashes

.. code-block:: javascript

    {
      metaEvidenceValid: <Bool>,
      fileValid: <Bool>,
      interfaceValid: <Bool>,
      metaEvidenceJSON: <Object>
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
        metaEvidenceJSON: {"fileURI": "/ipfs/...", ...}
      }

-----------------------------------------------------------------------------

getRuling()
=====================

.. code-block:: javascript

    archon.arbitrable.getRuling(contractAddress, arbitratorAddress, disputeID, options={});

Fetch the ruling of a dispute from the ``Ruling`` event log.

----------
Parameters
----------

:contractAddress: - ``String``: The address of the arbitrable contract.
:arbitratorAddress: - ``String``: The address of the arbitrator contract.
:disputeID: - ``Number``: The unique identifier of the dispute.
:options: - ``Object``: Optional parameters.

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

``Number`` - The ruling of the dispute.

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
    > 2
