.. include:: include_announcement.rst

====================
Evidence Walkthrough
====================

The best way to try things out is to learn by doing. So we have created a test
smart contract, deployed on the Kovan test network, that you can use to test out
submitting and fetching evidence. Here we will go through the process step by step.
Feel free to follow along.

The test smart contract we will be using includes all of the standard Evidence related
events that you would have in your smart contract. You can create a "dispute" in this
contract and submit MetaEvidence and Evidence. There is no arbitrator for these disputes
so they will always remain open.

The contract can be found here: https://kovan.etherscan.io/address/0x3b43c3f69c5d06cc00575e3c5ab8723b129c494d#code

------------------------------------------------------------------------------

Step 1: Create MetaEvidence
===========================

The first thing needed in order to create a dispute is to create the MetaEvidence.
In our example we are going to be going along with a hypothetical escrow dispute.

---------------------------------
Part 1: Create Evidence JSON File
---------------------------------

.. code-block:: javascript

    var Archon = require('@kleros/archon');
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

    var evidenceJSONHash = archon.utils.multihashFile(
      evidenceJSON,
      0x1B // keccak-256
    )

    console.log(evidenceJSONHash) //

    // Write our JSON to a file so we can host it with IPFS
    fs.writeFileSync(path.resolve(__dirname, `./${evidenceJSONHash}`), JSON.stringify(evidenceJSON));

---------------------------------------
Part 2: Host with IPFS and get the hash
---------------------------------------

.. note:: If it is not hosted via IPFS make sure to use the multihash as the suffix of the URI or include ``selfHash`` in the ``JSON``.

.. code-block:: bash

    ipfs add -r exampleEvidence.json
    > added QmdBNTwDazHsYXk9xW9JnM4iVGpdUnZni1DS4pyF3adKq1 exampleEvidence.json

--------------------------------------------------------------------------------
Part 2 (Alternate): Host on any cloud provider (e.g. AWS) using hash as filename
--------------------------------------------------------------------------------

.. note:: If it is not hosted via IPFS make sure to use the multihash as the suffix of the URI or include ``selfHash`` in the ``JSON``.

.. code-block:: bash

    # Add file to aws
    aws s3 cp ./<hash> s3://kleros-examples/<hash>

    # file can be found at https://s3.us-east-2.amazonaws.com/kleros-examples/<hash>

---------------------------
Part 3: Submit the evidence
---------------------------

.. code-block:: javascript

    var Web3 = require("web3");
    // You will need to submit your transaction from a node or wallet that has funds to pay gas fees.
    var web3 = new Web3("https://mainnet.infura.io");

    // Load the arbitrable contract to submit our evidence
    // See web3 docs for more information on interacting with your contract
    var contractInstance = new web3.eth.Contract(<My Contract ABI>, <My Contract Address>);

    // Call submit evidence using the IPFS hash from our JSON file
    contractInstance.methods.submitEvidence(
      '/ipfs/QmdBNTwDazHsYXk9xW9JnM4iVGpdUnZni1DS4pyF3adKq1'
    ).send({
      from: "0x54FcB2536b3E1DD222aD2c644535244000b377cd",
      gas: 500000
    });

    // OR

    // Call submit evidence using the hosted URI
    contractInstance.methods.submitEvidence(
      'https://s3.us-east-2.amazonaws.com/kleros-examples/<hash>'
    ).send({
      from: "0x54FcB2536b3E1DD222aD2c644535244000b377cd",
      gas: 500000
    });

-------------------------------------------
Part 4: Retrieve Evidence from the contract
-------------------------------------------

.. code-block:: javascript

    var Archon = require("@kleros/archon");
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

    var Archon = require('@kleros/archon');

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
