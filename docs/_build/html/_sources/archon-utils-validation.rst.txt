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

:fileURI: - ``String``: The URI where the file can be fetched. Currently only support protocols: ``http://``, ``ipfs://``
:options: - ``Object``: Optional parameters.

The options parameter can include:

============  ======  ======================================================
Key           Type    Description
============  ======  ======================================================
hash          string  The original hash to compare the file against.
strictHashes  bool    If true, an error will throw if hash validations fail.
============  ======  ======================================================

-------
Returns
-------

``Object`` - The file as well as if the file is valid

.. code-block:: javascript

    {
      file: <file data or JSON>,
      isValid: true
    }

-------
Example
-------

.. code-block:: javascript

    // From a JSON interface object
    archon.utils.validateFileFromURI(
      '',
      {
        hash: ''
      }
    )
    > {
      file: {},
      isValid: true
    }

-----------------------------------------------------------------------------

validMultihash()
=====================

.. code-block:: javascript

    archon.utils.validMultihash(multihashHex, file, customHashFn=null);

Verify if the ``multihash`` of a file matches the file contents.

Supported hashing algorithms:

==============  =========
Name            Multicode
==============  =========
sha3-512        0x14
sha3-384        0x15
sha3-256        0x16
sha3-224        0x17
keccak-224      0x1A
keccak-256      0x1B
keccak-384      0x1C
keccak-512      0x1D
==============  =========

If a different hashing algorithm was used, pass it in the desired function with ``customHashFn``. The function should expect a single string parameter.

A full list of possible algorithms and multicodes can be found `here
<https://github.com/multiformats/multihash/blob/master/hashtable.csv/>`_.

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

    // From a JSON interface object
    archon.utils.validateFileFromURI(
      '',
      {}
    )
    > true

-----------------------------------------------------------------------------

hashFile()
=====================

.. code-block:: javascript

    archon.utils.hashFile(file, multicode, customHashFn=null);

Generate the base58 multihash hex of a file

Supported multicodes:

==============  =========
Name            Multicode
==============  =========
sha3-512        0x14
sha3-384        0x15
sha3-256        0x16
sha3-224        0x17
keccak-224      0x1A
keccak-256      0x1B
keccak-384      0x1C
keccak-512      0x1D
==============  =========

If you would like to use a different hashing algorithm, pass the multicode with the desired ``customHashFn``. The function should expect a single string parameter.

A full list of possible algorithms and multicodes can be found `here
<https://github.com/multiformats/multihash/blob/master/hashtable.csv/>`_.

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

    // From a JSON interface object
    archon.utils.hashFile(
      {},
      0x1B // 27 => keccak-256
    )
    > ""
