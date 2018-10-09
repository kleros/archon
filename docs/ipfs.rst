.. include:: include_announcement.rst

=========================
IPFS Links and Validation
=========================

Many users will want to use decentralized file storage for their arbitrable DApps
and will store ``Evidence`` and ``MetaEvidence`` on ``IPFS``.

There are several things to keep in mind when using ``IPFS`` with ``Archon``

------------------------------------------------------------------------------

IPFS Gateways
===============

Most browsers do not currently support interacting with the ``ipfs`` network directly.
Therefore in order to fetch data from the ``ipfs`` network we need to use an IPFS Gateway,
which is an ``http`` protocol address that returns data from the ``ipfs`` network.

It is important that you choose a gateway that you trust, as a malicious gateway can
return invalid data. Please head the warning below:

.. warning:: Archon considers data returned directly from a valid ``ipfs`` URI pre-validated. This is because hash validation is built into the protocol. As we need to use gateways to interact with the ``ipfs`` network at this time, `MAKE SURE YOU SET A GATEWAY THAT YOU TRUST`, or otherwise re-validate your ``ipfs`` hashes yourself.

The default gateway set is ``https://gateway.ipfs.io``. This is the gateway provided by the Protocol Labs staff.

To set a custom gateway, use ``archon.setIpfsGateway(uri)``.
See documentation on setting a gateway :ref:`here <set-ipfs-gateway>`

IPFS URIs
=====================

``IPFS`` URIs are recognized in any of these formats:

1) ``/ipfs/Qm...../foo/bar``
2) ``ipfs:/ipfs/Qm...../foo/bar``
3) ``fs:/ipfs/Qm...../foo/bar``

Gateway URI's == Bad
====================

It is not recommended that you link directly to an ``IPFS`` gateway as the ``fileURI``
in Evidence or MetaEvidence. It will not be able to be verified using Archon without
a custom hashing function. The ``IPFS`` protocol does transformations on the data before hashing,
therefore a hash can not be verified naively using the resulting ``IPFS`` multihash
and the original file contents. In addition ``IPFS`` data should be able to be fetched
by any gateway or node in the network, and a user should be able to use any gateway or node
that they trust. Therefore hardcoding a gateway, which may not be trusted by the consumer,
would require additional validation regardless.

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

``Not Recommended:``

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
