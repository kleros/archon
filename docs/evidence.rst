=================
Evidence Examples
=================

Here are some examples of how you can use Archon to submit and retrieve evidence.
In these examples we will assume we are using an ``Arbitrable`` contract that has a function:

.. code-block:: guess

    function submitEvidence(string _evidence) public {
        ...
        emit Evidence(_arbitrator, _disputeID, msg.sender, _evidence);
    }

------------------------------------------------------------------------------

Submit and Fetch Evidence
=========================

This example demonstrates how to submit evidence, as per the Evidence Standard,
and how to retrieve the Evidence using ``Archon``.

In this example we will use an example evidence file hosted here:
https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt

---------------------------------
Part 1: Create Evidence JSON File
---------------------------------

.. code-block:: javascript

    var Archon = require('eth-archon');
    var fs = require('fs');
    var path = require('path');

    // initialize Archon. By default it uses IPFS gateway https://gateway.ipfs.io
    var archon = new Archon("https://mainnet.infura.io");

    // First we need the hash of our evidence file. Download the file and hash it.
    var file = fs.readFileSync(path.resolve(__dirname, "./exampleEvidence.txt")).toString();

    var evidenceHash = archon.utils.multihashFile(
      file,
      0x1B // keccak-256
    );

    console.log(evidenceHash); // Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj

    // Now we can construct our EvidenceJSON from the Evidence Standard
    var evidenceJSON = {
      fileURI: "https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt",
      fileHash: evidenceHash,
      name: "Example Evidence",
      description: "This evidence shows how to properly utilize hashing and Archon to submit valid evidence!"
    }

    // Write our JSON to a file so we can host it with IPFS
    fs.writeFileSync(path.resolve(__dirname, "./exampleEvidence.json"), JSON.stringify(evidenceJSON));

---------------------------------------
Part 2: Host with IPFS and get the hash
---------------------------------------

.. note:: If it is not hosted via IPFS make sure to use the multihash as the suffix of the URI or include ``selfHash`` in the ``JSON``.

.. code-block:: bash

    ipfs add -r exampleEvidence.json
    > added QmdBNTwDazHsYXk9xW9JnM4iVGpdUnZni1DS4pyF3adKq1 exampleEvidence.json

---------------------------
Part 3: Submit the evidence
---------------------------

.. code-block:: javascript

    var Web3 = require("web3");
    // You will need to submit your transaction from a node or wallet that has funds to pay gas fees.
    var web3 = new Web3(<My Node URI>);

    // Load the arbitrable contract to submit our evidence
    // See web3 docs for more information on interacting with your contract
    var contractInstance = new web3.eth.Contract(<My Contract ABI>, <My Contract Address>);
    // Call submit evidence using the IPFS hash from our JSON file
    contractInstance.methods.submitEvidence(
      '/ipfs/QmdBNTwDazHsYXk9xW9JnM4iVGpdUnZni1DS4pyF3adKq1'
    ).send({
      from: <My Account>,
      gas: 500000
    });

-------------------------------------------
Part 4: Retrieve Evidence from the contract
-------------------------------------------

.. code-block:: javascript

    var Archon = require("eth-archon");
    var archon = new Archon("https://mainnet.infura.io");

    archon.arbitrable.getEvidence(
      <My Contract Address>,
      <Arbitrator Address>,
      <Dispute ID>
    ).then(evidence => {
      console.log(evidence)
    });

    > [{
      evidenceJSON: {
        fileURI: "https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt",
        fileHash: "Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj",
        name: "Example Evidence",
        Description: "This evidence shows how to properly utilize hashing and Archon to submit valid evidence!"
      },
      evidenceValid: true,
      fileValid: true,
      submittedBy: <My Account>,
      submittedAt: <Timestamp>
    }]

------------------------------------------------------------------------------

Fetch MetaEvidence for Dispute
==============================

This example demonstrates how to retrieve the MetaEvidence for a dispute using ``Archon``.

.. code-block:: javascript

    var Archon = require('eth-archon');

    // initialize Archon. By default it uses IPFS gateway https://gateway.ipfs.io
    var archon = new Archon("https://mainnet.infura.io");

    // Fetch the event log emitted by the Arbitrable contract when a dispute is raised
    archon.arbitrable.getDispute(
      "0x91697c78d48e9c83b71727ddd41ccdc95bb2f012", // arbitrable contract address
      "0x211f01e59b425253c0a0e9a7bf612605b42ce82c", // arbitrator contract address
      23 // dispute unique identifier
    ).then(disputeLog => {
      // use the metaEvidenceID to fetch the MetaEvidence event log
      archon.arbitrable.getMetaEvidence(
        "0x91697c78d48e9c83b71727ddd41ccdc95bb2f012", // arbitrable contract address
        disputeLog.metaEvidenceID
      ).then(metaEvidenceData => {
        console.log(metaEvidenceData)
      })
    })

    > {
      metaEvidenceValid: true,
      fileValid: true,
      interfaceValid: true,
      metaEvidenceJSON: {"fileURI": "/ipfs/...", ...},
      submittedAt: 1539025000,
      blockNumber: 6503570,
      transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
    }
