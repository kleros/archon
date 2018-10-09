=================
Evidence Examples
=================

Here are some examples of how you can use Archon to submit and retrieve evidence.
In these example we will assume we are using an ``Arbitrable`` contract that has a function:

.. code-block:: guess

    function submitEvidence(string _evidence) public {
        ...
        emit Evidence(_arbitrator, _disputeID, msg.sender, _evidence);
    }

------------------------------------------------------------------------------

Submit and Fetch Evidence
=========================

This example is meant to demonstrate how to submit evidence as per the Evidence Standard
and how to retrieve the Evidence using ``Archon`` using 4 example code blocks.

In this example we will use an example evidence file hosted here:
https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt

---------------------------------
Part 1: Create Evidence JSON File
---------------------------------

.. code-block:: javascript

    var Archon = require('eth-archon');
    var fs = require('fs');

    // initialize Archon. By default it uses IPFS gateway https://gateway.ipfs.io
    var archon = new Archon("https://mainnet.infura.io");

    // First we need the hash of our evidence file. Download the file and hash it.
    var file = fs.readFileSync("./exampleEvidence.txt").toString();

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
      Description: "This evidence shows how to properly utilize hashing and Archon to submit valid evidence!"
    }

    // Write our JSON to a file so we can save it with IPFS
    fs.writeFile('exampleEvidence.json', JSON.stringify(evidenceJSON), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });

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
    var web3 = new Web3("https://mainnet.infura.io");

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
      <My Contract Address>
    ).then(evidence => {
      console.log(evidence)
    })

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
