validateFileFromURI()
=====================

.. code-block:: javascript

    archon.utils.validateFileFromURI(fileURI, options={});

Takes a the URI of the file and validates the hash. In order for to validate the hash,
the original ``multihash`` must be included as:

1. The suffix of the URI (e.g. ``https://file-uri/QmUQMJbfiQYX7k6SWt8xMpR7g4vwtAYY1BTeJ8UY8JWRs9``)
2. As a member of the ``options`` parameter (e.g. ``options.hash = 'QmUQMJbfiQYX7k6SWt8xMpR7g4vwtAYY1BTeJ8UY8JWRs9'``)
3. In the resulting file JSON using the key ``selfHash``

----------
Parameters
----------

:fileURI: - ``String``: The URI where the file can be fetched. Currently only support protocols: ``http(s)://``, ``/ipfs/``
:options: - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
hash          string  The original hash to compare the file against.
strictHashes  bool    If true, an error will throw if hash validations fail.
customHashFn  fn      A custom hash function to use to validate the file.
============  ======  ======================================================

-------
Returns
-------

``Object`` - The file as well as if the file is valid

.. code-block:: javascript

    {
      file: <String|Object>,
      isValid: <Bool>
    }

-------
Example
-------

.. code-block:: javascript

    archon.utils.validateFileFromURI(
      'https://s3.us-east-2.amazonaws.com/kleros-examples/exampleEvidence.txt',
      {
        hash: 'Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj'
      }
    ).then(data => {
      console.log(data)
    })
    > {
      file: 'This is an example evidence file. Here we could have...',
      isValid: true
    }

-----------------------------------------------------------------------------

validMultihash()
=====================

.. code-block:: javascript

    archon.utils.validMultihash(multihashHex, file, customHashFn=null);

Verify if the ``multihash`` of a file matches the file contents.

.. include:: include_supported_hashes.rst

----------
Parameters
----------

:multihashHex: - ``String``: The base58 multihash hex string.
:file: - ``Object|String``: The raw File or JSON object we are verifying the hash of.
:customHashFn: - ``Function``: ``<optional>`` A custom hashing algorithm used to generate original hash.

-------
Returns
-------

``Bool`` - If the provided hash and file are valid.

-------
Example
-------

.. code-block:: javascript

    archon.utils.validMultihash(
      '',
      {}
    )
    > true

-----------------------------------------------------------------------------

multihashFile()
=====================

.. code-block:: javascript

    archon.utils.multihashFile(file, multicode, customHashFn=null);

Generate the base58 multihash hex of a file

.. include:: include_supported_hashes.rst

----------
Parameters
----------

:file: - ``Object|String``: The raw File or JSON object to hash
:multicode: - ``Number``: The multihash hashing algorithm identifier.
:customHashFn: - ``Function``: ``<optional>`` A custom hashing algorithm used to generate the hash.

-------
Returns
-------

``String`` - base58 multihash of file.

-------
Example
-------

.. code-block:: javascript

    archon.utils.multihashFile(
      {},
      0x1B // 27 => keccak-256
    )
    > ""
