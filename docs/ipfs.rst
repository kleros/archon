.. include:: include_announcement.rst

=========================
IPFS Links and Validation
=========================

Many users will want to use decentralized file storage for their arbitrable DApps
and will store ``Evidence`` and ``MetaEvidence`` on ``IPFS``.

There are several things to keep in mind when using ``IPFS`` with ``Archon``

------------------------------------------------------------------------------

Using ``/ipfs/`` URIs
=====================

It is not recommended that you link directly to an ``IPFS`` gateway as the ``fileURI``
in Evidence or MetaEvidence. It will not be able to be verified using Archon without
a custom hashing function. The ``IPFS`` protocol does transformations on the data before hashing,
therefore a hash can not be verified naively using the resulting ``IPFS`` multihash
and the original file contents.

Archon treats all ``http(s)://`` URI's the same, and will try to validate the hash
as if they were standard hashes.

``Bad:``

.. code-block:: javascript

    const fileURI = "https://gateway.ipfs.io/ipfs/QmQhJRhvwgBPRdee18pK6QDECysFPuvuDLZMSeexdUfEiH"
    const evidenceJSON = {
      fileURI
    }

    archon.utils.validateFileFromURI(fileURI).then(data => {console.log(data.isValid)})
    > false

``Good:``

.. code-block:: javascript

    const evidenceJSON = {
      fileURI: "/ipfs/QmQhJRhvwgBPRdee18pK6QDECysFPuvuDLZMSeexdUfEiH"
    }

    archon.setIpfsGateway('https://gateway.ipfs.io')
    archon.utils.validateFileFromURI(fileURI).then(data => {console.log(data.isValid)})
    > true

``Acceptable:``

.. code-block:: javascript

    const ipfsHasher = data => {...}
    const fileURI = "https://gateway.ipfs.io/ipfs/QmQhJRhvwgBPRdee18pK6QDECysFPuvuDLZMSeexdUfEiH"
    const evidenceJSON = {
      fileURI
    }

    archon.utils.validateFileFromURI(
      fileURI
      { customHashFn: ipfsHasher }
    ).then(data => {
      console.log(data.isValid)
    })
    > true
