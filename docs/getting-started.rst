
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

3. Initialize an instance of Archon using an Ethereum Provider.

.. code-block:: javascript

    var archon = new Archon('https://mainnet.infura.io')

.. note:: A provider is needed so that the codebase knows how to connect to the ethereum network. You can use a connection to your own node, or to a hosted node such as infura. ``web3.js`` will make RPC calls to the provider to fetch data from the blockchain.

4. Set an environment variable for your IPFS gateway <optional>

If you are using IPFS URI's (ipfs://) you need to specify a trusted gateway so that
the data can be fetched from the IPFS network.

.. code-block:: javascript

    process.env.IPFS_GATEWAY_URI = "https://cloudflare-ipfs.com/ipfs/"

Now you are all set! Use your ``archon`` object to interact with ``arbitrable``
and ``arbitrator`` contracts on the blockchain.
