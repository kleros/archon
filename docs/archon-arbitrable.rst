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
      evidenceValid: <Bool>, // validity of evidence found at evidenceJSON.fileURI
      fileValid: <Bool>, // validity of evidenceJSON
      evidenceJSON: <Object>,
      submittedBy: <String>,
      submittedAt: <Number> // epoch timestamp in seconds
    }

-------
Example
-------

.. code-block:: javascript

    archon.arbitrable.getEvidence(
      '',
      {
        strictHashes: true
      }
    )
    > [{
        evidenceValid: true,
        fileValid: true,
        evidenceJSON: {},
        submittedBy: '0x00000000',
        submittedAt:
      },
      {
        evidenceValid: true,
        fileValid: true,
        evidenceJSON: {},
        submittedBy: '0x00000000',
        submittedAt:
      }
    ]

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

``Object[]`` - An array of objects containing the ``MetaEvidenceJSON`` and the validity of the the hashes

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
      '',
      1,
      {
        strictHashes: false
      }
    )
    > [{
        metaEvidenceValid: true,
        fileValid: true,
        interfaceValid: false,
        metaEvidenceJSON: {}
      }
    ]

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
      '',
      '',
      1
    )
    > 2
