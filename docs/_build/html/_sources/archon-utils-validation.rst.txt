validateFileFromURI()
=====================

.. code-block:: javascript

    archon.utils.validateFileFromURI(fileURI, options={});

Takes a the URI of the file and validates the hash. In order for to validate the hash,
the original ``multihash`` must be included as:

1. The suffix of the URI (e.g. ``https://file-uri/QmUQMJbfiQYX7k6SWt8xMpR7g4vwtAYY1BTeJ8UY8JWRs9``)
2. As a member of the ``options`` parameter (e.g. ``options.hash = 'https://file-uri/QmUQMJbfiQYX7k6SWt8xMpR7g4vwtAYY1BTeJ8UY8JWRs9'``)
3. In the resulting file JSON using the key ``selfHash``

----------
Parameters
----------

:fileURI: - ``String``: The URI where the file can be fetched. Currently only support protocols: ``http://``, ``ipfs://``
:options: - ``Object``: Optional parameters.

-------
Returns
-------

``Object`` - The file as well as if the file is valid

.. code-block:: javascript

    {
      file: {},
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
