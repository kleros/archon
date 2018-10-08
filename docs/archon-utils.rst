.. _utils:

.. include:: include_announcement.rst

============
archon.utils
============

This package provides utility functions that can be used to validate hashes of ``Evidence`` and ``MetaEvidence``

.. note:: If using ``/ipfs/...`` URIs the environment variable ``IPFS_GATEWAY_URI`` must be set so that data can be fetched and validated from the IPFS network.

.. warning:: It is not recommended that you link directly to an ``IPFS`` gateway in the evidence because it will not be able to be verified without a custom hashing function. The ``IPFS`` protocol does transformations on the data before hashing, therefore a hash can not be verified naively using the resulting ``IPFS`` multihash and the original file contents.

------------------------------------------------------------------------------

.. include:: archon-utils-validation.rst
