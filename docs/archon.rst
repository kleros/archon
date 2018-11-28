.. _archon:

.. include:: include_announcement.rst

======
Archon
======

    Class

This is the main class of Archon.

.. code-block:: javascript

    var Archon = require('@kleros/archon');

    > Archon.modules
    > Archon.utils
    > Archon.version

------------------------------------------------------------------------------

Archon.modules
=====================

    Property of Archon class

.. code-block:: javascript

    Archon.modules

Will return an object with the classes of all major sub modules, to be able to instantiate them manually.

-------
Returns
-------

``Object``: A list of modules:
    - ``Arbitrator`` - ``Function``: The module for interacting with Arbitrator contracts. See :ref:`archon.arbitrator <arbitrator>` for more.
    - ``Arbitrable`` - ``Function``: The module for interacting with Arbitrable contracts. See :ref:`archon.arbitrable <arbitrable>` for more.

-------
Example
-------

.. code-block:: javascript

    Archon.modules
    > {
        Arbitrator: Arbitrator function(provider),
        Arbitrable: Arbitrable function(provider)
    }

------------------------------------------------------------------------------

Archon.version
==============

    Property of Archon class and instance of archon

.. code-block:: javascript

    Archon.version
    archon.version

Contains the version of the ``archon`` container object.

-------
Returns
-------

``String``: The current version.

-------
Example
-------

.. code-block:: javascript

    archon.version;
    > "0.1.0"



------------------------------------------------------------------------------


Archon.utils
=====================

    Property of Archon class and instance of archon

.. code-block:: javascript

    Archon.utils
    archon.utils

Utility functions are also exposes on the ``Archon`` class object directly.

See :ref:`archon.utils <utils>` for more.


------------------------------------------------------------------------------

new Archon()
============

.. code-block:: javascript

    new Archon(ethereumProvider, ipfsGatewayURI='https://gateway.ipfs.io')


----------
Parameters
----------

1) ``ethereumProvider`` - ``String|Object``: The provider object or URI of the Ethereum provider.

2) ``ipfsGatewayURI`` - ``String``: The URI of a trusted ``IPFS`` gateway for fetching files from the IPFS network.

-------
Example
-------

Instantiate Archon as an object to have access to all initialized modules.

.. code-block:: javascript

    var Archon = require('@kleros/archon');

    // "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
    var archon = new Archon('ws://some.local-or-remote.node:8546');

    > archon.arbitrator
    > archon.arbitrable
    > archon.utils
    > archon.version

------------------------------------------------------------------------------

archon.setProvider()
=====================

.. code-block:: javascript

    archon.setProvider(myProvider)
    archon.arbitrable.setProvider(myProvider)
    archon.arbitrator.setProvider(myProvider)
    ...

Will change the ethereum provider.

.. note:: If called on the ``archon`` class it will update the provider for all submodules. ``archon.arbitrable``, ``archon.arbitrator``, etc.

----------
Parameters
----------

1. ``myProvider`` - ``Object|String``: A provider object or URI.

-------
Example
-------

.. code-block:: javascript

    var Archon = require('archon');
    var archon = new Archon('http://localhost:8545');

    // change provider for all submodules
    archon.setProvider('ws://localhost:8546');
    // or
    archon.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));

    // change provider for arbitrator
    archon.arbitrator.setProvider('https://mainnet.infura.io/')

------------------------------------------------------------------------------

.. _set-ipfs-gateway:

archon.setIpfsGateway()
=======================

.. code-block:: javascript

    archon.setIpfsGateway(ipfsGatewayURI)

Will change the ``IPFS`` gateway environment variable.

----------
Parameters
----------

1. ``ipfsGatewayURI`` - ``Object``: A URI to a trusted IPFS gateway .

-------
Example
-------

.. code-block:: javascript

    var Archon = require('archon');
    var archon = new Archon('http://localhost:8545');

    // change IPFS gateway
    archon.setIpfsGateway('https://cloudflare-ipfs.com/');
