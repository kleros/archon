.. include:: include_announcement.rst

=============================================
archon - Ethereum Arbitration Standard API
=============================================

Archon is a javascript library written to make it easy to interact with Arbitrable and
Arbitrator contacts. In particular, Archon can be used to take care of a lot of the hash validation
work that is part of the Evidence Standard (ERC ___).

Archon can be used with all Arbitrable and Arbitrator contracts that follow the
ERC 792 standard and has the functionality to interact with all standardized methods.

To get up to speed on the standards please reference:

`ERC 792 Arbitration Standard
<https://github.com/ethereum/EIPs/issues/792/>`_.

ERC ___ Evidence Standard

`Implementation of an Arbitrable Contract
<https://github.com/kleros/kleros-interaction/blob/master/contracts/standard/arbitration/ArbitrableTransaction.sol/>`_.


`Implementation of an Arbitrator Contract
<https://github.com/kleros/kleros-interaction/blob/master/contracts/standard/arbitration/CentralizedArbitrator.sol/>`_.

Contents:

:ref:`Keyword Index <genindex>`, :ref:`Search Page <search>`

.. toctree::
   :maxdepth: 2
   :caption: User Documentation

   getting-started
   hashing
   ipfs

.. toctree::
    :maxdepth: 2
    :caption: API Reference

    archon
    archon-arbitrable
    archon-arbitrator
    archon-utils
