
.. include:: include_announcement.rst

================
Hashing Examples
================

Here are some examples of evidence hashing and validation using archon. To see
the full specification of Evidence and MetaEvidence see ERC ___ <link>

------------------------------------------------------------------------------

Hash and Validate Hosted Evidence
=================================

In this example we will use an example evidence file hosted here:
https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt

.. code-block:: javascript

    var Archon = require('eth-archon');
    var fs = require('fs');

    var file = fs.readFileSync("exampleEvidence.txt").toString();

    var evidenceHash = Archon.utils.multihashFile(
      file,
      0x1B // keccak-256
    );

    console.log(evidenceHash); // Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj

    Archon.utils.validateFileFromURI(
      'https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt',
      { hash: evidenceHash }
    ).then(data => {
      console.log(data.isValid); // true
    })

------------------------------------------------------------------------------

Hash and Validate Local Evidence
=================================

In this example we will use an example evidence file hosted here:
https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt

.. code-block:: javascript

    var Archon = require('eth-archon');
    var fs = require('fs');

    var file = fs.readFileSync("exampleEvidence.txt").toString();

    var evidenceHash = Archon.utils.multihashFile(
      file,
      0x1B // keccak-256
    );

    console.log(evidenceHash); // Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj

    console.log(Archon.utils.validMultihash(
      evidenceHash
      file,
    ); // true

------------------------------------------------------------------------------

Custom Hash Functions
=====================

If you would like to use a custom hashing function in your multihash you can pass
one to the hashing functions. You might want to do this in cases where you used a non-standard
implementation of the hashing algorithm, or where there needs to be some data transformations
before you apply the hashing algorithm, as is the case with `IPFS` hashes.
This is only for the initial hashing algorithm in the multihash.

------------------------------
Example -- Solidity keccak-256
------------------------------

Solidity uses a non standard implementation of the keccak-256 hashing algorithm.
Therefore if we are using hashes produced by a smart contract we might need to
validate using a custom hashing function.

.. code-block:: javascript

    var Archon = require('eth-archon');
    var Web3 = require('web3')

    var nonStandardSha3Hash = Archon.utils.multihashFile(
      '12345',
      0x1B, // keccak-256
      Web3.utils.soliditySha3 // custom hash function
    );

    console.log(nonStandardSha3Hash); // 4ZqgPBxZrZkSXnTBm8G162mXVCNNbWrZa25CcvfGtQV1pRHH6X8vfLi89RKTA4c6tyfQsD5vzGvJozs24XvcLysiC3U6b

    // Use the standard keccak-256 hashing algorithm
    console.log(Archon.utils.validMultihash(
      '12345',
      nonStandardSha3Hash
    )) // false

    // Use the solidity sha3 implementation
    console.log(Archon.utils.validMultihash(
      '12345',
      nonStandardSha3Hash,
      Web3.utils.soliditySha3
    )) // true

------------------------------------------------------------------------------

Supported Hashing Algorithms and Hashcodes
==========================================

.. include:: include_supported_hashes.rst
