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

.. tip:: By default, IPFS uses ``sha2-256``. Many ethereum hashes are ``keccak-256``.

.. warning:: Solidity uses a different implementation of the ``keccak-256`` algorithm. Hashes generated from smart contracts will need a ``customHashFn`` to verify.

.. note:: All insignificant whitespace should be removed from JSON files before hashing. You can use ``JSON.stringify`` to remove whitespace.

If a different hashing algorithm was used, pass it in the desired function with ``customHashFn``. The function should expect a single string parameter.

A full list of possible algorithms and multicodes can be found `here
<https://github.com/multiformats/multihash/blob/master/hashtable.csv/>`_.
