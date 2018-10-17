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

1) ``fileURI`` - ``String``: The URI where the file can be fetched. Currently only support protocols: ``http(s)://``, ``/ipfs/``

2) ``options`` - ``Object``: Optional parameters.

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

``Promise.<Object>`` - Promise that resolves to an object containing the file as well as if the file is valid

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

.. note:: Hashes should be base58 encoded ``Strings``

.. include:: include_supported_hashes.rst

----------
Parameters
----------

1) ``multihashHex`` - ``String``: The base58 multihash hex string.

2) ``file`` - ``Object|String``: The raw File or JSON object we are verifying the hash of.

3) ``customHashFn`` - ``Function``: ``<optional>`` A custom hashing algorithm used to generate original hash.

-------
Returns
-------

``Bool`` - If the provided hash and file are valid.

-------
Example
-------

.. code-block:: javascript

    archon.utils.validMultihash(
      'Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj',
      'This is an example evidence file. Here we could have some document...'
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

1) ``file`` - ``Object|String``: The raw File or JSON object to hash

2) ``multicode`` - ``Number``: The multihash hashing algorithm identifier.

3) ``customHashFn`` - ``Function``: ``<optional>`` A custom hashing algorithm used to generate the hash.

-------
Returns
-------

``String`` - base58 multihash of file.

-------
Example
-------

.. code-block:: javascript

    archon.utils.multihashFile(
      'This is an example evidence file. Here we could have some document...',
      0x1B // 27 => keccak-256
    )
    > "Bce1WTQa7bfrJMFdEJuWV2xHsmj5JcDDyqBKGXu6PHZsn5e5oxkJ8cMJcuFDK1VsQYBtfrzgWkKCovWSvsacgN1XTj"
