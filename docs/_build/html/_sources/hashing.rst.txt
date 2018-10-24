
.. include:: include_announcement.rst

================
Hashing Examples
================

Here are some examples of evidence hashing and validation using archon. To see
the full specification of Evidence and MetaEvidence see `ERC 1497 <https://github.com/ethereum/EIPs/issues/1497>`_.

.. note:: All insignificant whitespace should be removed from JSON files before hashing. You can use ``JSON.stringify`` to remove whitespace.

------------------------------------------------------------------------------

Hash and Validate Hosted Evidence
=================================

In this example we will use an example evidence file hosted here:
https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt

.. code-block:: javascript

    var Archon = require('@kleros/archon');
    var fs = require('fs');
    var path = require('path');

    // Bring in our evidence file downloaded from the link above to obtain the hash
    var file = fs.readFileSync(path.resolve(__dirname, "./exampleEvidence.txt")).toString();

    // Hash the file using keccak-256
    var evidenceHash = Archon.utils.multihashFile(
      file,
      0x1B // keccak-256
    );

    console.log(evidenceHash); // Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj

    // Validate the hosted file against the hash we just produced.
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

    var Archon = require('@kleros/archon');
    var fs = require('fs');
    var path = require('path');

    // Bring in our evidence file downloaded from the link above to obtain the hash
    var file = fs.readFileSync(path.resolve(__dirname, "./exampleEvidence.txt")).toString();

    // Hash the file using keccak-256
    var evidenceHash = Archon.utils.multihashFile(
      file,
      0x1B // keccak-256
    );

    console.log(evidenceHash); // Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj

    // Validate the original file against the hash we just produced.
    console.log(Archon.utils.validMultihash(
      evidenceHash
      file,
    ); // true

------------------------------------------------------------------------------

.. _customHashFn:

Custom Hash Functions
=====================

If you would like to use a custom hashing function in your multihash you can pass
one as an optional last parameter to ``multihashFile`` and ``validMultihash`` or
as ``option.customHashFn`` to ``validateFileFromURI``. For full documentation on these
individual functions see :ref:`archon.utils <utils>`.
You might want to do this in cases where you used a non-standard
implementation of the hashing algorithm, or where there needs to be some data transformations
before you apply the hashing algorithm, as is the case with `IPFS` hashes.
This is only for the initial hashing algorithm in the multihash. Your hashing function should
take a single ``String`` argument and return a ``String`` that is the hex representation of the hash.

------------------------------
Example -- Solidity keccak-256
------------------------------

Solidity uses a non standard implementation of the keccak-256 hashing algorithm.
Therefore if we are using hashes produced by a smart contract we might need to
validate using a custom hashing function.

.. code-block:: javascript

    var Archon = require('@kleros/archon');
    var Web3 = require('web3')

    // Hash our "file" ('12345') using the soliditySha3.
    var nonStandardSha3Hash = Archon.utils.multihashFile(
      '12345',
      0x1B, // keccak-256
      Web3.utils.soliditySha3 // custom hash function
    );

    console.log(nonStandardSha3Hash); // 4ZqgPBxZrZkSXnTBm8G162mXVCNNbWrZa25CcvfGtQV1pRHH6X8vfLi89RKTA4c6tyfQsD5vzGvJozs24XvcLysiC3U6b

    // Validate using the standard keccak-256 hashing algorithm.
    console.log(Archon.utils.validMultihash(
      nonStandardSha3Hash,
      '12345'
    )) // false

    // Validate using the solidity sha3 implementation.
    console.log(Archon.utils.validMultihash(
      nonStandardSha3Hash,
      '12345',
      Web3.utils.soliditySha3
    )) // true

------------------------------------------------------------------------------

Hash Validation Troubleshooting
===============================

Here are some common mistakes that can cause your hashes to fail validation:

* Did not remove all insignificant whitespace before hashing JSON. This means all newlines and spaces in between your JSON values.
* Using a non-standard hash function. Out of the box, Archon supports these :ref:`hashing algorithms <supportedHashes>`. They are from the javascript library `js-sha3 <https://github.com/emn178/js-sha3>`_. If you used a different hashing algorithm you will need to pass an implementation of it to Archon. See :ref:`Custom Hashing <customHashFn>`.
* ``sha2`` vs ``sha3``. Many libraries will specify their hashes are ``sha256`` without specifying if they are sha2 or sha3. ``sha2-256`` and ``sha3-256`` are different hashing algorithms and use different hashcodes.
* Not using the ``base58`` representation of the multihash hash. Multihash hashes can be expressed in many bases. Archon is expecting ``base58`` hashes.
* Did not include the original hash in some format to ``validateFileFromURI``. Archon accepts hashes as the name of the file with no file type extension or using the property ``selfHash`` if the file is JSON. Otherwise if you have an alternate method of obtaining the hash pass it using ``options.hash``.

------------------------------------------------------------------------------

.. _supportedHashes:

Supported Hashing Algorithms and Hashcodes
==========================================

.. include:: include_supported_hashes.rst
