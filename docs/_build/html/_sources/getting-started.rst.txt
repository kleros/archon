
.. include:: include_announcement.rst

===============
Getting Started
===============

1. Install Archon from NPM

.. code-block:: javascript

    yarn add eth-archon

2. Import Archon into your project

.. code-block:: javascript

    var Archon = require('Archon')

3. Initialize an instance of Archon using an Ethereum Provider and an IPFS Gateway.

.. code-block:: javascript

    var archon = new Archon('https://mainnet.infura.io', 'https://gateway.ipfs.io')

.. note:: A provider is needed so that the codebase knows how to connect to the ethereum network. You can use a connection to your own node, or to a hosted node such as infura. ``web3.js`` will make RPC calls to the provider to fetch data from the blockchain.

.. note:: This sets the environment variable ``IPFS_GATEWAY_URI``. A gateway is needed to access ``IPFS`` files that might be referenced in evidence or metaEvidence.

Now you are all set! Use your ``archon`` object to interact with ``arbitrable``
and ``arbitrator`` contracts on the blockchain.
